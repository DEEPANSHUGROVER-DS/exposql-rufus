import type { Metadata } from "next";
import { ToolPage } from "@/components/ToolPage";
import { ProposalMock } from "@/components/mocks";
import { proposalsContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Proposals & SOWs — branded proposals, drafted in minutes",
  description:
    "Fill a short form and Rufus writes a sectioned, on-brand proposal with a calculated pricing table and e-sign-ready export. For agencies and consultants.",
};

export default function ProposalsPage() {
  return (
    <ToolPage
      content={proposalsContent}
      demo={
        <div className="card relative overflow-hidden p-6 shadow-lift">
          <span className="shimmer-sweep" />
          <div className="relative">
            <ProposalMock />
          </div>
        </div>
      }
    />
  );
}
