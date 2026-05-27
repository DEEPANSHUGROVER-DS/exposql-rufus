import type { ItemStatus, ItemKind } from "./types";

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(ts).toLocaleDateString();
}

export const statusLabel: Record<ItemStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  won: "Won",
  lost: "Lost",
  completed: "Completed",
  in_review: "In review",
};

export const statusStyle: Record<ItemStatus, string> = {
  draft: "border-ink-900/10 bg-paper-100 text-ink-600",
  sent: "border-silk-sky/40 bg-silk-sky/20 text-ink-700",
  won: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
  lost: "border-rose-500/20 bg-rose-500/10 text-rose-600",
  completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
  in_review: "border-amber-500/20 bg-amber-500/10 text-amber-700",
};

export const kindLabel: Record<ItemKind, string> = {
  proposal: "Proposal",
  rfp: "RFP",
  contract: "Contract",
};
