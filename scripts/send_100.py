"""
send_100.py
===========
Sends personalized cold emails to 25 verified Ontario contractor leads
from barbanera.solutions@gmail.com via Gmail SMTP.

Each email is hyper-personalized: owner name, specific digital gap,
city, niche, and service track matched to their exact situation.

Run:
    python send_100.py --app-password "erqv rpeb rvvv pwli" --dry-run
    python send_100.py --app-password "erqv rpeb rvvv pwli"
"""

import argparse, random, smtplib, ssl, time
from dataclasses import dataclass
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

FROM_EMAIL = "barbanera.solutions@gmail.com"
FROM_NAME  = "Ahmad Fadel | Barbanera Solutions"
SIG = "\nAhmad Fadel\nBarbanera Solutions | Montreal, QC\n438-935-1711"
CAL = "https://calendly.com/ahmadafiffadel/30min"

MIN_DELAY, MAX_DELAY = 55, 110

@dataclass
class Lead:
    name: str
    first: str
    city: str
    email: str
    subject: str
    body: str

# ── TRACK TEMPLATES ──────────────────────────────────────────────────────────

def receptionist(name, first, city, gap_line):
    return (
        f"Missing calls is costing {name} real money",
        f"Hi {first},\n\n{gap_line}\n\nI run Barbanera Solutions. "
        f"We install AI voice receptionists for contractors in {city} — "
        f"a system that answers every call 24/7, sounds completely human in English and French, "
        f"qualifies the lead, and books the appointment into your calendar while you're on the job.\n\n"
        f"No more voicemails that go cold. No more jobs lost to whoever picked up faster.\n\n"
        f"The contractors we work with add 8–12 more booked jobs per month in the first 30 days. "
        f"Guaranteed, or you don't pay.\n\n"
        f"Worth 10 minutes to see a live demo?\n\n{CAL}{SIG}"
    )

def leadgen(name, first, city, gap_line):
    return (
        f"{name} — more booked jobs in {city} this month",
        f"Hi {first},\n\n{gap_line}\n\nI run Barbanera Solutions. "
        f"We do done-for-you lead generation for contractors — we build the system, run the outreach, "
        f"qualify every lead, and deliver pre-booked appointments directly to your calendar. "
        f"You don't touch the tech or manage a thing. We send you the calls.\n\n"
        f"Guarantee: 5 booked appointments in your first 30 days or you pay nothing.\n\n"
        f"10 minutes this week?\n\n{CAL}{SIG}"
    )

def consulting(name, first, city, gap_line):
    return (
        f"{name} — scaling operations without adding headcount",
        f"Hi {first},\n\n{gap_line}\n\nI run Barbanera Solutions. "
        f"We build custom AI infrastructure for established contractors — "
        f"automating follow-up sequences, quote tracking, review requests, and lead re-engagement. "
        f"Built around how {name} specifically operates, not off-the-shelf software.\n\n"
        f"The contractors we work with recover 10–15 admin hours per week and see a 20–30% lift "
        f"in close rate from faster follow-up alone — without adding a single person to payroll.\n\n"
        f"Worth 10 minutes?\n\n{CAL}{SIG}"
    )

# ── 25 VERIFIED LEADS ─────────────────────────────────────────────────────────

def make_leads():
    leads = []

    # ── HAMILTON — ROOFING ────────────────────────────────────────────────────

    s, b = receptionist(
        "M.H. General Roofing", "there", "Hamilton",
        "I looked up M.H. General Roofing on Google and found zero reviews — "
        "which tells me you're running entirely on word of mouth. "
        "Every homeowner in Hamilton who searches for a roofer after a storm goes straight to whoever shows up first. Right now that's not you."
    )
    leads.append(Lead("M.H. General Roofing", "there", "Hamilton, ON", "general.inc@gmail.com", s, b))

    s, b = receptionist(
        "Ontario's Roof Kings", "there", "Hamilton",
        "I came across Ontario's Roof Kings while researching roofing companies in Hamilton. "
        "Quick question: how many calls go to voicemail in a week when you're mid-job or after hours? "
        "For most roofers it's 3–7 calls — at $4,000 per job that's up to $28,000 a week going to whoever picked up first."
    )
    leads.append(Lead("Ontario's Roof Kings", "there", "Hamilton, ON", "ontariosroofkings@gmail.com", s, b))

    s, b = leadgen(
        "Capelas Roofing", "Silvestri", "Hamilton",
        "I was looking at Capelas Roofing — GAF Certified, A+ BBB, operating since 1996. "
        "Genuinely impressive credentials. But you only have 8 Google reviews. "
        "Contractors with 40 reviews and 4.2 stars are getting calls over you right now — not because they do better work, but because they show up louder online."
    )
    leads.append(Lead("Capelas Roofing", "Silvestri", "Hamilton, ON", "info@capelasroofing.com", s, b))

    s, b = receptionist(
        "Sameday Roofing", "there", "Hamilton",
        "The name 'Sameday Roofing' makes a strong promise — and it's exactly right for Hamilton homeowners who need fast help. "
        "That promise breaks the moment a call goes to voicemail. "
        "Our AI receptionist makes sure every call is answered in seconds, 24/7, so your brand promise actually holds."
    )
    leads.append(Lead("Sameday Roofing", "there", "Hamilton, ON", "samedayroofing@gmail.com", s, b))

    # ── HAMILTON — HVAC ───────────────────────────────────────────────────────

    s, b = receptionist(
        "MDM Mechanical", "Michael", "Hamilton",
        "I came across MDM Mechanical — by all accounts you run a tight, honest operation in Hamilton. "
        "But a quick look shows your website doesn't have an online booking system, "
        "which means leads hitting your site after business hours have no way to book without picking up the phone."
    )
    leads.append(Lead("MDM Mechanical", "Michael", "Hamilton, ON", "info@mdmmechanical.ca", s, b))

    s, b = receptionist(
        "Hamilton HVAC Inc", "Drew", "Hamilton",
        "I was looking at Hamilton HVAC Inc and noticed customers love working with you — the reviews mention you by name, Drew. "
        "One thing I noticed: no online booking system. Every lead that hits your site after hours has nowhere to go except voicemail."
    )
    leads.append(Lead("Hamilton HVAC Inc", "Drew", "Hamilton, ON", "info@hamiltonhvacinc.net", s, b))

    # ── LONDON — ROOFING ──────────────────────────────────────────────────────

    s, b = receptionist(
        "Humble Roofing", "Rajinder", "London",
        "I came across Humble Roofing — started in 2020, A+ BBB, clear upward trajectory in London. "
        "The gap right now: every call you miss while on a job is a job that goes to someone who answered. "
        "At your growth stage, that's the single most valuable problem to solve."
    )
    leads.append(Lead("Humble Roofing", "Rajinder", "London, ON", "info@humbleroofing.ca", s, b))

    s, b = leadgen(
        "London Roofing", "there", "London",
        "I was looking at London Roofing online — solid site, but I noticed no active lead generation system. "
        "You're relying on whoever finds you. We flip that: we go find your customers and deliver them ready to book."
    )
    leads.append(Lead("London Roofing", "there", "London, ON", "sales@yourlondonroofing.com", s, b))

    s, b = consulting(
        "Forest City Roofing", "Ralph", "London",
        "I was researching Forest City Roofing — in business since 1993, GAF certified, "
        "lifetime warranty, most clients from referrals. That's a business built on quality. "
        "At 30+ years in, the opportunity is usually in the operations layer — automating the follow-up, "
        "quote tracking, and re-engagement that's hard to do consistently without dedicated admin staff."
    )
    leads.append(Lead("Forest City Roofing", "Ralph", "London, ON", "info@forestcityroofing.ca", s, b))

    # ── LONDON — HVAC ─────────────────────────────────────────────────────────

    s, b = consulting(
        "Orzech Heating & Cooling", "Victor", "London",
        "I was looking at Orzech Heating & Cooling — 4.8 stars, 62 reviews, 25 years in London. "
        "That's a genuine reputation. At that level the bottleneck is rarely leads — it's the operations layer. "
        "Follow-ups that slip. Quotes that sit. Customers who don't get re-engaged after their annual service."
    )
    leads.append(Lead("Orzech Heating & Cooling", "Victor", "London, ON", "experts@orzechheating.ca", s, b))

    # ── OTTAWA — ROOFING ──────────────────────────────────────────────────────

    s, b = consulting(
        "Jorgensen Roofing", "Eike", "Ottawa",
        "I was looking at Jorgensen Roofing — 30+ years in Ottawa, 4.4 stars, A+ BBB, family owned. "
        "A business built that carefully over that long is usually sitting on a mountain of past clients who never got a re-engagement call. "
        "We automate that entire layer — re-engagement, review requests, referral prompts — without adding headcount."
    )
    leads.append(Lead("Jorgensen Roofing", "Eike", "Ottawa, ON", "office@jorgensenroofing.com", s, b))

    s, b = receptionist(
        "Ottawa's Affordable Roofing", "Yves", "Ottawa",
        "I found Ottawa's Affordable Roofing and noticed Yves handles every inquiry personally — "
        "which speaks to the quality of service, but also means every call missed when you're on a roof is a direct revenue loss. "
        "Our AI receptionist covers that gap 24/7 so you never lose a lead while you're working."
    )
    leads.append(Lead("Ottawa's Affordable Roofing", "Yves", "Ottawa, ON", "info@oaronline.ca", s, b))

    s, b = leadgen(
        "Lavazza Roofing", "there", "Ottawa",
        "I came across Lavazza Roofing while researching Ottawa contractors. "
        "Fully licensed, insured, solid site — but I didn't see an active inbound pipeline beyond search. "
        "We build the acquisition system end-to-end and deliver warm, pre-qualified homeowners ready to book."
    )
    leads.append(Lead("Lavazza Roofing", "there", "Ottawa, ON", "info@lavazzaroofing.com", s, b))

    s, b = leadgen(
        "Godfrey Roofing", "there", "Ottawa",
        "I was looking at Godfrey Roofing — solid Ottawa presence since 1984. "
        "A business with that history is sitting on a reputation that deserves more inbound volume than organic search alone can deliver. "
        "We build the pipeline that feeds it consistently, done-for-you."
    )
    leads.append(Lead("Godfrey Roofing", "there", "Ottawa, ON", "info@godfreyroofing.com", s, b))

    # ── OTTAWA — HVAC ─────────────────────────────────────────────────────────

    s, b = receptionist(
        "CoolHeat Comfort Systems", "Ray", "Ottawa",
        "I came across CoolHeat Comfort Systems — founded 2013, serving Cumberland and Ottawa area. "
        "I noticed your website doesn't have an online booking widget, which means every lead that lands after 5pm "
        "or on a weekend has to wait to hear back. In HVAC, whoever responds first wins the job."
    )
    leads.append(Lead("CoolHeat Comfort Systems", "Ray", "Ottawa, ON", "sales@coolheatcomfort.ca", s, b))

    s, b = consulting(
        "Ottawa HVAC Inc", "Jim", "Ottawa",
        "I came across Ottawa HVAC Inc — family owned, well-reviewed, solid reputation in Orléans. "
        "At your stage the biggest margin gain usually comes from automating the space between first contact and closed job: "
        "faster follow-up, automated quote reminders, re-engagement of past customers."
    )
    leads.append(Lead("Ottawa HVAC Inc", "Jim", "Ottawa, ON", "info@ottawa-hvac.com", s, b))

    # ── MISSISSAUGA — ROOFING ─────────────────────────────────────────────────

    s, b = receptionist(
        "Alps Roofing & Construction", "there", "Mississauga",
        "I was looking at Alps Roofing in Mississauga — 5 stars, 36 verified reviews, solid track record. "
        "One gap I noticed: no online booking on your site. "
        "Every visitor who lands after hours and can't book on the spot is a warm lead you're handing to whoever they call next."
    )
    leads.append(Lead("Alps Roofing & Construction", "there", "Mississauga, ON", "info@alpsroofing.ca", s, b))

    s, b = leadgen(
        "Country Roofing Inc", "Blaz", "Mississauga",
        "I came across Country Roofing Inc — 5 stars, 60 reviews, A+ BBB, 8 years in Mississauga. "
        "Great foundation. The next growth unlock for a business at your stage is usually a consistent inbound system "
        "that doesn't depend on Google ranking or referrals alone."
    )
    leads.append(Lead("Country Roofing Inc", "Blaz", "Mississauga, ON", "info@countryroofinginc.ca", s, b))

    # ── MISSISSAUGA — HVAC ────────────────────────────────────────────────────

    s, b = consulting(
        "Evam Canada", "Emad", "Mississauga",
        "I was looking at Evam Canada — 4.9 stars, 125 reviews, 25 years of expertise. "
        "A business with that kind of reputation is usually leaving money on the table in the ops layer: "
        "past customers not getting re-engaged, quotes not being followed up fast enough, review requests not going out automatically."
    )
    leads.append(Lead("Evam Canada", "Emad", "Mississauga, ON", "evamcanadahvac@gmail.com", s, b))

    # ── TORONTO — ROOFING ─────────────────────────────────────────────────────

    s, b = receptionist(
        "The Cutting Edge Roofing", "Robert", "Toronto",
        "I came across The Cutting Edge Roofing — 26 years in business, Robert handles consultations personally. "
        "That personal touch is your edge. The risk is that it creates a bottleneck: "
        "every call you can't take personally is a lead that doesn't get the experience you built your reputation on. "
        "Our AI receptionist is the bridge — it qualifies the lead and books the call so you only engage with serious buyers."
    )
    leads.append(Lead("The Cutting Edge Roofing", "Robert", "Toronto, ON", "info@thecuttingedgeroofing.com", s, b))

    s, b = leadgen(
        "Right Choice Roofing", "Frank", "Toronto",
        "I came across Right Choice Roofing — Frank handles the consultations personally which tells me you take quality seriously. "
        "The challenge with that model is growth has a ceiling. "
        "We build the pipeline that feeds qualified leads to you consistently, so you're never chasing work."
    )
    leads.append(Lead("Right Choice Roofing", "Frank", "Toronto, ON", "info@rightchoiceroofing.ca", s, b))

    s, b = receptionist(
        "High Skillz Roofing", "Artur", "Toronto",
        "I was looking at High Skillz Roofing — 4.9 stars, over 1,100 reviews across the GTA, impressive operation. "
        "At that volume, the calls you're missing after hours or during active jobs represent significant revenue. "
        "Our AI receptionist handles every inbound call 24/7 so the job keeps booking itself while the crew is working."
    )
    leads.append(Lead("High Skillz Roofing", "Artur", "Toronto, ON", "info@highskillzroofing.ca", s, b))

    # ── TORONTO — HVAC ────────────────────────────────────────────────────────

    s, b = leadgen(
        "HVAC Mechanical Systems", "there", "Toronto",
        "I found HVAC Mechanical Systems while researching Toronto contractors. "
        "Centrally located, strong service offering — the gap I noticed is no clear inbound lead generation system on the site. "
        "We build that end-to-end and deliver qualified homeowner appointments directly to your calendar."
    )
    leads.append(Lead("HVAC Mechanical Systems", "there", "Toronto, ON", "info@hvacmechanicalsystems.com", s, b))

    s, b = consulting(
        "Dupont Heating & Air Conditioning", "there", "Toronto",
        "I was looking at Dupont Heating — established 1964, over 60 years in Toronto. "
        "A business with that kind of history has thousands of past customers who haven't been re-engaged in years. "
        "We build the automated re-engagement infrastructure that turns that dormant list into booked service appointments — hands-free."
    )
    leads.append(Lead("Dupont Heating & Air Conditioning", "there", "Toronto, ON", "info@dupontheatingltd.ca", s, b))

    return leads

LEADS = make_leads()

# ── SMTP ─────────────────────────────────────────────────────────────────────

def connect(pw):
    ctx = ssl.create_default_context()
    s = smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ctx)
    s.login(FROM_EMAIL, pw)
    return s

def send(smtp, lead, dry):
    if dry:
        print(f"\n{'='*65}\nTO      : {lead.email}\nFROM    : {FROM_EMAIL}\nSUBJECT : {lead.subject}\n{'-'*65}\n{lead.body}")
        return True
    msg = MIMEMultipart("alternative")
    msg["From"]     = f"{FROM_NAME} <{FROM_EMAIL}>"
    msg["To"]       = f"{lead.name} <{lead.email}>"
    msg["Subject"]  = lead.subject
    msg["Reply-To"] = FROM_EMAIL
    msg.attach(MIMEText(lead.body, "plain"))
    try:
        smtp.sendmail(FROM_EMAIL, lead.email, msg.as_string())
        return True
    except Exception as e:
        print(f"  ✗ {e}")
        return False

# ── MAIN ─────────────────────────────────────────────────────────────────────

def run(pw, dry, limit):
    print(f"\nBarbanera Solutions — Outreach Engine")
    print(f"Mode    : {'DRY RUN' if dry else 'LIVE'}")
    print(f"Leads   : {len(LEADS)} loaded")
    print(f"Limit   : {limit if limit else 'none'}\n")

    smtp = None
    if not dry:
        print("Connecting to Gmail...")
        try:
            smtp = connect(pw)
            print("✓ Connected.\n")
        except smtplib.SMTPAuthenticationError:
            print("\n✗ Auth failed. Check your App Password at myaccount.google.com/apppasswords")
            return

    sent = errors = 0
    batch = LEADS[:limit] if limit else LEADS

    for i, lead in enumerate(batch, 1):
        print(f"[{i}/{len(batch)}] {lead.name} | {lead.city} | {lead.email}")
        ok = send(smtp, lead, dry)
        if ok:
            sent += 1
            if not dry: print(f"  ✓ Sent")
        else:
            errors += 1

        if i < len(batch):
            d = random.randint(MIN_DELAY, MAX_DELAY)
            if not dry:
                print(f"  Waiting {d}s...\n")
                time.sleep(d)

    if smtp: smtp.quit()

    print(f"\n{'='*55}")
    print(f"Done. {sent} {'queued' if dry else 'sent'} | {errors} errors")
    if not dry:
        print(f"\nSet a reminder in 4 days to send follow-ups.")
    print(f"Calendly: {CAL}")

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--app-password", default="")
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--limit", type=int, default=0)
    a = p.parse_args()

    if not a.dry_run and not a.app_password:
        raise SystemExit("ERROR: --app-password required. Get one at myaccount.google.com/apppasswords")

    run(a.app_password, a.dry_run, a.limit)
