import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { PricingRow } from "@/lib/db/schema";

/**
 * react-pdf PDF document for a Rufus proposal. Brand colours come from the
 * workspace. Sections render in canonical order, with a pricing table.
 *
 * Font: not loaded — defaults to Helvetica. We don't bundle Plus Jakarta /
 * Instrument Serif here because react-pdf needs TTF/OTF files and we don't
 * want to ship them in the function bundle for a v1 export.
 */

const SECTION_ORDER = ["Overview", "Objectives", "Scope of work", "Deliverables", "Timeline", "Terms", "Next steps"] as const;
type SectionKey = (typeof SECTION_ORDER)[number];

interface ProposalPdfProps {
  proposal: {
    clientName: string;
    title: string;
    sections: Record<string, string>;
    pricing: PricingRow[];
    createdAt: Date | string;
  };
  workspace: {
    companyName: string;
    primaryColor: string;
    accentColor: string;
    currency: string;
  };
}

const styles = StyleSheet.create({
  page: { paddingTop: 56, paddingBottom: 56, paddingHorizontal: 56, fontSize: 11, color: "#1B1A16", fontFamily: "Helvetica", lineHeight: 1.5 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 36, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#1B1A1611" },
  brand: { fontSize: 14, fontWeight: 700 },
  meta: { fontSize: 9, color: "#8C8779" },
  preparedFor: { fontSize: 9, color: "#8C8779", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 8 },
  accentBar: { width: 40, height: 3, marginTop: 6, marginBottom: 32 },
  sectionLabel: { fontSize: 9, fontWeight: 700, color: "#8C8779", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
  sectionBody: { fontSize: 11, color: "#3A382F", marginBottom: 22, lineHeight: 1.6 },
  table: { marginTop: 8, marginBottom: 22, borderWidth: 1, borderColor: "#1B1A1611", borderRadius: 4 },
  tableHead: { flexDirection: "row", backgroundColor: "#F7F3EC", paddingVertical: 8, paddingHorizontal: 10 },
  th: { fontSize: 8, fontWeight: 700, color: "#6B675B", textTransform: "uppercase", letterSpacing: 0.8 },
  tableRow: { flexDirection: "row", paddingVertical: 9, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: "#1B1A1411" },
  td: { fontSize: 11, color: "#3A382F" },
  totalRow: { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: "#1B1A1411" },
  totalText: { fontSize: 11, fontWeight: 700 },
  totalAmount: { fontSize: 13, fontWeight: 700 },
  footer: { position: "absolute", left: 56, right: 56, bottom: 28, textAlign: "center", fontSize: 8, color: "#8C8779" },
});

const fmt = (n: number, currency: string) =>
  n.toLocaleString("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 0 });

export function ProposalPdf({ proposal, workspace }: ProposalPdfProps) {
  const total = proposal.pricing.reduce((s, r) => s + r.qty * r.price, 0);
  const created =
    typeof proposal.createdAt === "string" ? new Date(proposal.createdAt) : proposal.createdAt;

  return (
    <Document title={`${proposal.clientName} — ${proposal.title}`} author={workspace.companyName}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <Text style={[styles.brand, { color: workspace.primaryColor || "#1B1A16" }]}>
            {workspace.companyName || "Proposal"}
          </Text>
          <Text style={styles.meta}>Proposal · {created.toLocaleDateString()}</Text>
        </View>

        <Text style={styles.preparedFor}>Prepared for {proposal.clientName}</Text>
        <Text style={styles.title}>{proposal.title}</Text>
        <View style={[styles.accentBar, { backgroundColor: workspace.accentColor || "#5b5bd6" }]} />

        {SECTION_ORDER.filter((k) => k !== "Terms" && k !== "Next steps").map((key) => (
          <View key={key} wrap={false}>
            <Text style={styles.sectionLabel}>{key}</Text>
            <Text style={styles.sectionBody}>{proposal.sections[key as SectionKey] || "(empty)"}</Text>
          </View>
        ))}

        <View wrap={false}>
          <Text style={styles.sectionLabel}>Pricing</Text>
          <View style={styles.table}>
            <View style={styles.tableHead}>
              <Text style={[styles.th, { flex: 3 }]}>Item</Text>
              <Text style={[styles.th, { flex: 1, textAlign: "center" }]}>Qty</Text>
              <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>Price</Text>
              <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>Total</Text>
            </View>
            {proposal.pricing.map((r) => (
              <View key={r.id} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 3 }]}>{r.item}</Text>
                <Text style={[styles.td, { flex: 1, textAlign: "center" }]}>{r.qty}</Text>
                <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>{fmt(r.price, workspace.currency)}</Text>
                <Text style={[styles.td, { flex: 1, textAlign: "right", fontWeight: 700 }]}>
                  {fmt(r.qty * r.price, workspace.currency)}
                </Text>
              </View>
            ))}
            <View style={[styles.totalRow, { backgroundColor: workspace.primaryColor || "#1B1A16" }]}>
              <Text style={[styles.totalText, { flex: 5, color: "#FBF9F4" }]}>Total</Text>
              <Text style={[styles.totalAmount, { flex: 1, textAlign: "right", color: "#FBF9F4" }]}>
                {fmt(total, workspace.currency)}
              </Text>
            </View>
          </View>
        </View>

        {(["Terms", "Next steps"] as const).map((key) => (
          <View key={key} wrap={false}>
            <Text style={styles.sectionLabel}>{key}</Text>
            <Text style={styles.sectionBody}>{proposal.sections[key] || "(empty)"}</Text>
          </View>
        ))}

        <Text style={styles.footer} fixed>
          {workspace.companyName} · Generated with Rufus
        </Text>
      </Page>
    </Document>
  );
}
