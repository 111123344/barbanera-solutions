"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  Car,
  Disc,
  Wrench,
  ShieldCheck,
  MapPin,
  Gauge,
  Phone,
  ArrowRight,
  ChevronDown,
  Languages,
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
            .Motors
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
          View Live Inventory
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
            Mechanically Verified · Montreal, QC
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          Premium Hand-Picked{" "}
          <span className="text-[#c9a84c]">Used Vehicles.</span>
          <br />
          <span className="text-zinc-300">Zero Dealership Fluff.</span>
          <br />
          Built to <span className="text-[#c9a84c]">Drive.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400"
        >
          We source, inspect, and deliver high-quality used cars, premium wheel
          setups, and OEM parts across Montreal.{" "}
          <span className="text-zinc-200 font-medium">
            Seamless Facebook Marketplace transactions, backed by elite mechanical verification.
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
            Secure Your Vehicle / Request Parts
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
          <a
            href="#how-we-work"
            className="flex items-center gap-2 rounded-full border border-zinc-700 px-7 py-4 text-base font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition-all duration-200"
          >
            Browse Current Fleet & Parts
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
              150-Point Multi-Point Inspected Used Fleet
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2">
            <MapPin className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Bilingual EN/FR · Montreal-Wide Delivery
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
    icon: Car,
    title: "Fully Verified Whole Vehicles",
    tagline: "Hand-Selected. Clean Title. Certified.",
    description:
      "Every vehicle in our fleet is hand-selected, clean-titled, and mechanically certified before it ever reaches you. No surprises, no hidden damage history.",
    bullets: [
      "Hand-selected, clean-title used cars only",
      "150-point multi-point mechanical inspection",
      "Full vehicle history and condition disclosure",
      "Ready for immediate pickup across Montreal",
    ],
    gradient: "from-[#c9a84c]/10 to-amber-500/5",
    accentColor: "text-[#c9a84c]",
    borderHover: "hover:border-[#c9a84c]/40",
    featured: true,
  },
  {
    icon: Disc,
    title: "Premium Wheels & Fitment",
    tagline: "Hard-to-Find Sets. Perfect Fitment.",
    description:
      "Sourcing rare and hard-to-find alloy wheel sets, high-tread tires, and premium fitment packages — matched precisely to your vehicle's specs.",
    bullets: [
      "Hard-to-find OEM and aftermarket alloy sets",
      "High-tread, low-mileage tire packages",
      "Fitment-verified before sale",
      "Direct Marketplace and local pickup",
    ],
    gradient: "from-cyan-500/10 to-blue-500/5",
    accentColor: "text-cyan-400",
    borderHover: "hover:border-cyan-500/40",
  },
  {
    icon: Wrench,
    title: "OEM & Performance Parts",
    tagline: "Engineered Sourcing. Exact Match.",
    description:
      "Need a specific mechanical component or body panel? We engineer the sourcing process to track down the exact OEM or performance part you need.",
    bullets: [
      "Targeted sourcing for mechanical components",
      "OEM and performance body panels",
      "Verified part numbers and compatibility",
      "Fast turnaround on hard-to-find requests",
    ],
    gradient: "from-violet-500/10 to-purple-500/5",
    accentColor: "text-violet-400",
    borderHover: "hover:border-violet-500/40",
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
            What We Source
          </p>
          <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Three Lanes.
            <br />
            <span className="text-zinc-400">One Trusted Showroom.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-zinc-500">
            Whether you need a whole vehicle, a wheel setup, or a specific part —
            we source it, verify it, and get it to you fast.
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
                      Core Offering
                    </span>
                  )}

                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700/60 bg-zinc-900">
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
    icon: Gauge,
    title: "The Sourcing & Inspection",
    subtitle: "How We Locate & Test",
    description:
      "We hunt down whole vehicles, wheel sets, and components across Marketplace and local networks, then run every find through a rigorous 150-point mechanical inspection.",
    detail: "You only ever see inventory that's already passed our verification process.",
    color: "from-[#c9a84c]/20 to-transparent",
    iconBg: "bg-[#c9a84c]/15 border-[#c9a84c]/30",
    iconColor: "text-[#c9a84c]",
    numberColor: "text-[#c9a84c]/20",
  },
  {
    number: "02",
    icon: ShieldCheck,
    title: "Digital Showroom Lock-In",
    subtitle: "Quick Qualification",
    description:
      "A fast pre-qualification survey confirms what you need and your timeline, then locks you into the right vehicle or parts package before someone else does.",
    detail: "Complete the 4-step survey and we schedule your viewing or pickup directly.",
    color: "from-violet-500/20 to-transparent",
    iconBg: "bg-violet-500/15 border-violet-500/30",
    iconColor: "text-violet-400",
    numberColor: "text-violet-400/20",
  },
  {
    number: "03",
    icon: MapPin,
    title: "Rapid Delivery & Handover",
    subtitle: "Local Meetups & Title Transfers",
    description:
      "Immediate Facebook Marketplace or local meetups across Montreal, with clean title transfers and a fully transparent handoff — no dealership red tape.",
    detail: "Most deals close and hand off within 48 hours of confirmation.",
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
            From Marketplace Listing
            <br />
            <span className="text-[#c9a84c]">to Your Driveway</span>
            <span className="text-zinc-400"> in 48 Hours.</span>
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
              Ready to Move?
            </p>
            <h3 className="mb-4 text-3xl font-black text-white">
              Your vehicle or parts package is waiting.
            </h3>
            <p className="mx-auto mb-8 max-w-lg text-base text-zinc-400">
              Complete the quick pre-qualification survey and we&apos;ll lock in
              your viewing or pickup time immediately.
            </p>
            <button
              onClick={onCTA}
              className="inline-flex items-center gap-3 rounded-full bg-[#c9a84c] px-8 py-4 text-base font-bold text-black shadow-xl shadow-[#c9a84c]/25 hover:bg-[#e8c97a] hover:shadow-[#c9a84c]/40 transition-all duration-200"
            >
              Secure Your Vehicle / Request Parts
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
              <span className="text-2xl font-black text-[#c9a84c]">.Motors</span>
            </a>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              Premium hand-picked used vehicles, wheels, and OEM parts. Sourced,
              inspected, and delivered across Montreal.
            </p>
            <div className="mt-6 flex gap-3">
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[11px] font-semibold text-emerald-400">150-Point Inspected</span>
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
              View Live Inventory
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
                { label: "Request Inventory", href: "#", onClick: onCTA },
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
            © {new Date().getFullYear()} Barbanera Motors. All rights reserved.
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
