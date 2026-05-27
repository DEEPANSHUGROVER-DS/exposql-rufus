import type { Metadata } from "next";
import { ToolPage } from "@/components/ToolPage";
import { CursorWindow } from "@/components/CursorWindow";
import { rfpContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "RFP & questionnaire autopilot — sourced answers in hours",
  description:
    "Paste an RFP or security questionnaire and Rufus drafts an answer for every question from your knowledge base, with a confidence score and source. For sales teams.",
};

export default function RfpPage() {
  return (
    <ToolPage content={rfpContent} demo={<CursorWindow />} />
  );
}
