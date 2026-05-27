"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useApp } from "@/components/app/AppProvider";
import type { Tone } from "@/lib/app/types";

const ease = [0.22, 1, 0.36, 1] as const;
const tones: Tone[] = ["Formal", "Friendly", "Concise"];
const currencies = ["USD", "EUR", "GBP", "CAD", "AUD"];

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, setProfile, completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [serviceInput, setServiceInput] = useState("");

  const steps = ["Company", "Focus", "Services", "Defaults"];

  function addService() {
    const v = serviceInput.trim();
    if (v && !profile.services.includes(v)) setProfile({ services: [...profile.services, v] });
    setServiceInput("");
  }
  function removeService(s: string) {
    setProfile({ services: profile.services.filter((x) => x !== s) });
  }

  const canNext =
    (step === 0 && profile.companyName.trim()) ||
    (step === 1 && profile.industry.trim()) ||
    (step === 2 && profile.services.length > 0) ||
    step === 3;

  function finish() {
    completeOnboarding();
    router.push("/app");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-5 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Logo />
        <span className="text-xs text-ink-400">Step {step + 1} of {steps.length}</span>
      </div>

      {/* progress */}
      <div className="mb-8 flex gap-1.5">
        {steps.map((s, i) => (
          <div key={s} className="h-1 flex-1 overflow-hidden rounded-full bg-ink-900/10">
            <motion.div
              className="h-full rounded-full bg-ink-900"
              initial={false}
              animate={{ width: i <= step ? "100%" : "0%" }}
              transition={{ ease, duration: 0.4 }}
            />
          </div>
        ))}
      </div>

      <div className="card p-7 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ ease, duration: 0.35 }}
          >
            {step === 0 && (
              <>
                <h1 className="text-xl font-semibold tracking-[-0.01em] text-ink-900">
                  Let&apos;s set up your <span className="accent-italic text-accent">workspace</span>.
                </h1>
                <p className="mt-1.5 text-sm text-ink-500">Rufus personalises every output from this profile.</p>
                <Field label="Company name">
                  <input
                    value={profile.companyName}
                    onChange={(e) => setProfile({ companyName: e.target.value })}
                    placeholder="Northbeam Studio"
                    className="input"
                    autoFocus
                  />
                </Field>
                <Field label="Website">
                  <input
                    value={profile.website}
                    onChange={(e) => setProfile({ website: e.target.value })}
                    placeholder="northbeam.studio"
                    className="input"
                  />
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <h1 className="text-xl font-semibold tracking-[-0.01em] text-ink-900">What do you do?</h1>
                <p className="mt-1.5 text-sm text-ink-500">This shapes tone and examples in your documents.</p>
                <Field label="Industry">
                  <input
                    value={profile.industry}
                    onChange={(e) => setProfile({ industry: e.target.value })}
                    placeholder="Design & web agency"
                    className="input"
                    autoFocus
                  />
                </Field>
                <Field label="Typical client type">
                  <input
                    value={profile.clientType}
                    onChange={(e) => setProfile({ clientType: e.target.value })}
                    placeholder="Funded startups & SMBs"
                    className="input"
                  />
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="text-xl font-semibold tracking-[-0.01em] text-ink-900">Services you offer</h1>
                <p className="mt-1.5 text-sm text-ink-500">Add a few — Rufus uses these in scopes and proposals.</p>
                <Field label="Add a service">
                  <div className="flex gap-2">
                    <input
                      value={serviceInput}
                      onChange={(e) => setServiceInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addService())}
                      placeholder="e.g. Web design"
                      className="input flex-1"
                      autoFocus
                    />
                    <button onClick={addService} className="btn-dark px-4 py-2.5 text-[13px]">
                      Add
                    </button>
                  </div>
                </Field>
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.services.map((s) => (
                    <span key={s} className="chip">
                      {s}
                      <button onClick={() => removeService(s)} aria-label={`Remove ${s}`}>
                        <X className="h-3 w-3 text-ink-400 hover:text-ink-900" />
                      </button>
                    </span>
                  ))}
                  {!profile.services.length && <span className="text-xs text-ink-400">No services yet.</span>}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h1 className="text-xl font-semibold tracking-[-0.01em] text-ink-900">Defaults</h1>
                <p className="mt-1.5 text-sm text-ink-500">You can override these on any document.</p>
                <Field label="Default currency">
                  <div className="flex flex-wrap gap-2">
                    {currencies.map((c) => (
                      <button
                        key={c}
                        onClick={() => setProfile({ currency: c })}
                        className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                          profile.currency === c ? "bg-ink-900 text-paper-50" : "border border-ink-900/10 text-ink-600 hover:text-ink-900"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Default proposal tone">
                  <div className="flex flex-wrap gap-2">
                    {tones.map((t) => (
                      <button
                        key={t}
                        onClick={() => setProfile({ defaultTone: t })}
                        className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                          profile.defaultTone === t ? "bg-ink-900 text-paper-50" : "border border-ink-900/10 text-ink-600 hover:text-ink-900"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </Field>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900 ${
              step === 0 ? "invisible" : ""
            }`}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={() => canNext && setStep((s) => s + 1)}
              disabled={!canNext}
              className="btn-dark py-2.5 text-[13px] disabled:opacity-50"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={finish} className="btn-dark py-2.5 text-[13px]">
              Finish setup <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-5 block">
      <span className="mb-1.5 block text-xs font-medium text-ink-500">{label}</span>
      {children}
    </label>
  );
}
