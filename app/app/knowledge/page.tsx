"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Pencil, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { useApp } from "@/components/app/AppProvider";
import { CostBadge, EmptyState, PageHeader, Panel } from "@/components/app/ui";
import { relativeTime } from "@/lib/app/format";
import { knowledgeImportCost } from "@/lib/pricing";
import type { KnowledgeEntry } from "@/lib/app/types";

const ease = [0.22, 1, 0.36, 1] as const;

export default function KnowledgePage() {
  const { knowledge, addKnowledge, updateKnowledge, removeKnowledge, spend, remaining } = useApp();
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [editing, setEditing] = useState<KnowledgeEntry | "new" | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const allTags = useMemo(
    () => Array.from(new Set(knowledge.flatMap((k) => k.tags))).sort(),
    [knowledge],
  );

  const filtered = useMemo(
    () =>
      knowledge.filter((k) => {
        const q = query.toLowerCase();
        const matchQ = !q || k.title.toLowerCase().includes(q) || k.body.toLowerCase().includes(q);
        const matchTag = !tag || k.tags.includes(tag);
        return matchQ && matchTag;
      }),
    [knowledge, query, tag],
  );

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Knowledge base"
        subtitle="The library your RFP answers are drawn from. Keep it current and your answers stay accurate."
        action={
          <div className="flex gap-2">
            <button onClick={() => setImportOpen(true)} className="btn-soft py-2.5 text-[13px]">
              <Sparkles className="h-4 w-4" /> Import
            </button>
            <button onClick={() => setEditing("new")} className="btn-dark py-2.5 text-[13px]">
              <Plus className="h-4 w-4" /> Add entry
            </button>
          </div>
        }
      />

      {/* search + tags */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search entries…"
            className="input pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTag(null)}
            className={`chip ${!tag ? "border-ink-900/30 bg-ink-900 text-paper-50" : ""}`}
          >
            All
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t === tag ? null : t)}
              className={`chip ${tag === t ? "border-ink-900/30 bg-ink-900 text-paper-50" : ""}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((k, i) => (
            <Panel key={k.id} index={i} className="group">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-ink-900">{k.title}</h3>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => setEditing(k)} aria-label="Edit">
                    <Pencil className="h-3.5 w-3.5 text-ink-400 hover:text-ink-900" />
                  </button>
                  <button onClick={() => removeKnowledge(k.id)} aria-label="Delete">
                    <Trash2 className="h-3.5 w-3.5 text-ink-400 hover:text-rose-600" />
                  </button>
                </div>
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-500">{k.body}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {k.tags.map((t) => (
                  <span key={t} className="chip text-[10px]">{t}</span>
                ))}
                <span className="ml-auto text-[11px] text-ink-400">{relativeTime(k.updatedAt)}</span>
              </div>
            </Panel>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title={knowledge.length ? "No matching entries" : "Your knowledge base is empty"}
          body={
            knowledge.length
              ? "Try a different search or clear the tag filter."
              : "Add entries like a security overview, data policy, or company background — these power your RFP answers."
          }
        />
      )}

      <AnimatePresence>
        {editing && (
          <EntryModal
            entry={editing === "new" ? null : editing}
            onClose={() => setEditing(null)}
            onSave={(data) => {
              if (editing === "new") addKnowledge(data);
              else updateKnowledge(editing.id, data);
              setEditing(null);
            }}
          />
        )}
        {importOpen && (
          <ImportModal
            remaining={remaining}
            onClose={() => setImportOpen(false)}
            onImport={(entries, cost) => {
              if (cost > 0 && !spend(cost, `Knowledge import: ${entries.length} entries`)) return false;
              entries.forEach((e) => addKnowledge(e));
              setImportOpen(false);
              return true;
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/30 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ ease, duration: 0.35 }}
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-lg p-6"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function EntryModal({
  entry,
  onClose,
  onSave,
}: {
  entry: KnowledgeEntry | null;
  onClose: () => void;
  onSave: (data: { title: string; body: string; tags: string[] }) => void;
}) {
  const [title, setTitle] = useState(entry?.title ?? "");
  const [body, setBody] = useState(entry?.body ?? "");
  const [tags, setTags] = useState(entry?.tags.join(", ") ?? "");

  return (
    <Backdrop onClose={onClose}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink-900">{entry ? "Edit entry" : "New entry"}</h2>
        <button onClick={onClose} aria-label="Close">
          <X className="h-4 w-4 text-ink-400 hover:text-ink-900" />
        </button>
      </div>
      <label className="mt-5 block">
        <span className="mb-1.5 block text-xs font-medium text-ink-500">Title</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Security overview" autoFocus />
      </label>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs font-medium text-ink-500">Body</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          className="input resize-none"
          placeholder="Write the answer Rufus should draw from…"
        />
      </label>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs font-medium text-ink-500">Tags (comma separated)</span>
        <input value={tags} onChange={(e) => setTags(e.target.value)} className="input" placeholder="security, compliance" />
      </label>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="btn-soft py-2.5 text-[13px]">Cancel</button>
        <button
          onClick={() =>
            title.trim() &&
            onSave({
              title: title.trim(),
              body: body.trim(),
              tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
            })
          }
          disabled={!title.trim()}
          className="btn-dark py-2.5 text-[13px] disabled:opacity-50"
        >
          Save entry
        </button>
      </div>
    </Backdrop>
  );
}

function ImportModal({
  remaining,
  onClose,
  onImport,
}: {
  remaining: number;
  onClose: () => void;
  onImport: (entries: { title: string; body: string; tags: string[] }[], cost: number) => boolean;
}) {
  const [text, setText] = useState("");
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const cost = knowledgeImportCost(blocks.length);
  const blocked = cost > remaining;

  return (
    <Backdrop onClose={onClose}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink-900">Import with AI</h2>
        <button onClick={onClose} aria-label="Close">
          <X className="h-4 w-4 text-ink-400 hover:text-ink-900" />
        </button>
      </div>
      <p className="mt-2 text-sm text-ink-500">
        Paste a block of text and Rufus splits it into suggested entries (one per paragraph). Costs credits.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={7}
        className="input mt-4 resize-none"
        placeholder={"Paste your company info, policies, FAQs…\n\nSeparate topics with a blank line."}
      />
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-ink-400">
          <CostBadge label={`${cost} credit${cost === 1 ? "" : "s"}`} />
          <span>{blocks.length} entr{blocks.length === 1 ? "y" : "ies"} · 2cr each</span>
        </div>
        <button
          onClick={() =>
            onImport(
              blocks.map((b, i) => {
                const [first, ...rest] = b.split("\n");
                return {
                  title: (first || `Imported entry ${i + 1}`).slice(0, 60),
                  body: rest.length ? rest.join("\n").trim() : b,
                  tags: ["imported"],
                };
              }),
              cost,
            )
          }
          disabled={!blocks.length || blocked}
          className="btn-dark py-2.5 text-[13px] disabled:opacity-50"
        >
          {blocked ? "Not enough credits" : "Split & import"}
        </button>
      </div>
    </Backdrop>
  );
}
