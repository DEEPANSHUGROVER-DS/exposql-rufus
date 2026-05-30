import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { db, DB_CONFIGURED } from "@/lib/db";
import { proposals, workspaces } from "@/lib/db/schema";
import type { PricingRow } from "@/lib/db/schema";
import { TrackView } from "./TrackView";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SECTION_KEYS = ["Overview", "Objectives", "Scope of work", "Deliverables", "Timeline", "Terms", "Next steps"] as const;

async function loadBySlug(slug: string) {
  if (!DB_CONFIGURED) return null;
  const [p] = await db.select().from(proposals).where(eq(proposals.hostedSlug, slug)).limit(1);
  if (!p) return null;
  const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, p.workspaceId)).limit(1);
  return { proposal: p, workspace: ws };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadBySlug(slug);
  if (!data) return { title: "Proposal" };
  return {
    title: `${data.proposal.clientName} — ${data.proposal.title}`,
    description: `Proposal from ${data.workspace?.companyName ?? "Rufus"}`,
    robots: { index: false, follow: false },
  };
}

export default async function HostedProposalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await loadBySlug(slug);
  if (!data) notFound();

  const { proposal, workspace } = data;
  const sections = proposal.sections as Record<string, string>;
  const pricing = proposal.pricing as PricingRow[];
  const total = pricing.reduce((s, r) => s + r.qty * r.price, 0);
  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      style: "currency",
      currency: workspace?.currency || "USD",
      maximumFractionDigits: 0,
    });

  const primary = workspace?.primaryColor || "#1B1A16";
  const accent = workspace?.accentColor || "#5b5bd6";
  const theme = (workspace?.theme as "Light" | "Warm" | "Bold") || "Warm";

  // Theme variants — the workspace's brand colours stay the same, but the
  // background, header treatment and accent prominence differ.
  const themeStyles = {
    Light: { surface: "bg-white text-ink-900", header: "border-b border-ink-900/[0.07]", titleSize: "sm:text-5xl" },
    Warm: { surface: "bg-paper text-ink-900", header: "border-b border-ink-900/[0.07]", titleSize: "sm:text-5xl" },
    Bold: {
      surface: "bg-ink-900 text-paper-50",
      header: "border-b border-paper-50/10",
      titleSize: "sm:text-[3.5rem]",
    },
  } as const;
  const t = themeStyles[theme] ?? themeStyles.Warm;
  const isDark = theme === "Bold";

  const tx = {
    heading: isDark ? "text-paper-50" : "text-ink-900",
    body: isDark ? "text-paper-200/85" : "text-ink-700",
    muted: isDark ? "text-paper-200/55" : "text-ink-500",
    dim: isDark ? "text-paper-200/40" : "text-ink-400",
    border: isDark ? "border-paper-50/10" : "border-ink-900/[0.07]",
    tableHead: isDark ? "bg-paper-50/[0.06] text-paper-200/55" : "bg-paper-100 text-ink-500",
    rowBg: isDark ? "bg-paper-50/[0.03]" : "bg-white",
    rowText: isDark ? "text-paper-200" : "text-ink-700",
    rowTextMuted: isDark ? "text-paper-200/55" : "text-ink-500",
    rowAmount: isDark ? "text-paper-50" : "text-ink-900",
  };

  return (
    <div
      className={`min-h-screen ${t.surface}`}
      style={{ ["--brand-primary" as string]: primary, ["--brand-accent" as string]: accent } as React.CSSProperties}
    >
      <TrackView slug={slug} alreadyViewed={Boolean(proposal.viewedAt)} />

      {/* Brand header */}
      <header className={`border-b ${tx.border}`}>
        <div className="container-x flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            {workspace?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={workspace.logoUrl} alt="" className="h-10 w-10 rounded-xl object-contain" />
            ) : (
              <span
                className="grid h-10 w-10 place-items-center rounded-xl text-paper-50 text-sm font-semibold"
                style={{ backgroundColor: primary }}
              >
                {(workspace?.companyName ?? "R").slice(0, 1).toUpperCase()}
              </span>
            )}
            <div>
              <p className={`text-sm font-semibold ${tx.heading}`}>{workspace?.companyName ?? "Proposal"}</p>
              <p className={`text-[11px] ${tx.dim}`}>Proposal · {new Date(proposal.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <span className={`text-[11px] uppercase tracking-widest ${tx.dim}`}>{proposal.status}</span>
        </div>
      </header>

      <main className="container-x py-16 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <p className={`text-xs font-medium ${tx.dim}`}>Prepared for {proposal.clientName}</p>
          <h1 className={`mt-2 text-4xl font-semibold tracking-[-0.02em] ${t.titleSize} ${tx.heading}`}>{proposal.title}</h1>
          <div className="mt-3 h-1 w-12 rounded-full" style={{ backgroundColor: accent }} />

          <div className="mt-12 space-y-10">
            {SECTION_KEYS.filter((k) => k !== "Terms" && k !== "Next steps").map((key) => (
              <section key={key}>
                <h2 className={`text-sm font-semibold uppercase tracking-[0.18em] ${tx.dim}`}>{key}</h2>
                <div className={`mt-3 whitespace-pre-wrap text-[15px] leading-relaxed ${tx.body}`}>
                  {sections[key] || "(empty)"}
                </div>
              </section>
            ))}

            {/* Pricing */}
            <section>
              <h2 className={`text-sm font-semibold uppercase tracking-[0.18em] ${tx.dim}`}>Pricing</h2>
              <div className={`mt-3 overflow-hidden rounded-2xl border ${tx.border}`}>
                <table className="w-full text-sm">
                  <thead className={`text-left text-xs uppercase tracking-wider ${tx.tableHead}`}>
                    <tr>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Price</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-paper-50/10" : "divide-ink-900/[0.06]"}`}>
                    {pricing.map((r) => (
                      <tr key={r.id} className={tx.rowBg}>
                        <td className={`px-4 py-3 ${tx.rowText}`}>{r.item}</td>
                        <td className={`px-4 py-3 text-center ${tx.rowTextMuted}`}>{r.qty}</td>
                        <td className={`px-4 py-3 text-right ${tx.rowText}`}>{fmt(r.price)}</td>
                        <td className={`px-4 py-3 text-right font-medium ${tx.rowAmount}`}>{fmt(r.qty * r.price)}</td>
                      </tr>
                    ))}
                    <tr style={{ backgroundColor: primary, color: "#FBF9F4" }}>
                      <td className="px-4 py-3 font-semibold" colSpan={3}>Total</td>
                      <td className="px-4 py-3 text-right text-lg font-semibold">{fmt(total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {(["Terms", "Next steps"] as const).map((key) => (
              <section key={key}>
                <h2 className={`text-sm font-semibold uppercase tracking-[0.18em] ${tx.dim}`}>{key}</h2>
                <div className={`mt-3 whitespace-pre-wrap text-[15px] leading-relaxed ${tx.body}`}>
                  {sections[key] || "(empty)"}
                </div>
              </section>
            ))}
          </div>

          <div className={`mt-16 border-t pt-8 text-center ${tx.border}`}>
            <p className={`text-xs ${tx.dim}`}>
              Reach out to {workspace?.companyName ?? "us"} to approve or discuss.
            </p>
          </div>
        </div>
      </main>

      <footer className={`border-t ${tx.border} py-6`}>
        <div className={`container-x text-center text-[11px] ${tx.dim}`}>
          Powered by{" "}
          <a href="https://rufus.exposql.com" target="_blank" rel="noopener noreferrer" className={isDark ? "hover:text-paper-50" : "hover:text-ink-900"}>
            Rufus
          </a>
        </div>
      </footer>
    </div>
  );
}
