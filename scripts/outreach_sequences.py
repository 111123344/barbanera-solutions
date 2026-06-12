"""
outreach_sequences.py
=====================
Cold email copy engine for Barbanera Solutions.

Three service tracks, each with 3-touch sequences:
  - AI Receptionist       → targets any local service biz missing a website or booking system
  - Performance Lead Gen  → targets businesses with low reviews (proving low lead volume)
  - AI Consulting         → targets businesses with a website but no automation signals

Each email is dynamically personalized using:
  - {first_name}     : guessed from business name (first word)
  - {business_name}  : full business name
  - {city}           : city
  - {niche}          : HVAC Contractor / Roofing Contractor
  - {digital_status} : Missing Website / No Booking System / Has Booking System
  - {gap_line}       : a dynamic sentence that calls out their specific gap

This file is imported by send_outreach.py — it does NOT send anything.
"""

from dataclasses import dataclass


# ---------------------------------------------------------------------------
# Sequence data model
# ---------------------------------------------------------------------------

@dataclass
class Email:
    subject: str
    body: str   # Plain-text. Use \n for line breaks.


@dataclass
class Sequence:
    track: str              # e.g. "AI Receptionist"
    touch_1: Email          # Day 1 — the opener
    touch_2: Email          # Day 4 — the follow-up
    touch_3: Email          # Day 9 — the break-up


# ---------------------------------------------------------------------------
# Dynamic gap line builder
# ---------------------------------------------------------------------------

def build_gap_line(digital_status: str, business_name: str) -> str:
    """
    Returns a single sentence that calls out the specific digital gap
    detected for this lead. Used in email openers to create instant relevance.
    """
    if digital_status == "Missing Website":
        return (
            f"I noticed {business_name} doesn't have a website — which means "
            f"you're likely losing booked jobs to competitors who show up on Google before you do."
        )
    elif digital_status == "No Booking System":
        return (
            f"I checked {business_name}'s website — you don't have an online booking system, "
            f"which means every lead that hits your site after hours either calls a competitor "
            f"or just disappears."
        )
    else:
        return (
            f"I was looking at {business_name} online and noticed there might be "
            f"room to convert more of your inbound traffic into booked appointments."
        )


def guess_first_name(business_name: str) -> str:
    """
    Attempts to extract a human first name from the business name.
    Falls back to 'there' for generic business names.
    """
    generic_words = {
        "hvac", "roofing", "heating", "cooling", "air", "roof", "services",
        "solutions", "contractors", "pro", "plus", "group", "inc", "ltd",
        "company", "co", "systems", "mechanical", "climate", "comfort",
        "the", "and", "&", "of",
    }
    words = business_name.split()
    for word in words:
        clean = word.strip(".,&()-").lower()
        if clean not in generic_words and len(clean) > 2 and clean.isalpha():
            return word.strip(".,&()-").capitalize()
    return "there"


# ---------------------------------------------------------------------------
# TRACK 1: AI Receptionist
# Target: Missing Website OR No Booking System (any niche)
# Pitch: Never miss a call. 24/7 bilingual voice AI books appointments for them.
# ---------------------------------------------------------------------------

AI_RECEPTIONIST_SEQUENCE = Sequence(
    track="AI Receptionist",

    touch_1=Email(
        subject="Your {niche} business is losing calls right now",
        body="""Hi {first_name},

{gap_line}

I'm Ahmad from Barbanera Solutions. We install AI voice receptionists for {niche} businesses in {city} — a system that answers every inbound call 24/7, qualifies the lead, and books the appointment directly into your calendar. Fully bilingual in English and French.

No more missed calls. No more voicemails that never get called back. No more losing a $5,000 job because someone called at 8pm and your competitors picked up first.

The businesses we work with typically see 8–15 more booked appointments per month within the first 30 days.

Would it be worth a 10-minute call this week to show you exactly how it would work for {business_name}?

Just reply here or grab a time directly: https://calendly.com/ahmadafiffadel/30min

Ahmad Fadel
Barbanera Solutions | Montreal, QC
438-935-1711
"""),

    touch_2=Email(
        subject="Re: Your {niche} business is losing calls right now",
        body="""Hi {first_name},

Sending a quick follow-up in case my last message got buried.

Quick question: how many calls does {business_name} miss per week — after hours, during jobs, or when your crew is slammed?

Most {niche} contractors we talk to in {city} lose 3–7 qualified leads a week this way. At an average job value of even $2,000, that's $6,000–$14,000 in pipeline walking out the door every single week.

Our AI receptionist fixes that problem completely. It's not a chatbot. It's a voice system that sounds human, handles objections, and books the call while you're on a roof or under an HVAC unit.

15 minutes to see a live demo?

https://calendly.com/ahmadafiffadel/30min

Ahmad
Barbanera Solutions
438-935-1711
"""),

    touch_3=Email(
        subject="Closing the loop — {business_name}",
        body="""Hi {first_name},

I'll keep this short — I've reached out a couple of times and haven't heard back, so I'll assume the timing isn't right.

I'll leave you with one thought: the next time a customer calls {business_name} after hours and gets voicemail, that job is probably going to whoever picks up.

If that ever becomes a problem worth solving, here's where to find us:
https://calendly.com/ahmadafiffadel/30min

Wishing you a strong season,

Ahmad Fadel
Barbanera Solutions
438-935-1711
"""),
)


# ---------------------------------------------------------------------------
# TRACK 2: Performance Lead Gen
# Target: Low review count (10–60) = low volume = not getting enough leads
# Pitch: Done-for-you pipeline. We send warm appointments. They just close.
# ---------------------------------------------------------------------------

LEAD_GEN_SEQUENCE = Sequence(
    track="Performance Lead Gen",

    touch_1=Email(
        subject="Getting more {niche} jobs in {city} — quick idea",
        body="""Hi {first_name},

I was researching {niche} businesses in {city} and came across {business_name}.

{gap_line}

I run Barbanera Solutions — we do done-for-you lead generation exclusively for contractors. We build and operate the entire acquisition system: the outreach, the follow-up, the qualification. You don't touch any of it. We send you booked appointments with homeowners who are ready to move.

Our guarantee: 5 booked appointments in your first 30 days or you don't pay. Zero risk.

This isn't ads management or a lead list. We own the full pipeline and we're accountable for the result.

If you want to see exactly what the system looks like for a {niche} in {city}, I can walk you through it in 10 minutes.

https://calendly.com/ahmadafiffadel/30min

Ahmad Fadel
Barbanera Solutions | Montreal, QC
438-935-1711
"""),

    touch_2=Email(
        subject="Re: Getting more {niche} jobs in {city}",
        body="""Hi {first_name},

Following up on my note from a few days ago.

Most {niche} contractors I talk to in {city} have the same problem: referrals are inconsistent, word-of-mouth has a ceiling, and they don't have time to figure out lead generation on top of running jobs.

That's exactly the gap we fill. You focus on the work. We keep the calendar full.

Here's what makes us different from every marketing agency you've heard from:
— We don't charge management fees
— We get paid on results (booked appointments)
— We guarantee 5 calls in 30 days or you owe nothing

Would 10 minutes this week be worth it to see the numbers?

https://calendly.com/ahmadafiffadel/30min

Ahmad
438-935-1711
"""),

    touch_3=Email(
        subject="Last note — {business_name}",
        body="""Hi {first_name},

Last follow-up, I promise.

I only wanted to reach out because the profile of {business_name} matches exactly the kind of contractor we get the best results for — and I'd rather send you a few extra jobs than not say anything.

If the timing is ever right, the door is open:
https://calendly.com/ahmadafiffadel/30min

Either way, hope the season is treating you well.

Ahmad Fadel
Barbanera Solutions
438-935-1711
"""),
)


# ---------------------------------------------------------------------------
# TRACK 3: AI Consulting & Integration
# Target: Has Booking System (digitally aware, ready for next level)
# Pitch: You have the foundation. Let's automate the operations layer.
# ---------------------------------------------------------------------------

AI_CONSULTING_SEQUENCE = Sequence(
    track="AI Consulting & Integration",

    touch_1=Email(
        subject="{business_name} — automating the ops side",
        body="""Hi {first_name},

I was looking at {business_name} online — you've clearly put work into your digital presence, which puts you ahead of most {niche} businesses in {city}.

The next unlock for contractors at your stage usually isn't more leads — it's eliminating the manual overhead that eats into margins as you scale: dispatch coordination, follow-up sequences, quote tracking, review requests, re-engagement of old leads.

At Barbanera Solutions, we build custom AI infrastructure that handles all of that automatically. Not off-the-shelf software — bespoke systems built around how {business_name} specifically operates, integrated directly into whatever CRM or tools you already use.

The contractors we work with typically recover 10–15 hours of admin per week and see a 20–30% lift in close rate from faster follow-up alone.

Worth a 10-minute conversation to see what the opportunity looks like for your business?

https://calendly.com/ahmadafiffadel/30min

Ahmad Fadel
Barbanera Solutions | Montreal, QC
438-935-1711
"""),

    touch_2=Email(
        subject="Re: {business_name} — automating the ops side",
        body="""Hi {first_name},

Quick follow-up.

One thing I find with established {niche} businesses in {city}: the bottleneck almost never turns out to be leads. It's the stuff between the lead and the invoice — the calls that don't get returned fast enough, the quotes that sit, the customers who don't get a follow-up after a year.

We automate that entire layer. It runs in the background 24/7 so your team focuses purely on billable work.

No long-term contracts. We build it, we integrate it, we hand you the keys.

Happy to show you a 10-minute walkthrough of what this looks like in practice:
https://calendly.com/ahmadafiffadel/30min

Ahmad
438-935-1711
"""),

    touch_3=Email(
        subject="Closing the loop — {business_name}",
        body="""Hi {first_name},

One last note before I stop following up.

If {business_name} ever hits a point where the operations feel harder to manage as you grow — the follow-up slipping, the admin piling up — that's usually when a conversation with us becomes a no-brainer.

We'll be here when the timing is right:
https://calendly.com/ahmadafiffadel/30min

Thanks for your time.

Ahmad Fadel
Barbanera Solutions
438-935-1711
"""),
)


# ---------------------------------------------------------------------------
# Sequence selector
# ---------------------------------------------------------------------------

def get_sequence(niche: str, digital_status: str) -> Sequence:
    """
    Picks the right track for a lead based on their niche and digital status.

    Routing logic:
    - Missing Website or No Booking System → AI Receptionist (highest-urgency pain)
    - Has Booking System → split by review count signal:
        We don't have review count here so we route by digital status alone.
        Has Booking System = digitally aware → AI Consulting track.

    Caller can override by passing a custom track name if needed.
    """
    if digital_status in ("Missing Website", "No Booking System"):
        # Split between Receptionist and Lead Gen — alternate by niche
        # so we're not sending the same pitch to every lead.
        if "HVAC" in niche:
            return AI_RECEPTIONIST_SEQUENCE
        else:
            return LEAD_GEN_SEQUENCE
    else:
        return AI_CONSULTING_SEQUENCE


def render_email(email: Email, context: dict) -> tuple[str, str]:
    """
    Renders subject and body with the provided context dict.
    Returns (subject, body) as strings.
    """
    subject = email.subject.format(**context)
    body = email.body.format(**context)
    return subject, body


def build_context(row: dict) -> dict:
    """
    Builds the template context dict from a CSV row (as produced by
    ontario_lead_scraper.py).

    Expected CSV columns:
        Business Name, Niche, City, Phone Number, Rating,
        Review Count, Website URL, Digital Status
    """
    business_name = row.get("Business Name", "").strip()
    digital_status = row.get("Digital Status", "").strip()

    return {
        "first_name": guess_first_name(business_name),
        "business_name": business_name,
        "niche": row.get("Niche", "contractor").strip(),
        "city": row.get("City", "your city").strip(),
        "digital_status": digital_status,
        "gap_line": build_gap_line(digital_status, business_name),
    }
