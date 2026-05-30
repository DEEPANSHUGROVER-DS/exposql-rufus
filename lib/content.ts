export type ToolKey = "proposals" | "rfp" | "contracts";

export interface ToolMeta {
  key: ToolKey;
  href: string;
  name: string;
  tagline: string;
  audience: string;
  blurb: string;
  accent: string; // tailwind bg class for accent dot / wash
}

export const tools: ToolMeta[] = [
  {
    key: "proposals",
    href: "/proposals",
    name: "Proposals & SOWs",
    tagline: "Fill a short form, send a proposal that looks like you spent a week on it.",
    audience: "For agencies & consultants",
    blurb:
      "A branded, sectioned proposal with a clean pricing table and a ready-to-send PDF — drafted from a few inputs and your company profile.",
    accent: "bg-silk-lav",
  },
  {
    key: "rfp",
    href: "/rfp",
    name: "RFP & questionnaire autopilot",
    tagline: "Paste the questionnaire. Get sourced answers from your own knowledge base.",
    audience: "For sales teams",
    blurb:
      "Rufus detects every question, drafts an answer from your saved knowledge, shows its confidence and source — and flags anything it can't back up.",
    accent: "bg-silk-sky",
  },
  {
    key: "contracts",
    href: "/contracts",
    name: "Contract review",
    tagline: "Upload a contract. See the red flags before you sign.",
    audience: "For founders & ops",
    blurb:
      "A plain-English summary, a ranked list of red flags, and suggested edits — each tied to the exact clause. For your review, not legal advice.",
    accent: "bg-silk-peach",
  },
];

export const homeSteps = [
  {
    n: "01",
    title: "Set up your workspace once",
    body: "Tell Rufus about your company, services, and tone. Add a few knowledge entries. Every output is personalised from there.",
  },
  {
    n: "02",
    title: "Pick the document you need",
    body: "Draft a proposal, answer an RFP, or review a contract. Rufus does the slow first pass in seconds.",
  },
  {
    n: "03",
    title: "Edit, brand, and send",
    body: "Tweak anything in the editor, apply your brand kit, then export or share a hosted link — and see when the client opens it.",
  },
];

export const proposalsContent = {
  hero: {
    eyebrow: "Proposals & SOWs",
    audience: "For agencies & consultants",
    title: "Win the work with a proposal that",
    accent: "closes",
    rest: ".",
    sub: "Fill a short form — client, scope, pricing line items — and Rufus writes a sectioned, on-brand proposal with a calculated pricing table and a downloadable, ready-to-send PDF.",
  },
  features: [
    {
      title: "Standard sections, written for you",
      body: "Overview, Objectives, Scope, Deliverables, Timeline, Pricing, Terms, Next steps — drafted from your inputs and company profile.",
    },
    {
      title: "Pricing tables that add up",
      body: "Editable line items with quantity and unit price. Rufus calculates the total and formats it in your default currency.",
    },
    {
      title: "Regenerate one section, not the whole thing",
      body: "Don't like the Scope wording? Regenerate just that section for a fraction of the credits. Manual edits are always free.",
    },
    {
      title: "Branded & ready to send",
      body: "Your logo, colours, and accent applied live. Export a PDF the client can sign with their own tool, or publish a hosted link they can open in a browser.",
    },
  ],
  steps: [
    { n: "01", title: "Fill the form", body: "Client name, project title, scope, and a small pricing table. Tone is inherited from your profile." },
    { n: "02", title: "Rufus drafts it", body: "A full sectioned proposal opens in the editor with the pricing table rendered and totalled." },
    { n: "03", title: "Edit & send", body: "Adjust anything, mark it sent, and watch the status move from draft to won." },
  ],
  pricing: { headline: "Per proposal, or a subscription", body: "Pay per proposal generated, or move to a monthly plan with included credits once you're sending often." },
  faqs: [
    { q: "Can I edit the proposal after Rufus drafts it?", a: "Yes — the proposal opens in a full editor. Manual edits never cost credits. You can also regenerate any single section." },
    { q: "What can I export?", a: "A branded PDF the client can download and sign with Adobe, DocuSign, or any signing tool of their choice, plus a hosted shareable link that tracks when your client opens it." },
    { q: "Where does the pricing total come from?", a: "From the line items you enter — description, quantity, unit price. Rufus calculates the total and formats it in your default currency." },
  ],
};

export const rfpContent = {
  hero: {
    eyebrow: "RFP & questionnaire autopilot",
    audience: "For sales teams",
    title: "Answer the questionnaire in hours,",
    accent: "not weeks",
    rest: ".",
    sub: "Paste an RFP or a security questionnaire. Rufus detects each question and drafts an answer from your knowledge base — with a confidence score and the source it used.",
  },
  features: [
    {
      title: "Every question, detected",
      body: "Paste raw RFP text, a list of questions, or upload a document. Rufus splits it into individual questions automatically.",
    },
    {
      title: "Sourced from your knowledge base",
      body: "Each answer cites the knowledge entry it drew from — so you always know where a claim came from.",
    },
    {
      title: "Confidence you can trust",
      body: "High, medium, or low confidence on every answer. If there's no good source, Rufus flags it for review instead of inventing facts.",
    },
    {
      title: "Fix it once, reuse forever",
      body: "Edit any answer or add a missing fact to the knowledge base inline. Save the whole response to reuse on the next one.",
    },
  ],
  steps: [
    { n: "01", title: "Paste the RFP", body: "Drop in the text or upload the document. Rufus finds every question." },
    { n: "02", title: "Rufus drafts answers", body: "Each gets a sourced answer and a confidence score, pulled from your knowledge base." },
    { n: "03", title: "Review & export", body: "Approve, edit, or regenerate single answers, then export to DOCX or copy all." },
  ],
  pricing: { headline: "Per questionnaire, or credits", body: "Pay per questionnaire, or buy credits — typically 2–4 credits per answered question, scaled by complexity, because each answer is recalled from your knowledge base, analysed for the right source, and written in your tone. Re-answering one question is 2 credits." },
  faqs: [
    { q: "What if my knowledge base is empty?", a: "Rufus will prompt you to add entries first — the answers are only as good as your saved knowledge. Building the knowledge base takes minutes." },
    { q: "Will it make up answers?", a: "No. If a question has no good source, Rufus flags it as 'no source found, please review' rather than inventing facts." },
    { q: "Can I reuse answers across questionnaires?", a: "Yes. Saved responses and your knowledge base mean each new questionnaire gets faster and more consistent." },
  ],
};

export const contractsContent = {
  hero: {
    eyebrow: "Contract review",
    audience: "For founders & ops",
    title: "See the red flags",
    accent: "before you sign",
    rest: ".",
    sub: "Upload a contract or paste the text. Rufus returns a plain-English summary, a ranked list of red flags, and suggested edits — each tied to the exact clause.",
  },
  features: [
    {
      title: "Plain-English summary",
      body: "What the contract actually says, section by section, without the dense language. Read it in a couple of minutes.",
    },
    {
      title: "Ranked red flags",
      body: "Auto-renewals, uncapped liability, broad IP assignment, one-sided termination — each with a severity and why it's a concern.",
    },
    {
      title: "Suggested edits, ready to copy",
      body: "The original clause next to a proposed replacement, with a one-line reason. Copy any edit straight into your redline.",
    },
    {
      title: "Long documents handled",
      body: "If a contract is too long, Rufus reviews it section by section. Prompt caching keeps repeat actions on the same document cheap.",
    },
  ],
  steps: [
    { n: "01", title: "Upload or paste", body: "PDF, DOCX, or plain text. Rufus parses it and tells you if it needs a section-by-section pass." },
    { n: "02", title: "Rufus reviews it", body: "Summary, red flags, and suggested edits — organised into clear, scannable cards." },
    { n: "03", title: "Act on it", body: "Copy any suggested edit, export the review as a PDF report, and save it to your history." },
  ],
  pricing: { headline: "Per document, or credits", body: "Pay per document reviewed, or use credits. Multiple actions on the same contract stay cheap thanks to prompt caching." },
  faqs: [
    { q: "Is this legal advice?", a: "No. Rufus produces a plain-English summary, flags, and suggested edits for your review. It is not a lawyer and does not give legal advice." },
    { q: "What file types can I upload?", a: "PDF and DOCX are parsed to text, or you can paste text directly. Very long contracts are reviewed section by section." },
    { q: "Can I export the review?", a: "Yes — export the full review as a PDF report, and every review is saved to your history." },
  ],
};

export const homeFaqs = [
  { q: "What is Rufus?", a: "An AI workspace for the documents that win and close business: proposals and SOWs, RFP and questionnaire answers, and contract review — in one place." },
  { q: "Do I need to set anything up first?", a: "A short onboarding captures your company profile, and the RFP tool answers from a knowledge base you build. Both take only a few minutes." },
  { q: "How does pricing work?", a: "Plans include monthly AI credits, and you can buy credit packs any time. Every AI action shows a credit range before it runs; manual edits are always free." },
  { q: "Is Rufus a law firm?", a: "No. The contract review tool produces summaries, red flags, and suggested edits for your review — never legal advice." },
];
