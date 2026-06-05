"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Building2,
  DollarSign,
  Target,
  UserCheck,
  Zap,
} from "lucide-react";
import Script from "next/script";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormData {
  businessName: string;
  industry: string;
  monthlyRevenue: string;
  biggestBottleneck: string;
  fullName: string;
  email: string;
  phone: string;
  humanCheck: boolean;
  // honeypot — must stay empty for real humans
  _hp: string;
  readyToScale: boolean | null;
}

interface QualFormProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Calendly
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
      closePopupWidget: () => void;
    };
  }
}

const CALENDLY_URL = "https://calendly.com/ahmadafiffadel/30min";

const TOTAL_STEPS = 5;

// ---------------------------------------------------------------------------
// Step metadata
// ---------------------------------------------------------------------------

const STEPS = [
  {
    id: 1,
    icon: Building2,
    title: "Business Info",
    question: "Tell us about your business.",
    hint: "This helps us tailor your strategy call before we even meet.",
  },
  {
    id: 2,
    icon: DollarSign,
    title: "Revenue",
    question: "What is your current monthly revenue?",
    hint: "Be honest — this determines which growth system fits you best.",
  },
  {
    id: 3,
    icon: Target,
    title: "Bottleneck",
    question: "What is your biggest bottleneck to growth right now?",
    hint: "Be specific — the more detail, the better we can prepare.",
  },
  {
    id: 4,
    icon: UserCheck,
    title: "Contact Details",
    question: "Where should we send your strategy brief?",
    hint: "Your info is 100% confidential. We don't do spam.",
  },
  {
    id: 5,
    icon: Zap,
    title: "Readiness",
    question: "Are you ready to scale your lead flow?",
    hint: "We only take on clients who are ready to move with urgency.",
  },
] as const;

const REVENUE_OPTIONS = [
  { value: "under-10k", label: "Under $10k / mo" },
  { value: "10k-50k", label: "$10k – $50k / mo" },
  { value: "50k-100k", label: "$50k – $100k / mo" },
  { value: "100k-plus", label: "$100k+ / mo" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone: string) {
  // Allow common formats: +1 (514) 000-0000, 5140000000, etc.
  return /^[\d\s\-\+\(\)]{7,20}$/.test(phone.trim());
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-500 ${
            i + 1 < current
              ? "w-5 bg-[#c9a84c]"
              : i + 1 === current
              ? "w-9 bg-[#c9a84c]"
              : "w-5 bg-zinc-700"
          }`}
        />
      ))}
      <span className="ml-2 text-xs font-medium text-zinc-500 tracking-widest uppercase">
        {current} / {total}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — Business Info
// ---------------------------------------------------------------------------

function BusinessInfoStep({
  data,
  onChange,
}: {
  data: Pick<FormData, "businessName" | "industry">;
  onChange: (k: keyof FormData, v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Business Name
        </label>
        <input
          type="text"
          value={data.businessName}
          onChange={(e) => onChange("businessName", e.target.value)}
          placeholder="e.g. Barbanera Solutions"
          autoFocus
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3.5 text-white placeholder-zinc-600 text-sm font-medium focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c] transition-colors"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Industry / Niche
        </label>
        <input
          type="text"
          value={data.industry}
          onChange={(e) => onChange("industry", e.target.value)}
          placeholder="e.g. Real Estate, Coaching, SaaS, Home Services…"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3.5 text-white placeholder-zinc-600 text-sm font-medium focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c] transition-colors"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Revenue
// ---------------------------------------------------------------------------

function RevenueStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {REVENUE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`relative group rounded-xl border p-4 text-left transition-all duration-200 ${
            value === opt.value
              ? "border-[#c9a84c] bg-[#c9a84c]/10 text-white"
              : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800"
          }`}
        >
          {value === opt.value && (
            <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#c9a84c]">
              <Check className="h-3 w-3 text-black" />
            </span>
          )}
          <span className="text-sm font-semibold leading-snug">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Bottleneck
// ---------------------------------------------------------------------------

function BottleneckStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const remaining = Math.max(0, 20 - value.trim().length);
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. We struggle to book enough qualified discovery calls. Our outreach is inconsistent and we lose leads because we can't follow up fast enough..."
        rows={5}
        className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-4 text-white placeholder-zinc-600 text-sm leading-relaxed focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c] transition-colors"
      />
      {remaining > 0 && (
        <p className="mt-1.5 text-xs text-zinc-600">
          {remaining} more characters to continue
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4 — Contact + Bot check
// ---------------------------------------------------------------------------

function ContactStep({
  data,
  onChange,
  errors,
}: {
  data: Pick<FormData, "fullName" | "email" | "phone" | "humanCheck" | "_hp">;
  onChange: (k: keyof FormData, v: string | boolean) => void;
  errors: Partial<Record<keyof FormData, string>>;
}) {
  return (
    <div className="space-y-4">
      {/* Honeypot — visually hidden, must stay empty */}
      <input
        type="text"
        name="website"
        value={data._hp}
        onChange={(e) => onChange("_hp", e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        className="absolute opacity-0 h-0 w-0 pointer-events-none"
      />

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Full Name
        </label>
        <input
          type="text"
          value={data.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          placeholder="Ahmad Fadel"
          autoComplete="name"
          className={`w-full rounded-xl border bg-zinc-900 px-4 py-3.5 text-white placeholder-zinc-600 text-sm font-medium focus:outline-none focus:ring-1 transition-colors ${
            errors.fullName
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-zinc-700 focus:border-[#c9a84c] focus:ring-[#c9a84c]"
          }`}
        />
        {errors.fullName && (
          <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Business Email
        </label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
          className={`w-full rounded-xl border bg-zinc-900 px-4 py-3.5 text-white placeholder-zinc-600 text-sm font-medium focus:outline-none focus:ring-1 transition-colors ${
            errors.email
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-zinc-700 focus:border-[#c9a84c] focus:ring-[#c9a84c]"
          }`}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-400">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Phone Number
        </label>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="+1 (438) 935-1711"
          autoComplete="tel"
          className={`w-full rounded-xl border bg-zinc-900 px-4 py-3.5 text-white placeholder-zinc-600 text-sm font-medium focus:outline-none focus:ring-1 transition-colors ${
            errors.phone
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-zinc-700 focus:border-[#c9a84c] focus:ring-[#c9a84c]"
          }`}
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-red-400">{errors.phone}</p>
        )}
      </div>

      {/* Human checkbox */}
      <button
        type="button"
        onClick={() => onChange("humanCheck", !data.humanCheck)}
        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 ${
          data.humanCheck
            ? "border-[#c9a84c]/50 bg-[#c9a84c]/10"
            : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
        }`}
      >
        <div
          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-colors ${
            data.humanCheck
              ? "border-[#c9a84c] bg-[#c9a84c]"
              : "border-zinc-600 bg-transparent"
          }`}
        >
          {data.humanCheck && <Check className="h-3 w-3 text-black" />}
        </div>
        <span className="text-sm text-zinc-300">
          I confirm I am a real human (not a bot)
        </span>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 5 — Readiness
// ---------------------------------------------------------------------------

function ReadinessStep({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[
        {
          val: true,
          label: "Yes, I'm ready",
          sub: "Let's build immediately",
          accent: true,
        },
        {
          val: false,
          label: "Not quite yet",
          sub: "Just exploring for now",
          accent: false,
        },
      ].map((opt) => (
        <button
          key={String(opt.val)}
          type="button"
          onClick={() => onChange(opt.val)}
          className={`relative flex flex-col items-center justify-center rounded-xl border p-6 gap-2 transition-all duration-200 ${
            value === opt.val
              ? opt.accent
                ? "border-[#c9a84c] bg-[#c9a84c]/10"
                : "border-zinc-500 bg-zinc-800"
              : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
          }`}
        >
          {value === opt.val && (
            <span
              className={`absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full ${
                opt.accent ? "bg-[#c9a84c]" : "bg-zinc-500"
              }`}
            >
              <Check className="h-3 w-3 text-black" />
            </span>
          )}
          <span
            className={`text-base font-bold ${
              value === opt.val
                ? opt.accent
                  ? "text-[#c9a84c]"
                  : "text-white"
                : "text-zinc-300"
            }`}
          >
            {opt.label}
          </span>
          <span className="text-xs text-zinc-500">{opt.sub}</span>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const EMPTY_FORM: FormData = {
  businessName: "",
  industry: "",
  monthlyRevenue: "",
  biggestBottleneck: "",
  fullName: "",
  email: "",
  phone: "",
  humanCheck: false,
  _hp: "",
  readyToScale: null,
};

export default function QualForm({ isOpen, onClose }: QualFormProps) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [contactErrors, setContactErrors] = useState<
    Partial<Record<keyof FormData, string>>
  >({});

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setStep(1);
        setDirection(1);
        setFormData(EMPTY_FORM);
        setContactErrors({});
      }, 400);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const openCalendly = useCallback(() => {
    if (typeof window !== "undefined" && window.Calendly) {
      window.Calendly.initPopupWidget({ url: CALENDLY_URL });
    }
  }, []);

  const setField = useCallback(
    (key: keyof FormData, value: string | boolean) => {
      setFormData((f) => ({ ...f, [key]: value }));
    },
    []
  );

  // Validate step 4 contact fields and return errors object
  const validateContact = (): Partial<Record<keyof FormData, string>> => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!formData.fullName.trim()) errs.fullName = "Please enter your full name.";
    if (!formData.email.trim()) {
      errs.email = "Please enter your email.";
    } else if (!isValidEmail(formData.email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!formData.phone.trim()) {
      errs.phone = "Please enter your phone number.";
    } else if (!isValidPhone(formData.phone)) {
      errs.phone = "Please enter a valid phone number.";
    }
    return errs;
  };

  const canAdvance = (): boolean => {
    switch (step) {
      case 1:
        return formData.businessName.trim().length > 1 && formData.industry.trim().length > 1;
      case 2:
        return formData.monthlyRevenue !== "";
      case 3:
        return formData.biggestBottleneck.trim().length >= 20;
      case 4: {
        // Honeypot must be empty; all fields valid; human checked
        if (formData._hp !== "") return false;
        const errs = validateContact();
        return Object.keys(errs).length === 0 && formData.humanCheck;
      }
      case 5:
        return formData.readyToScale !== null;
      default:
        return false;
    }
  };

  const handleNext = () => {
    // Extra inline validation pass on step 4 to show field errors on attempt
    if (step === 4) {
      const errs = validateContact();
      if (Object.keys(errs).length > 0 || !formData.humanCheck || formData._hp !== "") {
        setContactErrors(errs);
        return;
      }
      setContactErrors({});
    }

    if (!canAdvance()) return;

    if (step === TOTAL_STEPS) {
      onClose();
      setTimeout(openCalendly, 350);
      return;
    }

    setDirection(1);
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const currentStepMeta = STEPS[step - 1];
  const StepIcon = currentStepMeta.icon;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  // Dynamic min-height per step to prevent layout jump
  const stepHeights: Record<number, number> = {
    1: 200,
    2: 200,
    3: 220,
    4: 330,
    5: 180,
  };

  return (
    <>
      <link
        href="https://assets.calendly.com/assets/external/widget.css"
        rel="stylesheet"
      />
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
      />

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={onClose}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/60 overflow-hidden">

                {/* Gold top bar */}
                <div className="h-1 w-full bg-gradient-to-r from-[#c9a84c] via-[#e8c97a] to-[#c9a84c]" />

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">
                      Strategy Call Qualifier
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-white">
                      Let&apos;s See If We&apos;re a Fit
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Step indicator */}
                <div className="px-6 pb-4">
                  <StepIndicator current={step} total={TOTAL_STEPS} />
                </div>

                {/* Step content */}
                <div
                  className="relative overflow-hidden px-6 pb-6"
                  style={{ minHeight: stepHeights[step] ?? 220 }}
                >
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={step}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {/* Icon + question */}
                      <div className="mb-5 flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#c9a84c]/15 border border-[#c9a84c]/30">
                          <StepIcon className="h-5 w-5 text-[#c9a84c]" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-white leading-snug">
                            {currentStepMeta.question}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {currentStepMeta.hint}
                          </p>
                        </div>
                      </div>

                      {/* Dynamic inputs */}
                      {step === 1 && (
                        <BusinessInfoStep
                          data={{ businessName: formData.businessName, industry: formData.industry }}
                          onChange={setField}
                        />
                      )}
                      {step === 2 && (
                        <RevenueStep
                          value={formData.monthlyRevenue}
                          onChange={(v) => setField("monthlyRevenue", v)}
                        />
                      )}
                      {step === 3 && (
                        <BottleneckStep
                          value={formData.biggestBottleneck}
                          onChange={(v) => setField("biggestBottleneck", v)}
                        />
                      )}
                      {step === 4 && (
                        <ContactStep
                          data={{
                            fullName: formData.fullName,
                            email: formData.email,
                            phone: formData.phone,
                            humanCheck: formData.humanCheck,
                            _hp: formData._hp,
                          }}
                          onChange={setField}
                          errors={contactErrors}
                        />
                      )}
                      {step === 5 && (
                        <ReadinessStep
                          value={formData.readyToScale}
                          onChange={(v) => setField("readyToScale", v)}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Footer / nav */}
                <div className="flex items-center justify-between border-t border-zinc-800 px-6 py-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={step === 1}
                    className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white disabled:opacity-0 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canAdvance()}
                    className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all duration-200 ${
                      canAdvance()
                        ? "bg-[#c9a84c] text-black hover:bg-[#e8c97a] shadow-lg shadow-[#c9a84c]/20 hover:shadow-[#c9a84c]/40"
                        : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                    }`}
                  >
                    {step === TOTAL_STEPS ? (
                      <>
                        Book My Strategy Call
                        <Zap className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Continue
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Trust line */}
                <p className="border-t border-zinc-900 px-6 py-3 text-center text-xs text-zinc-600">
                  🔒 Your answers are confidential and used solely to prepare your strategy call.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
