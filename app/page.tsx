"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  BrainCircuit,
  TrendingUp,
  Target,
  Phone,
  MapPin,
  ArrowRight,
  Calendar,
  Cog,
  Rocket,
  ShieldCheck,
  Languages,
  ChevronDown,
  Star,
} from "lucide-react";
import QualForm from "./components/QualForm";
import WhatsAppButton from "./components/WhatsAppButton";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [threshold]);
  return scrolled;
}

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Navbar
// ---------------------------------------------------------------------------

function Navbar({ onCTA }: { onCTA: () => void }) {
  const scrolled = useScrolled();

  return (
    <header
      className={`fixed top-0 inset-x-0 z-30 transition-all duration-300 ${
        scrolled
          ? "border-b border-zinc-800/60 bg-black/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="#" className="group flex items-center gap-1">
          <span className="text-xl font-black tracking-tight text-white">
            Barbanera
          </span>
          <span className="text-xl font-black text-[#c9a84c] group-hover:text-[#e8c97a] transition-colors">
            .
          </span>
        </a>

        {/* Nav links — desktop */}
        <nav className="hidden items-center gap-8 md:flex">
          {[
            { label: "Services", href: "#services" },
            { label: "How We Work", href: "#how-we-work" },
            { label: "Contact", href: "#footer" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <button
          onClick={onCTA}
          className="flex items-center gap-2 rounded-full bg-[#c9a84c] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#e8c97a] transition-all duration-200 shadow-lg shadow-[#c9a84c]/20 hover:shadow-[#c9a84c]/40"
        >
          Book Strategy Call
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

function Hero({ onCTA }: { onCTA: () => void }) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.4], [0, -60]);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-6 pt-24 pb-20">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#c9a84c 1px, transparent 1px), linear-gradient(90deg, #c9a84c 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      {/* Radial glow */}
      <motion.div
        style={{ y }}
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-[#c9a84c] opacity-[0.06] blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Trust pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#c9a84c]/30 bg-[#c9a84c]/10 px-4 py-1.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#c9a84c] animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c9a84c]">
            Revenue-Guaranteed · Montreal, QC
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          We Will Get You{" "}
          <span className="relative inline-block">
            <span className="relative z-10 text-[#c9a84c]">5 Booked</span>
            <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#c9a84c]/30 rounded-full" />
          </span>
          <br />
          Appointments In{" "}
          <span className="text-[#c9a84c]">30 Days</span>
          <br />
          <span className="text-zinc-300">—Or You Don&apos;t Pay.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400"
        >
          We engineer predictable revenue engines for high-ticket businesses.{" "}
          <span className="text-zinc-200 font-medium">
            No fluff, no management fees, just results.
          </span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.34 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <button
            onClick={onCTA}
            className="group flex items-center gap-3 rounded-full bg-[#c9a84c] px-8 py-4 text-base font-bold text-black shadow-xl shadow-[#c9a84c]/25 hover:bg-[#e8c97a] hover:shadow-[#c9a84c]/40 transition-all duration-200"
          >
            Book Your 10-Minute Strategy Call
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
          <a
            href="#how-we-work"
            className="flex items-center gap-2 rounded-full border border-zinc-700 px-7 py-4 text-base font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition-all duration-200"
          >
            View Our Methodology
            <ChevronDown className="h-4 w-4" />
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Revenue-Guaranteed
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2">
            <Languages className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Bilingual EN/FR Operations
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 text-[#c9a84c] fill-[#c9a84c]" />
              ))}
            </div>
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              100% Client Satisfaction
            </span>
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-widest text-zinc-600">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="h-8 w-5 rounded-full border border-zinc-700 flex items-start justify-center pt-1.5"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

const SERVICES = [
  {
    icon: BrainCircuit,
    title: "AI Receptionist",
    tagline: "24/7 Automated Qualification",
    description:
      "Never lose a lead again. Our AI receptionist engages, qualifies, and routes prospects around the clock — in English and French — so your team only speaks to decision-makers.",
    bullets: [
      "Instant multi-channel response",
      "Intelligent lead scoring & routing",
      "Seamless CRM integration",
      "Bilingual EN/FR support",
    ],
    gradient: "from-violet-500/10 to-purple-500/5",
    accentColor: "text-violet-400",
    borderHover: "hover:border-violet-500/40",
  },
  {
    icon: TrendingUp,
    title: "Performance Lead Gen",
    tagline: "Predictable Pipeline Growth",
    description:
      "We build and operate paid acquisition systems that generate high-intent leads on a performance basis. You pay for results — nothing else.",
    bullets: [
      "Meta & Google performance campaigns",
      "Cold outbound at scale",
      "A/B tested offer positioning",
      "Weekly pipeline reporting",
    ],
    gradient: "from-[#c9a84c]/10 to-amber-500/5",
    accentColor: "text-[#c9a84c]",
    borderHover: "hover:border-[#c9a84c]/40",
    featured: true,
  },
  {
    icon: Target,
    title: "Revenue Strategy",
    tagline: "Full-Funnel Revenue Engineering",
    description:
      "From offer design to closing mechanics, we architect the entire revenue system — ensuring every touchpoint converts at its highest potential.",
    bullets: [
      "Offer & positioning audit",
      "Sales process optimization",
      "Conversion rate engineering",
      "90-day revenue roadmap",
    ],
    gradient: "from-cyan-500/10 to-blue-500/5",
    accentColor: "text-cyan-400",
    borderHover: "hover:border-cyan-500/40",
  },
];

function Services({ onCTA }: { onCTA: () => void }) {
  return (
    <section id="services" className="relative bg-zinc-950 px-6 py-28">
      {/* Section divider */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

      <div className="mx-auto max-w-6xl">
        <FadeUp className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">
            What We Build
          </p>
          <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Three Systems.
            <br />
            <span className="text-zinc-400">One Revenue Engine.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-zinc-500">
            Every engagement is custom-engineered around your business. We don&apos;t
            sell packages — we build systems.
          </p>
        </FadeUp>

        <div className="grid gap-6 md:grid-cols-3">
          {SERVICES.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <FadeUp key={svc.title} delay={i * 0.1}>
                <div
                  className={`group relative flex h-full flex-col rounded-2xl border border-zinc-800 bg-gradient-to-br ${svc.gradient} p-8 transition-all duration-300 ${svc.borderHover} hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 ${
                    svc.featured ? "ring-1 ring-[#c9a84c]/20" : ""
                  }`}
                >
                  {svc.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#c9a84c] px-4 py-0.5 text-[11px] font-bold uppercase tracking-widest text-black">
                      Most Popular
                    </span>
                  )}

                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700/60 bg-zinc-900`}>
                    <Icon className={`h-6 w-6 ${svc.accentColor}`} />
                  </div>

                  <h3 className="mb-1 text-xl font-bold text-white">{svc.title}</h3>
                  <p className={`mb-4 text-sm font-semibold ${svc.accentColor}`}>
                    {svc.tagline}
                  </p>
                  <p className="mb-6 text-sm leading-relaxed text-zinc-400">
                    {svc.description}
                  </p>

                  <ul className="mt-auto space-y-2.5">
                    {svc.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2.5 text-sm text-zinc-300">
                        <span className={`h-1.5 w-1.5 rounded-full ${svc.featured ? "bg-[#c9a84c]" : "bg-zinc-500"} flex-shrink-0`} />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={onCTA}
                    className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-200 ${
                      svc.featured
                        ? "bg-[#c9a84c] text-black hover:bg-[#e8c97a]"
                        : "border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white"
                    }`}
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// How We Work
// ---------------------------------------------------------------------------

const STEPS = [
  {
    number: "01",
    icon: Calendar,
    title: "Discovery",
    subtitle: "The 10-Min Call",
    description:
      "We start with a focused 10-minute strategy call to audit your current lead flow, understand your offer, and identify the fastest path to 5+ booked appointments. No fluff — just precision diagnosis.",
    detail: "You leave with a clear revenue gap analysis and a proposed system architecture.",
    color: "from-[#c9a84c]/20 to-transparent",
    iconBg: "bg-[#c9a84c]/15 border-[#c9a84c]/30",
    iconColor: "text-[#c9a84c]",
    numberColor: "text-[#c9a84c]/20",
  },
  {
    number: "02",
    icon: Cog,
    title: "System Engineering",
    subtitle: "Building the Automated Engine",
    description:
      "Our team builds your custom revenue engine — AI receptionist, lead qualification workflows, outreach sequences, and conversion infrastructure — in 7 business days.",
    detail: "You get a fully operational system tested against your market before a single dollar is spent on traffic.",
    color: "from-violet-500/20 to-transparent",
    iconBg: "bg-violet-500/15 border-violet-500/30",
    iconColor: "text-violet-400",
    numberColor: "text-violet-400/20",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Scaling",
    subtitle: "Driving High-Intent Traffic",
    description:
      "With the system live, we turn on targeted acquisition — paid media, cold outbound, or both — driving only pre-qualified, high-intent prospects directly into your calendar.",
    detail: "Week 1: system live. Week 2: traffic on. Week 4: review your 5 booked appointments.",
    color: "from-emerald-500/20 to-transparent",
    iconBg: "bg-emerald-500/15 border-emerald-500/30",
    iconColor: "text-emerald-400",
    numberColor: "text-emerald-400/20",
  },
];

function HowWeWork({ onCTA }: { onCTA: () => void }) {
  return (
    <section id="how-we-work" className="relative bg-black px-6 py-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

      <div className="mx-auto max-w-6xl">
        <FadeUp className="mb-20 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">
            Our Process
          </p>
          <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            From Zero to
            <br />
            <span className="text-[#c9a84c]">5 Booked Calls</span>
            <span className="text-zinc-400"> in 30 Days.</span>
          </h2>
        </FadeUp>

        <div className="relative">
          {/* Vertical connector line — desktop */}
          <div className="absolute left-1/2 top-8 bottom-8 w-px -translate-x-1/2 bg-gradient-to-b from-[#c9a84c]/20 via-zinc-700 to-emerald-500/20 hidden lg:block" />

          <div className="space-y-8 lg:space-y-0">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isRight = i % 2 !== 0;
              return (
                <FadeUp key={step.number} delay={i * 0.15}>
                  <div
                    className={`relative flex flex-col gap-8 lg:flex-row lg:items-center ${
                      isRight ? "lg:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Card */}
                    <div className="flex-1">
                      <div
                        className={`group relative rounded-2xl border border-zinc-800 bg-gradient-to-br ${step.color} p-8 transition-all duration-300 hover:border-zinc-700 hover:-translate-y-1`}
                      >
                        <span className={`absolute top-6 right-6 text-7xl font-black ${step.numberColor} select-none leading-none`}>
                          {step.number}
                        </span>

                        <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl border ${step.iconBg}`}>
                          <Icon className={`h-6 w-6 ${step.iconColor}`} />
                        </div>

                        <p className={`mb-1 text-xs font-semibold uppercase tracking-widest ${step.iconColor}`}>
                          Step {step.number}
                        </p>
                        <h3 className="mb-1 text-2xl font-black text-white">{step.title}</h3>
                        <p className="mb-4 text-sm font-semibold text-zinc-500">{step.subtitle}</p>
                        <p className="mb-4 text-sm leading-relaxed text-zinc-400">{step.description}</p>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            <span className="font-semibold text-white">Result: </span>
                            {step.detail}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Center dot — desktop */}
                    <div className="hidden lg:flex h-5 w-5 flex-shrink-0 items-center justify-center">
                      <div className={`h-3 w-3 rounded-full border-2 ${
                        i === 0 ? "border-[#c9a84c] bg-[#c9a84c]" :
                        i === 1 ? "border-violet-400 bg-violet-400" :
                        "border-emerald-400 bg-emerald-400"
                      }`} />
                    </div>

                    {/* Spacer */}
                    <div className="hidden lg:block flex-1" />
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>

        {/* CTA strip */}
        <FadeUp delay={0.2}>
          <div className="mt-20 rounded-2xl border border-[#c9a84c]/20 bg-gradient-to-br from-[#c9a84c]/8 to-transparent p-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">
              Ready to Start?
            </p>
            <h3 className="mb-4 text-3xl font-black text-white">
              Your first 5 appointments are guaranteed.
            </h3>
            <p className="mx-auto mb-8 max-w-lg text-base text-zinc-400">
              If we don&apos;t deliver 5 booked calls in your first 30 days, you pay nothing.
              Zero risk. Pure upside.
            </p>
            <button
              onClick={onCTA}
              className="inline-flex items-center gap-3 rounded-full bg-[#c9a84c] px-8 py-4 text-base font-bold text-black shadow-xl shadow-[#c9a84c]/25 hover:bg-[#e8c97a] hover:shadow-[#c9a84c]/40 transition-all duration-200"
            >
              Start My 30-Day Guarantee
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

function Footer({ onCTA }: { onCTA: () => void }) {
  return (
    <footer
      id="footer"
      className="relative border-t border-zinc-800 bg-zinc-950 px-6 py-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <a href="#" className="group inline-flex items-center gap-1 mb-4">
              <span className="text-2xl font-black text-white">Barbanera</span>
              <span className="text-2xl font-black text-[#c9a84c]">.</span>
            </a>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              We engineer predictable revenue engines for high-ticket businesses. Montreal-based. Results-guaranteed.
            </p>
            <div className="mt-6 flex gap-3">
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[11px] font-semibold text-emerald-400">Revenue-Guaranteed</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1.5">
                <Languages className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-[11px] font-semibold text-blue-400">EN/FR</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Contact
            </h4>
            <div className="space-y-3">
              <a
                href="tel:+14389351711"
                className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4 text-[#c9a84c]" />
                438-935-1711
              </a>
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <MapPin className="h-4 w-4 text-[#c9a84c]" />
                Montreal, QC, Canada
              </div>
            </div>
            <button
              onClick={onCTA}
              className="mt-6 flex items-center gap-2 rounded-full bg-[#c9a84c] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#e8c97a] transition-colors"
            >
              Book Strategy Call
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Ahmad Fadel
            </h4>
            <nav className="space-y-3">
              {[
                { label: "Services", href: "#services" },
                { label: "How We Work", href: "#how-we-work" },
                { label: "Book a Call", href: "#", onClick: onCTA },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={link.onClick}
                  className="block text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Barbanera Solutions. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-zinc-600">
            <a href="#" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Page root
// ---------------------------------------------------------------------------

export default function Home() {
  const [formOpen, setFormOpen] = useState(false);

  const openForm = () => setFormOpen(true);
  const closeForm = () => setFormOpen(false);

  return (
    <>
      <Navbar onCTA={openForm} />
      <main>
        <Hero onCTA={openForm} />
        <Services onCTA={openForm} />
        <HowWeWork onCTA={openForm} />
      </main>
      <Footer onCTA={openForm} />
      <WhatsAppButton />
      <QualForm isOpen={formOpen} onClose={closeForm} />
    </>
  );
}
