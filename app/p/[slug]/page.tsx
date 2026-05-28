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

  return (
    <div
      className="min-h-screen bg-paper text-ink-900"
      style={{ ["--brand-primary" as string]: primary, ["--brand-accent" as string]: accent } as React.CSSProperties}
    >
      <TrackView slug={slug} alreadyViewed={Boolean(proposal.viewedAt)} />

      {/* Brand header */}
      <header className="border-b border-ink-900/[0.07]">
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
              <p className="text-sm font-semibold text-ink-900">{workspace?.companyName ?? "Proposal"}</p>
              <p className="text-[11px] text-ink-400">Proposal · {new Date(proposal.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <span className="text-[11px] uppercase tracking-widest text-ink-400">{proposal.status}</span>
        </div>
      </header>

      <main className="container-x py-16 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-medium text-ink-400">Prepared for {proposal.clientName}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">{proposal.title}</h1>
          <div className="mt-3 h-1 w-12 rounded-full" style={{ backgroundColor: accent }} />

          <div className="mt-12 space-y-10">
            {SECTION_KEYS.filter((k) => k !== "Terms" && k !== "Next steps").map((key) => (
              <section key={key}>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-400">{key}</h2>
                <div className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-700">
                  {sections[key] || "(empty)"}
                </div>
              </section>
            ))}

            {/* Pricing */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-400">Pricing</h2>
              <div className="mt-3 overflow-hidden rounded-2xl border border-ink-900/[0.07]">
                <table className="w-full text-sm">
                  <thead className="bg-paper-100 text-left text-xs uppercase tracking-wider text-ink-500">
                    <tr>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Price</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-900/[0.06]">
                    {pricing.map((r) => (
                      <tr key={r.id} className="bg-white">
                        <td className="px-4 py-3 text-ink-700">{r.item}</td>
                        <td className="px-4 py-3 text-center text-ink-500">{r.qty}</td>
                        <td className="px-4 py-3 text-right text-ink-700">{fmt(r.price)}</td>
                        <td className="px-4 py-3 text-right font-medium text-ink-900">{fmt(r.qty * r.price)}</td>
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
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-400">{key}</h2>
                <div className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-700">
                  {sections[key] || "(empty)"}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-16 border-t border-ink-900/[0.07] pt-8 text-center">
            <p className="text-xs text-ink-400">
              Reach out to {workspace?.companyName ?? "us"} to approve or discuss.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-ink-900/[0.07] py-6">
        <div className="container-x text-center text-[11px] text-ink-400">
          Powered by{" "}
          <a href="https://rufus.exposql.com" target="_blank" rel="noopener noreferrer" className="hover:text-ink-900">
            Rufus
          </a>
        </div>
      </footer>
    </div>
  );
}
