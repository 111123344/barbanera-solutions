"""
ontario_lead_scraper.py
=======================
Scrapes Google Maps Places API for HVAC and Roofing contractors across
major Ontario cities, filters by review count (10–60) and rating (≥3.5),
then enriches each lead with a digital gap check via BeautifulSoup.

Output: ontario_golden_leads.csv

Requirements:
    pip install requests beautifulsoup4 lxml

Usage:
    export GOOGLE_MAPS_API_KEY="your_key_here"
    python ontario_lead_scraper.py
"""

import csv
import logging
import os
import time
from dataclasses import dataclass, fields
from typing import Optional

import requests
from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

API_KEY = os.environ.get("GOOGLE_MAPS_API_KEY", "")

NICHES = [
    "HVAC Contractor",
    "Roofing Contractor",
]

CITIES = [
    "Toronto, Ontario",
    "Ottawa, Ontario",
    "Mississauga, Ontario",
    "Hamilton, Ontario",
    "London, Ontario",
]

# Sweet-spot filter thresholds
MIN_REVIEWS = 10
MAX_REVIEWS = 60
MIN_RATING = 3.5

# Booking-intent keywords to search on homepage HTML
BOOKING_KEYWORDS = [
    "book appointment",
    "book an appointment",
    "book online",
    "schedule",
    "calendly",
    "booksy",
    "housecall pro",
    "servicetitan",
    "acuityscheduling",
    "request a quote",
    "get a quote",
    "free estimate",
    "book now",
    "schedule now",
    "schedule service",
]

OUTPUT_FILE = "ontario_golden_leads.csv"
PLACES_NEARBY_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"

# Polite delay between every outbound request (API + scrape)
API_SLEEP = 2.0      # seconds between Places API pages
SCRAPE_SLEEP = 1.5   # seconds between website scrape attempts

# HTTP request timeout for website scraping
SCRAPE_TIMEOUT = 10  # seconds

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
# Data model
# ---------------------------------------------------------------------------

@dataclass
class Lead:
    business_name: str
    niche: str
    city: str
    phone: str
    rating: float
    review_count: int
    website_url: str
    digital_status: str  # Missing Website | No Booking System | Has Booking System


# ---------------------------------------------------------------------------
# Google Places API helpers
# ---------------------------------------------------------------------------

def search_places(query: str, page_token: Optional[str] = None) -> dict:
    """
    One call to the Places Text Search endpoint.
    Returns the raw JSON response dict.
    """
    params: dict = {"query": query, "key": API_KEY}
    if page_token:
        params["pagetoken"] = page_token

    resp = requests.get(PLACES_NEARBY_URL, params=params, timeout=10)
    resp.raise_for_status()
    return resp.json()


def fetch_all_places(niche: str, city: str) -> list[dict]:
    """
    Pages through all results (up to 3 pages = ~60 results) for a
    niche + city combination using next_page_token.
    """
    query = f"{niche} in {city}"
    log.info("Searching: %s", query)

    all_results: list[dict] = []
    page_token: Optional[str] = None
    page_num = 0

    while True:
        page_num += 1
        log.info("  → page %d", page_num)

        # Google requires a short pause before using a next_page_token
        if page_token:
            time.sleep(API_SLEEP)

        data = search_places(query, page_token)
        status = data.get("status", "")

        if status == "REQUEST_DENIED":
            raise RuntimeError(
                f"API key rejected: {data.get('error_message', 'no message')}"
            )
        if status not in ("OK", "ZERO_RESULTS"):
            log.warning("  Unexpected status '%s' — stopping pagination.", status)
            break

        results = data.get("results", [])
        all_results.extend(results)
        log.info("  Collected %d results so far.", len(all_results))

        page_token = data.get("next_page_token")
        if not page_token:
            break  # No more pages

        # Google mandates a delay before the token becomes valid
        time.sleep(API_SLEEP)

    return all_results


# ---------------------------------------------------------------------------
# Filter
# ---------------------------------------------------------------------------

def passes_filter(place: dict) -> bool:
    """Returns True only if the place meets the sweet-spot criteria."""
    rating = place.get("rating", 0)
    reviews = place.get("user_ratings_total", 0)
    return (
        rating >= MIN_RATING
        and MIN_REVIEWS < reviews < MAX_REVIEWS
    )


# ---------------------------------------------------------------------------
# Digital gap check
# ---------------------------------------------------------------------------

def check_digital_footprint(website_url: Optional[str]) -> str:
    """
    Returns one of three status strings:
      - "Missing Website"
      - "No Booking System"
      - "Has Booking System"
    """
    if not website_url:
        return "Missing Website"

    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0 Safari/537.36"
            ),
            "Accept-Language": "en-CA,en;q=0.9",
        }
        resp = requests.get(
            website_url, headers=headers, timeout=SCRAPE_TIMEOUT, allow_redirects=True
        )
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "lxml")
        page_text = soup.get_text(separator=" ").lower()

        for keyword in BOOKING_KEYWORDS:
            if keyword.lower() in page_text:
                log.debug("    Booking keyword found: '%s'", keyword)
                return "Has Booking System"

        return "No Booking System"

    except requests.exceptions.SSLError:
        log.warning("    SSL error on %s — treating as No Booking System", website_url)
        return "No Booking System"
    except requests.exceptions.ConnectionError:
        log.warning("    Connection error on %s — skipping website check", website_url)
        return "No Booking System"
    except requests.exceptions.Timeout:
        log.warning("    Timeout on %s — skipping website check", website_url)
        return "No Booking System"
    except Exception as exc:  # noqa: BLE001
        log.warning("    Unexpected scrape error for %s: %s", website_url, exc)
        return "No Booking System"


# ---------------------------------------------------------------------------
# Place → Lead mapper
# ---------------------------------------------------------------------------

def place_to_lead(place: dict, niche: str, city: str) -> Lead:
    website_url = place.get("website", "")

    log.info(
        "  Checking digital footprint for: %s",
        place.get("name", "Unknown"),
    )
    time.sleep(SCRAPE_SLEEP)
    digital_status = check_digital_footprint(website_url or None)
    log.info("    Status: %s", digital_status)

    return Lead(
        business_name=place.get("name", ""),
        niche=niche,
        city=city.split(",")[0],  # Store just the city name, not province
        phone=place.get("formatted_phone_number", place.get("international_phone_number", "")),
        rating=place.get("rating", 0.0),
        review_count=place.get("user_ratings_total", 0),
        website_url=website_url,
        digital_status=digital_status,
    )


# ---------------------------------------------------------------------------
# CSV export
# ---------------------------------------------------------------------------

CSV_HEADERS = [
    "Business Name",
    "Niche",
    "City",
    "Phone Number",
    "Rating",
    "Review Count",
    "Website URL",
    "Digital Status",
]

# Map dataclass field order → CSV header order
FIELD_NAMES = [f.name for f in fields(Lead)]


def write_csv(leads: list[Lead], filepath: str) -> None:
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(CSV_HEADERS)
        for lead in leads:
            writer.writerow([
                lead.business_name,
                lead.niche,
                lead.city,
                lead.phone,
                lead.rating,
                lead.review_count,
                lead.website_url,
                lead.digital_status,
            ])
    log.info("Saved %d leads → %s", len(leads), filepath)


# ---------------------------------------------------------------------------
# Priority sort (Missing Website first, then No Booking System, then Has)
# ---------------------------------------------------------------------------

PRIORITY = {
    "Missing Website": 0,
    "No Booking System": 1,
    "Has Booking System": 2,
}


def sort_leads(leads: list[Lead]) -> list[Lead]:
    return sorted(leads, key=lambda l: (PRIORITY.get(l.digital_status, 9), -l.rating))


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    if not API_KEY:
        raise SystemExit(
            "ERROR: Set your Google Maps API key in the environment:\n"
            "  export GOOGLE_MAPS_API_KEY='your_key_here'"
        )

    all_leads: list[Lead] = []
    seen_place_ids: set[str] = set()  # Deduplicate across overlapping searches

    for niche in NICHES:
        for city in CITIES:
            places = fetch_all_places(niche, city)
            log.info(
                "Fetched %d raw results for %s in %s. Applying filters…",
                len(places),
                niche,
                city,
            )

            qualified = [p for p in places if passes_filter(p)]
            log.info(
                "  %d / %d passed the sweet-spot filter (reviews %d–%d, rating ≥%.1f).",
                len(qualified),
                len(places),
                MIN_REVIEWS,
                MAX_REVIEWS,
                MIN_RATING,
            )

            for place in qualified:
                place_id = place.get("place_id", "")
                if place_id and place_id in seen_place_ids:
                    log.debug("  Skipping duplicate place_id: %s", place_id)
                    continue
                if place_id:
                    seen_place_ids.add(place_id)

                lead = place_to_lead(place, niche, city)
                all_leads.append(lead)

            # Breathe between city/niche combos
            time.sleep(API_SLEEP)

    sorted_leads = sort_leads(all_leads)

    # Summary breakdown
    missing  = sum(1 for l in sorted_leads if l.digital_status == "Missing Website")
    no_book  = sum(1 for l in sorted_leads if l.digital_status == "No Booking System")
    has_book = sum(1 for l in sorted_leads if l.digital_status == "Has Booking System")

    log.info("=" * 60)
    log.info("FINAL RESULTS: %d golden leads", len(sorted_leads))
    log.info("  🔴 Missing Website   : %d  (highest priority)", missing)
    log.info("  🟡 No Booking System : %d  (primary targets)", no_book)
    log.info("  🟢 Has Booking System: %d  (lower priority)", has_book)
    log.info("=" * 60)

    write_csv(sorted_leads, OUTPUT_FILE)


if __name__ == "__main__":
    main()
