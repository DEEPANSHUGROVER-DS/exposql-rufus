import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { RedFlag, SuggestedEdit } from "@/lib/db/schema";

interface ContractPdfProps {
  review: {
    title: string;
    fileName: string;
    summary: string[];
    redFlags: RedFlag[];
    suggestedEdits: SuggestedEdit[];
    createdAt: Date | string;
  };
  workspace: { companyName: string; primaryColor: string; accentColor: string };
}

const sevLabel: Record<RedFlag["severity"], string> = { high: "HIGH RISK", medium: "MEDIUM RISK", low: "LOW RISK" };
const sevColor: Record<RedFlag["severity"], string> = { high: "#9F1239", medium: "#B45309", low: "#6B675B" };

const styles = StyleSheet.create({
  page: { paddingTop: 56, paddingBottom: 56, paddingHorizontal: 56, fontSize: 11, color: "#1B1A16", fontFamily: "Helvetica", lineHeight: 1.5 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#1B1A1611" },
  brand: { fontSize: 13, fontWeight: 700 },
  meta: { fontSize: 9, color: "#8C8779" },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 6 },
  subtitle: { fontSize: 10, color: "#6B675B", marginBottom: 20 },
  accentBar: { width: 36, height: 3, marginBottom: 24 },
  h2: { fontSize: 13, fontWeight: 700, marginTop: 22, marginBottom: 10 },
  bullet: { fontSize: 11, color: "#3A382F", marginBottom: 6, paddingLeft: 12, position: "relative" },
  bulletDot: { position: "absolute", left: 0, top: 6, width: 4, height: 4, borderRadius: 2, backgroundColor: "#1B1A1666" },
  flagCard: { borderWidth: 1, borderColor: "#1B1A1611", borderRadius: 6, padding: 12, marginBottom: 10 },
  flagSeverity: { fontSize: 8, fontWeight: 700, letterSpacing: 0.8, marginBottom: 6 },
  flagClause: { fontSize: 11, fontWeight: 700, fontStyle: "italic", marginBottom: 4 },
  flagReason: { fontSize: 10, color: "#6B675B" },
  editCard: { borderWidth: 1, borderColor: "#1B1A1611", borderRadius: 6, padding: 12, marginBottom: 10 },
  editLabel: { fontSize: 8, fontWeight: 700, color: "#8C8779", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 },
  editOriginal: { fontSize: 10, color: "#6B675B", textDecoration: "line-through", marginBottom: 6 },
  editReplacement: { fontSize: 11, fontWeight: 700, marginBottom: 4 },
  editReason: { fontSize: 10, color: "#6B675B" },
  disclaimer: { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#1B1A1611", fontSize: 9, color: "#8C8779", fontStyle: "italic" },
  footer: { position: "absolute", left: 56, right: 56, bottom: 28, textAlign: "center", fontSize: 8, color: "#8C8779" },
});

export function ContractReviewPdf({ review, workspace }: ContractPdfProps) {
  const created = typeof review.createdAt === "string" ? new Date(review.createdAt) : review.createdAt;

  return (
    <Document title={`Contract review — ${review.title}`} author={workspace.companyName}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <Text style={[styles.brand, { color: workspace.primaryColor || "#1B1A16" }]}>
            {workspace.companyName || "Contract review"}
          </Text>
          <Text style={styles.meta}>Review · {created.toLocaleDateString()}</Text>
        </View>

        <Text style={styles.title}>{review.title}</Text>
        {review.fileName && <Text style={styles.subtitle}>{review.fileName}</Text>}
        <View style={[styles.accentBar, { backgroundColor: workspace.accentColor || "#5b5bd6" }]} />

        <Text style={styles.h2}>Plain-English summary</Text>
        {review.summary.length === 0 && <Text style={styles.bullet}>(none)</Text>}
        {review.summary.map((s, i) => (
          <View key={i} style={styles.bullet} wrap={false}>
            <View style={styles.bulletDot} />
            <Text>{s}</Text>
          </View>
        ))}

        <Text style={styles.h2}>Red flags ({review.redFlags.length})</Text>
        {review.redFlags.length === 0 && <Text style={{ fontSize: 11 }}>No red flags found.</Text>}
        {review.redFlags.map((f, i) => (
          <View key={i} style={styles.flagCard} wrap={false}>
            <Text style={[styles.flagSeverity, { color: sevColor[f.severity] }]}>{sevLabel[f.severity]}</Text>
            <Text style={styles.flagClause}>&ldquo;{f.clause}&rdquo;</Text>
            <Text style={styles.flagReason}>{f.reason}</Text>
          </View>
        ))}

        <Text style={styles.h2}>Suggested edits ({review.suggestedEdits.length})</Text>
        {review.suggestedEdits.length === 0 && <Text style={{ fontSize: 11 }}>No edits suggested.</Text>}
        {review.suggestedEdits.map((e, i) => (
          <View key={i} style={styles.editCard} wrap={false}>
            <Text style={styles.editLabel}>Original</Text>
            <Text style={styles.editOriginal}>{e.original}</Text>
            <Text style={styles.editLabel}>Suggested</Text>
            <Text style={styles.editReplacement}>{e.replacement}</Text>
            <Text style={styles.editReason}>{e.reason}</Text>
          </View>
        ))}

        <Text style={styles.disclaimer}>
          For your review — not legal advice. Rufus is not a law firm and these outputs are not a
          substitute for advice from a qualified lawyer.
        </Text>

        <Text style={styles.footer} fixed>
          {workspace.companyName} · Generated with Rufus
        </Text>
      </Page>
    </Document>
  );
}
