"""
send_now.py
===========
Sends all 5 personalized cold emails from barbanera.solutions@gmail.com
using Gmail SMTP with an App Password.

SETUP (2 minutes, one time):
1. Go to: https://myaccount.google.com/apppasswords
2. Sign in to barbanera.solutions@gmail.com
3. App name: type anything (e.g. "outreach")
4. Click Create → copy the 16-character password shown
5. Run this script:

   python send_now.py --app-password "xxxx xxxx xxxx xxxx"

That's it. All 5 emails send with randomized delays between them.
Add --dry-run to preview everything in the terminal first without sending.
"""

import argparse
import random
import smtplib
import ssl
import time
from dataclasses import dataclass
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

FROM_EMAIL = "barbanera.solutions@gmail.com"
FROM_NAME  = "Ahmad Fadel | Barbanera Solutions"
CALENDLY   = "https://calendly.com/ahmadafiffadel/30min"

# Randomised delay between sends — looks human, avoids spam triggers
MIN_DELAY = 60   # seconds
MAX_DELAY = 120  # seconds


@dataclass
class Lead:
    name: str
    first_name: str
    city: str
    email: str
    subject: str
    body: str


# ---------------------------------------------------------------------------
# The 5 leads + fully personalized emails
# ---------------------------------------------------------------------------

LEADS = [

    Lead(
        name="M.H. General Roofing",
        first_name="there",  # no owner name found — "Hi there" works fine
        city="Hamilton, ON",
        email="general.inc@gmail.com",
        subject="Hamilton roofers are getting your jobs right now",
        body=f"""Hi,

I was looking up roofing contractors in Hamilton and noticed M.H. General Roofing doesn't have any Google reviews showing up — which tells me you're running almost entirely on referrals and word of mouth.

That works until it doesn't. Every homeowner in Hamilton who searches "roofing contractor" after a storm goes straight to whoever shows up on Google — and right now, that's not you.

I run Barbanera Solutions. We do two things for contractors like you:

1. We install an AI voice receptionist that answers every call 24/7, qualifies the lead, and books the appointment into your calendar — so you never miss a job because you were on a roof or couldn't pick up.

2. We run a done-for-you lead generation system that fills your pipeline with booked appointments. No ads to manage, no tech to touch. We send you the calls.

Guarantee: 5 booked appointments in your first 30 days or you pay nothing.

Worth 10 minutes this week?

{CALENDLY}

Ahmad Fadel
Barbanera Solutions | Montreal, QC
438-935-1711""",
    ),

    Lead(
        name="Ontario's Roof Kings",
        first_name="there",
        city="Hamilton, ON",
        email="ontariosroofkings@gmail.com",
        subject="Are you answering every call, Ontario's Roof Kings?",
        body=f"""Hi,

I came across Ontario's Roof Kings while looking at roofing contractors in the Hamilton area.

Quick question: how many calls does your business miss in a week — after hours, when the crew is mid-job, or when you're just slammed?

For most roofing contractors the answer is 3 to 7 calls a week. At even $4,000 per job, that's $12,000–$28,000 in lost revenue every week — jobs going to whoever picked up first.

I run Barbanera Solutions. We install AI voice receptionists for local contractors — sounds completely human, answers every call 24/7 in both English and French, qualifies the lead, and books the appointment into your calendar while you're up on a roof.

No more voicemails that go cold. No more jobs lost because a competitor answered faster.

The contractors we work with add 8–12 more booked appointments per month in the first 30 days.

Worth 10 minutes to see a live demo?

{CALENDLY}

Ahmad Fadel
Barbanera Solutions | Montreal, QC
438-935-1711""",
    ),

    Lead(
        name="Capelas Roofing",
        first_name="Silvestri",
        city="Hamilton, ON",
        email="info@capelasroofing.com",
        subject="Capelas Roofing — 28 years of work, 8 Google reviews",
        body=f"""Hi Silvestri,

I was looking at Capelas Roofing online — GAF Certified, A+ BBB, operating since 1996. Clearly a serious operation that's been doing quality work for nearly three decades.

But you have 8 Google reviews.

That gap is costing you jobs. Every homeowner in Hamilton searching for a roofer right now is filtering by reviews. Contractors with 50 reviews and 4.2 stars are getting calls over you — not because they do better work, but because they show up louder online.

I run Barbanera Solutions. We do done-for-you lead generation for roofing contractors — we build the outreach system, run it entirely, and deliver pre-qualified homeowners ready to book. You don't touch the tech or manage anything. We send you the appointments.

Guarantee: 5 booked appointments in 30 days or you pay nothing.

After 28 years of building a reputation for quality, you deserve a pipeline that reflects it.

Worth 10 minutes?

{CALENDLY}

Ahmad Fadel
Barbanera Solutions | Montreal, QC
438-935-1711""",
    ),

    Lead(
        name="Sameday Roofing",
        first_name="there",
        city="Hamilton, ON",
        email="samedayroofing@gmail.com",
        subject='"Sameday" — are you actually answering same-day?',
        body=f"""Hi,

The name Sameday Roofing is a strong brand promise — and exactly the right message for Hamilton homeowners who need a roofer fast.

Here's the problem: that promise breaks the moment a call goes to voicemail.

I run Barbanera Solutions. We install AI voice receptionists for roofing contractors — a system that answers every inbound call in seconds, 24/7, qualifies the lead, and books the appointment into your calendar automatically. The caller never hits voicemail. Your "sameday" promise stays intact no matter when they call.

For a company built around speed, this is a natural fit.

The contractors we work with capture 8–12 more booked jobs per month just by eliminating after-hours and mid-job missed calls.

10 minutes to see how it works?

{CALENDLY}

Ahmad Fadel
Barbanera Solutions | Montreal, QC
438-935-1711""",
    ),

    Lead(
        name="Orzech Heating & Cooling",
        first_name="Victor",
        city="London, ON",
        email="experts@orzechheating.ca",
        subject="Orzech Heating — scaling without adding headcount",
        body=f"""Hi Victor,

I was looking at Orzech Heating & Cooling — 62 reviews, 4.8 stars, 25 years serving London. That's a genuinely exceptional reputation for a family-run operation.

At that level, the bottleneck usually isn't leads or work quality. It's the operations layer — follow-ups that slip, quotes that sit too long, customers who don't get a re-engagement call after their annual service, admin that eats into your margin as you try to grow.

I run Barbanera Solutions. We build custom AI infrastructure for established contractors like Orzech — systems that automate follow-up sequences, quote tracking, review requests, and lead re-engagement. Built around how your business specifically operates, integrated into whatever tools you already use. Not off-the-shelf software. Bespoke.

The contractors we work with typically recover 10–15 admin hours per week and see a 20–30% lift in close rate from faster follow-up alone — without adding a single person to payroll.

Worth 10 minutes to explore what this looks like for Orzech?

{CALENDLY}

Ahmad Fadel
Barbanera Solutions | Montreal, QC
438-935-1711""",
    ),

]


# ---------------------------------------------------------------------------
# Warm-up emails — sent to real inboxes you control to build sender reputation
# before the cold outreach. Gmail needs to see opens and replies first.
# ---------------------------------------------------------------------------

WARMUP_TARGETS = [
    # Add 2–3 email addresses you personally control (other Gmail, Outlook, etc.)
    # These will receive a short plain email you should open AND reply to.
    # Example: "farahfadel06@gmail.com"
    # Leave this list empty to skip warm-up.
]

WARMUP_SUBJECTS = [
    "Quick check-in",
    "Testing something new",
    "Hey — can you reply to this?",
]

WARMUP_BODY = """Hey,

Just testing a new email account for Barbanera Solutions. Can you reply to this when you get a chance? Even just a "got it" works.

Thanks,
Ahmad"""


# ---------------------------------------------------------------------------
# SMTP sender
# ---------------------------------------------------------------------------

def build_message(to_email: str, to_name: str, subject: str, body: str) -> MIMEMultipart:
    msg = MIMEMultipart("alternative")
    msg["From"]    = f"{FROM_NAME} <{FROM_EMAIL}>"
    msg["To"]      = f"{to_name} <{to_email}>"
    msg["Subject"] = subject
    msg["Reply-To"] = FROM_EMAIL
    # Plain text only — higher deliverability than HTML for cold outreach
    msg.attach(MIMEText(body, "plain"))
    return msg


def send_email(
    smtp: smtplib.SMTP_SSL,
    to_email: str,
    to_name: str,
    subject: str,
    body: str,
    dry_run: bool,
) -> bool:
    if dry_run:
        print(f"\n{'='*65}")
        print(f"TO      : {to_email}")
        print(f"SUBJECT : {subject}")
        print(f"{'-'*65}")
        print(body)
        return True

    try:
        msg = build_message(to_email, to_name, subject, body)
        smtp.sendmail(FROM_EMAIL, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"  ✗ Failed: {e}")
        return False


def connect_smtp(app_password: str) -> smtplib.SMTP_SSL:
    context = ssl.create_default_context()
    smtp = smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context)
    smtp.login(FROM_EMAIL, app_password)
    return smtp


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def run(app_password: str, dry_run: bool, skip_warmup: bool) -> None:
    print(f"\nBarbanera Solutions — Cold Outreach Engine")
    print(f"Mode    : {'DRY RUN (nothing sent)' if dry_run else 'LIVE'}")
    print(f"Account : {FROM_EMAIL}")
    print(f"Time    : {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")

    smtp = None
    if not dry_run:
        print("Connecting to Gmail SMTP...")
        try:
            smtp = connect_smtp(app_password)
            print("✓ Connected.\n")
        except smtplib.SMTPAuthenticationError:
            print("\n✗ Authentication failed.")
            print("Make sure you generated a Gmail App Password (not your regular password).")
            print("Guide: https://myaccount.google.com/apppasswords\n")
            return

    # ── Step 1: Warm-up sends ──────────────────────────────────────────────
    if WARMUP_TARGETS and not skip_warmup:
        print(f"── WARM-UP PHASE ({len(WARMUP_TARGETS)} emails) ──")
        print("These go to addresses you control. OPEN and REPLY to them.\n")
        for i, target in enumerate(WARMUP_TARGETS):
            subj = WARMUP_SUBJECTS[i % len(WARMUP_SUBJECTS)]
            print(f"Sending warm-up → {target}")
            ok = send_email(smtp, target, "Friend", subj, WARMUP_BODY, dry_run)
            if ok and not dry_run:
                print("  ✓ Sent.")
            delay = random.randint(30, 60)
            if not dry_run:
                print(f"  Waiting {delay}s...")
                time.sleep(delay)
        print("\nWarm-up complete. IMPORTANT: open those emails and reply to them")
        print("before the cold sends go out. Waiting 3 minutes...\n")
        if not dry_run:
            time.sleep(180)
    else:
        if not skip_warmup:
            print("No warm-up targets set — skipping warm-up phase.")
            print("(Add your own email addresses to WARMUP_TARGETS in this script)\n")

    # ── Step 2: Cold outreach ──────────────────────────────────────────────
    print(f"── COLD OUTREACH PHASE ({len(LEADS)} emails) ──\n")
    sent = 0
    for lead in LEADS:
        print(f"[{sent+1}/{len(LEADS)}] Sending to {lead.name} ({lead.email})")
        ok = send_email(smtp, lead.email, lead.name, lead.subject, lead.body, dry_run)
        if ok and not dry_run:
            print(f"  ✓ Sent — '{lead.subject}'")
        sent += 1

        if sent < len(LEADS):
            delay = random.randint(MIN_DELAY, MAX_DELAY)
            if not dry_run:
                print(f"  Waiting {delay}s before next send...\n")
                time.sleep(delay)

    if smtp:
        smtp.quit()

    print(f"\n{'='*65}")
    print(f"Done. {sent} emails {'queued (dry run)' if dry_run else 'sent'}.")
    print(f"\nNEXT STEPS:")
    print(f"  • Set a reminder for 4 days from now to send follow-ups")
    print(f"  • Any reply asking about price → send the Calendly link only")
    print(f"  • Check spam folder for any bounces in 30 minutes")
    print(f"  Calendly: {CALENDLY}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Send Barbanera Solutions cold outreach")
    parser.add_argument(
        "--app-password",
        required=False,
        default="",
        help='Gmail App Password (16 chars). Get it at myaccount.google.com/apppasswords',
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print all emails to terminal without sending anything.",
    )
    parser.add_argument(
        "--skip-warmup",
        action="store_true",
        help="Skip warm-up phase and go straight to cold outreach.",
    )
    args = parser.parse_args()

    if not args.dry_run and not args.app_password:
        print("\nERROR: Provide your Gmail App Password with --app-password")
        print("Get one at: https://myaccount.google.com/apppasswords\n")
        raise SystemExit(1)

    run(
        app_password=args.app_password,
        dry_run=args.dry_run,
        skip_warmup=args.skip_warmup,
    )
