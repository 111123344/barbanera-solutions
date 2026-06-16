"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Car,
  DollarSign,
  ClipboardList,
  Clock,
  ChevronDown,
} from "lucide-react";
import Script from "next/script";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormData {
  lookingFor: string;
  budget: string;
  details: string;
  readyWithin48h: boolean | null;
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

const TOTAL_STEPS = 4;

// ---------------------------------------------------------------------------
// Step metadata
// ---------------------------------------------------------------------------

const STEPS = [
  {
    id: 1,
    icon: Car,
    title: "Intent",
    question: "What are you looking for today?",
    hint: "This tells us which specialist on our team should handle your request.",
  },
  {
    id: 2,
    icon: DollarSign,
    title: "Budget",
    question: "What is your immediate budget or payout expectation?",
    hint: "Be honest — it helps us match you with the right inventory or offer.",
  },
  {
    id: 3,
    icon: ClipboardList,
    title: "Specifics",
    question: "Specify the Year, Make, Model, or specific parts you need.",
    hint: "The more detail you give us, the faster we can source or quote it.",
  },
  {
    id: 4,
    icon: Clock,
    title: "Timeline",
    question: "Are you ready to inspect, purchase, or pick up within 48 hours?",
    hint: "We prioritize serious, ready-to-move buyers and sellers.",
  },
] as const;

const LOOKING_FOR_OPTIONS = [
  { value: "", label: "Select an option…" },
  { value: "buy-vehicle", label: "Looking to buy a whole vehicle" },
  { value: "buy-parts", label: "Looking for specific OEM parts/wheels" },
  { value: "sell-vehicle", label: "Looking to sell my car for cash" },
];

const BUDGET_OPTIONS = [
  { value: "", label: "Select an option…" },
  { value: "under-5k", label: "Under $5,000" },
  { value: "5k-15k", label: "$5,000 - $15,000" },
  { value: "15k-plus", label: "$15,000+" },
  { value: "parts-only", label: "Just need parts" },
];

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
// Reusable dropdown
// ---------------------------------------------------------------------------

function StyledSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
        className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3.5 pr-10 text-sm font-medium text-white focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c] transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.value === ""}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Specifics
// ---------------------------------------------------------------------------

function DetailsStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const remaining = Math.max(0, 5 - value.trim().length);
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. 2017-2020 Honda Civic Si, clean title, under 100k km — or OEM 18in TRD wheels for a Tacoma..."
        rows={5}
        autoFocus
        className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-4 text-white placeholder-zinc-600 text-sm leading-relaxed focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c] transition-colors"
      />
      {remaining > 0 && (
        <p className="mt-1.5 text-xs text-zinc-600">
          A few more details will help us source the right match.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4 — Readiness toggle
// ---------------------------------------------------------------------------

function ReadinessToggle({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[
        { val: true, label: "Yes", sub: "Ready within 48 hours", accent: true },
        { val: false, label: "No", sub: "Just browsing for now", accent: false },
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
  lookingFor: "",
  budget: "",
  details: "",
  readyWithin48h: null,
};

export default function QualForm({ isOpen, onClose }: QualFormProps) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setStep(1);
        setDirection(1);
        setFormData(EMPTY_FORM);
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

  const canAdvance = (): boolean => {
    switch (step) {
      case 1:
        return formData.lookingFor !== "";
      case 2:
        return formData.budget !== "";
      case 3:
        return formData.details.trim().length >= 5;
      case 4:
        return formData.readyWithin48h !== null;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canAdvance()) return;

    if (step === TOTAL_STEPS) {
      // Calendly handoff — fires immediately on Q4 completion
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

  const stepHeights: Record<number, number> = {
    1: 140,
    2: 140,
    3: 200,
    4: 180,
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
                      Pre-Qualification & Sourcing
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-white">
                      Let&apos;s Find Your Match
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
                  style={{ minHeight: stepHeights[step] ?? 180 }}
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
                        <StyledSelect
                          value={formData.lookingFor}
                          options={LOOKING_FOR_OPTIONS}
                          onChange={(v) => setField("lookingFor", v)}
                        />
                      )}
                      {step === 2 && (
                        <StyledSelect
                          value={formData.budget}
                          options={BUDGET_OPTIONS}
                          onChange={(v) => setField("budget", v)}
                        />
                      )}
                      {step === 3 && (
                        <DetailsStep
                          value={formData.details}
                          onChange={(v) => setField("details", v)}
                        />
                      )}
                      {step === 4 && (
                        <ReadinessToggle
                          value={formData.readyWithin48h}
                          onChange={(v) => setField("readyWithin48h", v)}
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
                        Schedule My Pickup
                        <ChevronRight className="h-4 w-4" />
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
                  🔒 Your answers are confidential and used solely to match you with our inventory or sourcing team.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
