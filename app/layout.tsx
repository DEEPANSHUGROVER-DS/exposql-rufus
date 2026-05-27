import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { SilkBackground } from "@/components/Silk";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rufus.exposql.com"),
  title: {
    default: "Rufus — the AI workspace for documents that win and close business",
    template: "%s · Rufus",
  },
  description:
    "Rufus drafts branded proposals, auto-answers RFPs and security questionnaires from your knowledge base, and flags risky contract clauses in plain English. By ExpoSQL AI Labs.",
  openGraph: {
    title: "Rufus — document AI by ExpoSQL AI Labs",
    description:
      "Win the work, then close it. AI for proposals, RFPs, and contract review.",
    url: "https://rufus.exposql.com",
    siteName: "Rufus",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${instrument.variable}`}>
      <body>
        <SilkBackground />
        {children}
      </body>
    </html>
  );
}
