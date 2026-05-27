const tasks = [
  "Draft proposals",
  "Build pricing tables",
  "Answer RFPs",
  "Fill security questionnaires",
  "Review contracts",
  "Flag risky clauses",
  "Write scopes of work",
  "Summarise in plain English",
  "Suggest contract edits",
  "Cite your knowledge base",
  "Export to PDF & DOCX",
  "Share hosted links",
];

function Row({ reverse = false }: { reverse?: boolean }) {
  const items = [...tasks, ...tasks];
  return (
    <div className="flex w-max items-center gap-3">
      {items.map((t, i) => (
        <span
          key={`${t}-${i}`}
          className={`inline-flex shrink-0 items-center gap-2 rounded-full border border-ink-900/10 bg-paper-50/70 px-4 py-2 text-sm font-medium text-ink-700 ${
            reverse ? "animate-marquee-rev" : "animate-marquee"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-ink-900/40" />
          {t}
        </span>
      ))}
    </div>
  );
}

export function TaskMarquee() {
  const items = [...tasks, ...tasks];
  return (
    <div className="marquee-mask relative flex flex-col gap-3 overflow-hidden py-2">
      <div className="flex w-max animate-marquee items-center gap-3">
        {items.map((t, i) => (
          <span
            key={`a-${t}-${i}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ink-900/10 bg-paper-50/70 px-4 py-2 text-sm font-medium text-ink-700"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-silk-peri" />
            {t}
          </span>
        ))}
      </div>
      <div className="flex w-max animate-marquee-rev items-center gap-3">
        {items.map((t, i) => (
          <span
            key={`b-${t}-${i}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ink-900/10 bg-paper-50/70 px-4 py-2 text-sm font-medium text-ink-700"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-silk-blush" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
