"""
send_outreach.py
================
Reads ontario_golden_leads.csv, matches each lead to the right email
sequence, and sends personalized cold emails via SendGrid.

Tracks every sent email in a local SQLite database (outreach_log.db)
so you never contact the same person twice across runs.

Setup:
    pip install sendgrid
    export SENDGRID_API_KEY="SG...."
    export FROM_EMAIL="ahmad@barbanera.com"
    export FROM_NAME="Ahmad Fadel"

Usage:
    # Dry run — prints emails to terminal, sends nothing
    python send_outreach.py --dry-run

    # Send Touch 1 to all leads not yet contacted
    python send_outreach.py --touch 1

    # Send Touch 2 to everyone who got Touch 1 at least 4 days ago
    python send_outreach.py --touch 2

    # Send Touch 3 to everyone who got Touch 2 at least 5 days ago
    python send_outreach.py --touch 3

    # Limit sends per run (respects SendGrid free tier: 100/day)
    python send_outreach.py --touch 1 --limit 80

    # Use a different leads CSV
    python send_outreach.py --touch 1 --csv my_leads.csv
"""

import argparse
import csv
import logging
import os
import random
import sqlite3
import time
from datetime import datetime, timedelta
from pathlib import Path

from outreach_sequences import (
    build_context,
    get_sequence,
    render_email,
    Sequence,
)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY", "")
FROM_EMAIL = os.environ.get("FROM_EMAIL", "ahmad@barbanera.com")
FROM_NAME = os.environ.get("FROM_NAME", "Ahmad Fadel")

DEFAULT_CSV = "ontario_golden_leads.csv"
DB_FILE = "outreach_log.db"

# Minimum days between touches
TOUCH_GAP_DAYS = {
    2: 4,   # Touch 2 sent >= 4 days after Touch 1
    3: 5,   # Touch 3 sent >= 5 days after Touch 2
}

# Random delay range between sends to mimic human behaviour (seconds)
MIN_SEND_DELAY = 45
MAX_SEND_DELAY = 90

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

def init_db(conn: sqlite3.Connection) -> None:
    conn.execute("""
        CREATE TABLE IF NOT EXISTS outreach_log (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            business_name   TEXT NOT NULL,
            email           TEXT NOT NULL,
            niche           TEXT,
            city            TEXT,
            digital_status  TEXT,
            track           TEXT,
            touch           INTEGER NOT NULL,
            subject         TEXT,
            sent_at         TEXT NOT NULL,
            status          TEXT NOT NULL   -- 'sent' | 'dry_run' | 'error'
        )
    """)
    conn.commit()


def already_sent(conn: sqlite3.Connection, email: str, touch: int) -> bool:
    row = conn.execute(
        "SELECT 1 FROM outreach_log WHERE email = ? AND touch = ? AND status != 'error'",
        (email, touch),
    ).fetchone()
    return row is not None


def last_touch_date(conn: sqlite3.Connection, email: str, touch: int) -> datetime | None:
    row = conn.execute(
        "SELECT sent_at FROM outreach_log WHERE email = ? AND touch = ? AND status != 'error' "
        "ORDER BY sent_at DESC LIMIT 1",
        (email, touch),
    ).fetchone()
    if row:
        return datetime.fromisoformat(row[0])
    return None


def log_send(
    conn: sqlite3.Connection,
    business_name: str,
    email: str,
    niche: str,
    city: str,
    digital_status: str,
    track: str,
    touch: int,
    subject: str,
    status: str,
) -> None:
    conn.execute(
        """
        INSERT INTO outreach_log
            (business_name, email, niche, city, digital_status, track, touch, subject, sent_at, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            business_name,
            email,
            niche,
            city,
            digital_status,
            track,
            touch,
            subject,
            datetime.utcnow().isoformat(),
            status,
        ),
    )
    conn.commit()


# ---------------------------------------------------------------------------
# SendGrid sender
# ---------------------------------------------------------------------------

def send_via_sendgrid(
    to_email: str,
    to_name: str,
    subject: str,
    body: str,
) -> bool:
    """
    Sends a plain-text email via SendGrid HTTP API.
    Returns True on success, False on failure.
    """
    try:
        # Import here so missing package gives a clear error only when actually sending
        import sendgrid
        from sendgrid.helpers.mail import Mail, Email as SGEmail, To, Content

        sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)
        message = Mail(
            from_email=SGEmail(FROM_EMAIL, FROM_NAME),
            to_emails=To(to_email, to_name),
            subject=subject,
            plain_text_content=Content("text/plain", body),
        )
        response = sg.client.mail.send.post(request_body=message.get())
        if response.status_code in (200, 202):
            return True
        log.error("SendGrid returned status %d", response.status_code)
        return False

    except Exception as exc:  # noqa: BLE001
        log.error("SendGrid exception: %s", exc)
        return False


# ---------------------------------------------------------------------------
# Eligibility check per touch
# ---------------------------------------------------------------------------

def is_eligible_for_touch(
    conn: sqlite3.Connection,
    email: str,
    touch: int,
) -> bool:
    """
    Touch 1: lead has never been contacted.
    Touch 2: Touch 1 was sent >= TOUCH_GAP_DAYS[2] days ago, Touch 2 not yet sent.
    Touch 3: Touch 2 was sent >= TOUCH_GAP_DAYS[3] days ago, Touch 3 not yet sent.
    """
    if already_sent(conn, email, touch):
        return False

    if touch == 1:
        return not already_sent(conn, email, 1)

    # For touches 2 and 3, the previous touch must have been sent at least N days ago
    prev_touch = touch - 1
    if not already_sent(conn, email, prev_touch):
        return False   # Previous touch hasn't gone out yet

    prev_date = last_touch_date(conn, email, prev_touch)
    if prev_date is None:
        return False

    gap = TOUCH_GAP_DAYS.get(touch, 4)
    return datetime.utcnow() >= prev_date + timedelta(days=gap)


# ---------------------------------------------------------------------------
# Main send loop
# ---------------------------------------------------------------------------

def run(
    touch: int,
    csv_path: str,
    dry_run: bool,
    limit: int,
) -> None:
    if not dry_run and not SENDGRID_API_KEY:
        raise SystemExit(
            "ERROR: Set SENDGRID_API_KEY in your environment:\n"
            "  export SENDGRID_API_KEY='SG....'"
        )

    leads_file = Path(csv_path)
    if not leads_file.exists():
        raise SystemExit(f"ERROR: CSV not found at '{csv_path}'. Run the scraper first.")

    conn = sqlite3.connect(DB_FILE)
    init_db(conn)

    sent_count = 0
    skipped_count = 0
    error_count = 0

    with open(leads_file, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        leads = list(reader)

    log.info(
        "Loaded %d leads from %s. Running Touch %d (%s).",
        len(leads),
        csv_path,
        touch,
        "DRY RUN" if dry_run else "LIVE",
    )

    for row in leads:
        if limit and sent_count >= limit:
            log.info("Reached send limit of %d. Stopping.", limit)
            break

        business_name = row.get("Business Name", "").strip()
        email_addr = row.get("Email", "").strip()  # Column not in scraper — see note below
        niche = row.get("Niche", "").strip()
        city = row.get("City", "").strip()
        digital_status = row.get("Digital Status", "").strip()

        # ----------------------------------------------------------------
        # NOTE: The scraper does not capture email addresses because
        # Google Places API does not return them. You have two options:
        #
        # Option A (Manual): Add an "Email" column to the CSV yourself
        #   after doing a quick Hunter.io / Apollo.io lookup per lead.
        #
        # Option B (Automated): Run the email finder extension below —
        #   see find_emails.py (coming in next iteration).
        #
        # For now, rows without an email are skipped with a clear log.
        # ----------------------------------------------------------------
        if not email_addr:
            log.debug("Skipping '%s' — no email address in CSV.", business_name)
            skipped_count += 1
            continue

        if not is_eligible_for_touch(conn, email_addr, touch):
            log.debug("Skipping '%s' — not eligible for Touch %d.", business_name, touch)
            skipped_count += 1
            continue

        # Build context and pick sequence
        context = build_context(row)
        sequence: Sequence = get_sequence(niche, digital_status)

        touch_email = {1: sequence.touch_1, 2: sequence.touch_2, 3: sequence.touch_3}[touch]
        subject, body = render_email(touch_email, context)

        if dry_run:
            print("\n" + "=" * 70)
            print(f"TO      : {email_addr}  ({business_name})")
            print(f"TRACK   : {sequence.track}  |  TOUCH {touch}")
            print(f"SUBJECT : {subject}")
            print("-" * 70)
            print(body)
            log_send(conn, business_name, email_addr, niche, city, digital_status,
                     sequence.track, touch, subject, "dry_run")
            sent_count += 1
            continue

        # Live send
        log.info(
            "Sending Touch %d → %s (%s) [%s]",
            touch, business_name, email_addr, sequence.track,
        )
        success = send_via_sendgrid(
            to_email=email_addr,
            to_name=business_name,
            subject=subject,
            body=body,
        )

        if success:
            log_send(conn, business_name, email_addr, niche, city, digital_status,
                     sequence.track, touch, subject, "sent")
            sent_count += 1
            log.info("  ✓ Sent.")
        else:
            log_send(conn, business_name, email_addr, niche, city, digital_status,
                     sequence.track, touch, subject, "error")
            error_count += 1
            log.warning("  ✗ Failed to send.")

        # Randomised delay to avoid spam filters
        delay = random.uniform(MIN_SEND_DELAY, MAX_SEND_DELAY)
        log.info("  Sleeping %.0fs before next send…", delay)
        time.sleep(delay)

    conn.close()

    log.info("=" * 60)
    log.info("Run complete.")
    log.info("  Sent    : %d", sent_count)
    log.info("  Skipped : %d", skipped_count)
    log.info("  Errors  : %d", error_count)
    log.info("=" * 60)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Send personalized cold email sequences to scraped leads.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--touch",
        type=int,
        choices=[1, 2, 3],
        required=True,
        help="Which touch to send (1 = opener, 2 = follow-up, 3 = break-up).",
    )
    parser.add_argument(
        "--csv",
        default=DEFAULT_CSV,
        help=f"Path to leads CSV (default: {DEFAULT_CSV}).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print emails to terminal without sending anything.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Max emails to send this run (0 = no limit). Use 80 on SendGrid free tier.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    run(
        touch=args.touch,
        csv_path=args.csv,
        dry_run=args.dry_run,
        limit=args.limit,
    )
