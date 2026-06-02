"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

type EditAction = "rewrite" | "shorten" | "lengthen" | "formal" | "friendly" | "concise";

const ACTIONS: { key: EditAction; label: string; hint: string }[] = [
  { key: "rewrite", label: "Rewrite", hint: "Tighter, clearer" },
  { key: "shorten", label: "Shorten", hint: "Cut by 25%+" },
  { key: "lengthen", label: "Lengthen", hint: "A few more sentences" },
  { key: "formal", label: "Formal", hint: "Business-professional" },
  { key: "friendly", label: "Friendly", hint: "Conversational" },
  { key: "concise", label: "Concise", hint: "Punchy, direct" },
];

interface Props {
  value: string;
  onChange: (val: string) => void;
  rows?: number;
  className?: string;
  /** Called when an inline edit completes so the parent can refresh credit
   * balance, fire a toast, etc. */
  onEdited?: () => void;
  /** Disable the AI buttons (e.g. when there are no credits). */
  aiDisabled?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Textarea + AI inline-edit toolbar. User selects text inside the textarea,
 * clicks an action button (Rewrite / Shorten / Lengthen / Formal / Friendly /
 * Concise), and the selected range is replaced with the AI rewrite.
 *
 * Each click costs 1 credit. If nothing is selected when clicked, the whole
 * textarea contents are used.
 */
export function InlineEditTextarea({
  value,
  onChange,
  rows = 3,
  className = "input resize-none text-sm leading-relaxed",
  onEdited,
  aiDisabled = false,
  placeholder,
  disabled = false,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [busy, setBusy] = useState<EditAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSelection, setHasSelection] = useState(false);

  const updateSelectionFlag = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return setHasSelection(false);
    setHasSelection(el.selectionEnd > el.selectionStart);
  }, []);

  async function runEdit(action: EditAction) {
    const el = textareaRef.current;
    if (!el || busy || disabled) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const usingSelection = end > start;
    const target = usingSelection ? value.slice(start, end) : value;
    if (!target.trim()) return;

    setBusy(action);
    setError(null);
    try {
      const res = await fetch("/api/ai/edit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: target, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data?.error === "ai_not_configured"
            ? "AI isn't configured yet."
            : data?.error === "insufficient_credits"
            ? "Not enough credits. Top up in Settings."
            : data?.error === "too_long"
            ? "Selection is too long (max 8,000 chars)."
            : data?.detail || data?.error || `Edit failed (${res.status})`,
        );
        return;
      }
      const replacement = data.result as string;
      const next = usingSelection ? value.slice(0, start) + replacement + value.slice(end) : replacement;
      onChange(next);

      // Restore the selection around the new content so successive edits stack
      requestAnimationFrame(() => {
        const after = textareaRef.current;
        if (!after) return;
        const newEnd = (usingSelection ? start : 0) + replacement.length;
        after.focus();
        after.setSelectionRange(usingSelection ? start : 0, newEnd);
        setHasSelection(newEnd > (usingSelection ? start : 0));
      });

      onEdited?.();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={updateSelectionFlag}
        onKeyUp={updateSelectionFlag}
        onMouseUp={updateSelectionFlag}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        className={className}
      />

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
          <Sparkles className="h-3 w-3 text-accent" />
          AI edit
        </span>
        {ACTIONS.map((a) => {
          const isBusy = busy === a.key;
          return (
            <button
              key={a.key}
              type="button"
              onClick={() => runEdit(a.key)}
              disabled={busy !== null || aiDisabled || disabled}
              title={a.hint}
              className="inline-flex items-center gap-1 rounded-full border border-ink-900/10 bg-paper-50 px-2.5 py-1 text-[11px] font-semibold text-ink-700 transition-colors hover:border-accent/30 hover:bg-accent/[0.06] hover:text-accent disabled:opacity-50"
            >
              {isBusy && <Loader2 className="h-3 w-3 animate-spin" />}
              {a.label}
              <span className="text-[10px] font-normal text-ink-400">1cr</span>
            </button>
          );
        })}
        <span className="ml-1 text-[10px] text-ink-400">
          {hasSelection ? "Selection only" : "Whole section"}
        </span>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ ease, duration: 0.25 }}
            className="text-xs text-rose-600"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
