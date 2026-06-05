"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Check, DollarSign, TrendingUp, Target, Zap } from "lucide-react";
import Script from "next/script";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormData {
  annualRevenue: string;
  avgClientValue: string;
  biggestBottleneck: string;
  readyToScale: boolean | null;
}

interface QualFormProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Calendly helpers — loaded once via next/script, triggered imperatively
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

// ---------------------------------------------------------------------------
// Step metadata
// ---------------------------------------------------------------------------

const STEPS = [
  {
    id: 1,
    icon: DollarSign,
    title: "Revenue Range",
    question: "What is your annual revenue?",
    hint: "This helps us match you with the right growth framework.",
  },
  {
    id: 2,
    icon: TrendingUp,
    title: "Client Value",
    question: "How much does one average client pay you?",
    hint: "Think about your most common engagement size.",
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
    icon: Zap,
    title: "Readiness",
    question: "Are you ready to scale your lead flow within 30 days?",
    hint: "We only work with businesses ready to move immediately.",
  },
] as const;

const REVENUE_OPTIONS = [
  { value: "under-500k", label: "Under $500k" },
  { value: "500k-1m", label: "$500k – $1M" },
  { value: "1m-5m", label: "$1M – $5M" },
  { value: "5m-plus", label: "$5M+" },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              i + 1 < current
                ? "w-6 bg-[#c9a84c]"
                : i + 1 === current
                ? "w-10 bg-[#c9a84c]"
                : "w-6 bg-zinc-700"
            }`}
          />
          {i === 0 && i + 1 < total && null}
        </div>
      ))}
      <span className="ml-2 text-xs font-medium text-zinc-500 tracking-widest uppercase">
        {current} / {total}
      </span>
    </div>
  );
}

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
          <span className="text-sm font-semibold">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

function ClientValueStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c9a84c] font-semibold text-lg">
        $
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. 5000"
        min={0}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 pl-9 pr-4 py-4 text-white placeholder-zinc-600 text-base font-medium focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c] transition-colors"
      />
    </div>
  );
}

function BottleneckStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="e.g. We struggle to book enough qualified discovery calls. Our outreach is inconsistent and we lose leads because we can't follow up fast enough..."
      rows={5}
      className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-4 text-white placeholder-zinc-600 text-sm leading-relaxed focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c] transition-colors"
    />
  );
}

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
          className={`relative group flex flex-col items-center justify-center rounded-xl border p-6 gap-2 transition-all duration-200 ${
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
              value === opt.val ? (opt.accent ? "text-[#c9a84c]" : "text-white") : "text-zinc-300"
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

export default function QualForm({ isOpen, onClose }: QualFormProps) {
  const [step, setStep] = useState(1);
  const [calendlyReady, setCalendlyReady] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    annualRevenue: "",
    avgClientValue: "",
    biggestBottleneck: "",
    readyToScale: null,
  });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setFormData({ annualRevenue: "", avgClientValue: "", biggestBottleneck: "", readyToScale: null });
      }, 400);
    }
  }, [isOpen]);

  const openCalendly = useCallback(() => {
    if (typeof window !== "undefined" && window.Calendly) {
      window.Calendly.initPopupWidget({ url: CALENDLY_URL });
    }
  }, []);

  const canAdvance = () => {
    switch (step) {
      case 1: return formData.annualRevenue !== "";
      case 2: return formData.avgClientValue !== "" && Number(formData.avgClientValue) > 0;
      case 3: return formData.biggestBottleneck.trim().length >= 20;
      case 4: return formData.readyToScale !== null;
      default: return false;
    }
  };

  const handleNext = () => {
    if (!canAdvance()) return;
    if (step === 4) {
      // Survey complete — close modal and fire Calendly
      onClose();
      setTimeout(() => {
        openCalendly();
      }, 350);
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const currentStep = STEPS[step - 1];
  const StepIcon = currentStep.icon;

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
    }),
  };

  return (
    <>
      {/* Calendly CSS + JS loaded once */}
      <link
        href="https://assets.calendly.com/assets/external/widget.css"
        rel="stylesheet"
      />
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
        onLoad={() => setCalendlyReady(true)}
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
                      Let's See If We're a Fit
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
                  <StepIndicator current={step} total={STEPS.length} />
                </div>

                {/* Step content */}
                <div className="relative overflow-hidden px-6 pb-6" style={{ minHeight: 280 }}>
                  <AnimatePresence mode="wait" custom={step}>
                    <motion.div
                      key={step}
                      custom={step}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {/* Icon + question */}
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a84c]/15 border border-[#c9a84c]/30">
                          <StepIcon className="h-5 w-5 text-[#c9a84c]" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-white leading-snug">
                            {currentStep.question}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5">{currentStep.hint}</p>
                        </div>
                      </div>

                      {/* Dynamic input */}
                      {step === 1 && (
                        <RevenueStep
                          value={formData.annualRevenue}
                          onChange={(v) => setFormData((f) => ({ ...f, annualRevenue: v }))}
                        />
                      )}
                      {step === 2 && (
                        <ClientValueStep
                          value={formData.avgClientValue}
                          onChange={(v) => setFormData((f) => ({ ...f, avgClientValue: v }))}
                        />
                      )}
                      {step === 3 && (
                        <BottleneckStep
                          value={formData.biggestBottleneck}
                          onChange={(v) => setFormData((f) => ({ ...f, biggestBottleneck: v }))}
                        />
                      )}
                      {step === 4 && (
                        <ReadinessStep
                          value={formData.readyToScale}
                          onChange={(v) => setFormData((f) => ({ ...f, readyToScale: v }))}
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
                    {step === 4 ? (
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
