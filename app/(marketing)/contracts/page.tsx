import type { Metadata } from "next";
import { ToolPage } from "@/components/ToolPage";
import { InteractiveContract } from "@/components/demos/InteractiveContract";
import { contractsContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contract review — red flags and plain-English summaries",
  description:
    "Upload a contract and Rufus returns a plain-English summary, ranked red flags, and suggested edits tied to each clause. For your review — not legal advice.",
};

export default function ContractsPage() {
  return (
    <ToolPage
      content={contractsContent}
      demo={
        <div className="card relative overflow-hidden p-6 shadow-lift">
          <span className="shimmer-sweep" />
          <div className="relative">
            <InteractiveContract />
          </div>
        </div>
      }
    />
  );
}
