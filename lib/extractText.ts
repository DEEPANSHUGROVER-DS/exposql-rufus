/**
 * Client-side text extraction for uploads. PDF via pdfjs-dist with the
 * worker loaded from a CDN (pinned to the installed major version), DOCX
 * via mammoth (browser build). Both imported dynamically so the bundles
 * only load when the user actually picks a file.
 */

export interface ExtractResult {
  text: string;
  fileName: string;
}

const PDFJS_WORKER_CDN = "https://unpkg.com/pdfjs-dist@4/build/pdf.worker.min.mjs";

export async function extractTextFromFile(file: File): Promise<ExtractResult> {
  const name = file.name;
  const lower = name.toLowerCase();

  if (lower.endsWith(".pdf") || file.type === "application/pdf") {
    return { text: await extractPdf(file), fileName: name };
  }
  if (
    lower.endsWith(".docx") ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return { text: await extractDocx(file), fileName: name };
  }
  if (lower.endsWith(".txt") || file.type.startsWith("text/")) {
    return { text: await file.text(), fileName: name };
  }
  throw new Error(`Unsupported file. Upload a PDF, DOCX, or plain-text file.`);
}

async function extractPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  // The worker file isn't bundled with pdf.mjs in v4 — we load it from a CDN.
  // If your environment blocks unpkg, swap this URL to a self-hosted file
  // in /public.
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;

  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = (content.items as Array<{ str?: string }>)
      .map((it) => (it && typeof it === "object" && "str" in it ? String(it.str ?? "") : ""))
      .filter(Boolean)
      .join(" ");
    pages.push(pageText);
  }
  const text = pages.join("\n\n").trim();
  if (!text) {
    throw new Error(
      "Couldn't read any text from the PDF — it may be a scanned image. Paste the text manually for now.",
    );
  }
  return text;
}

async function extractDocx(file: File): Promise<string> {
  // mammoth doesn't ship a separate "browser" export in its TS types, so we
  // import the main module — its browser-safe code path is what runs in a
  // browser context.
  const mammoth = (await import("mammoth")) as unknown as {
    extractRawText: (opts: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
  };
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}
