import type {
  CaseCategory,
  CaseStatus,
  CommunicationType,
  EvidenceType,
  Importance,
  PacketType,
  Urgency,
} from "./types";

export const APP_NAME = "ProofTimeline";
export const TAGLINE = "Collect proof. Build evidence packets. Export clearly.";

export const DISCLAIMER =
  "ProofTimeline helps organize real documentation into clear evidence packets. It is not legal advice and does not guarantee acceptance by police, courts, companies, landlords, or agencies. Only upload truthful information. False reports or fabricated evidence may have serious consequences.";

export const TRUTH_WARNING =
  "Only upload truthful information. Do not fabricate or alter evidence.";

export const ORIGINALS_WARNING =
  "Keep original files outside the app too. Do not edit originals if you may need them later.";

export const PACKET_STATEMENT =
  "This packet was prepared from user-provided information and uploaded evidence. It is intended for organization and communication only.";

export const PRICING_DISCLAIMER =
  "ProofTimeline is an organization tool, not a law firm, legal service, police service, or court filing system.";

export const CATEGORIES: { value: CaseCategory; label: string }[] = [
  { value: "police_report", label: "Police Report Preparation" },
  { value: "legal_documentation", label: "Legal Documentation" },
  { value: "landlord_tenant", label: "Landlord/Tenant" },
  { value: "harassment", label: "Harassment Documentation" },
  { value: "stolen_item", label: "Stolen Item" },
  { value: "billing_dispute", label: "Billing Dispute" },
  { value: "refund_claim", label: "Refund Claim" },
  { value: "delivery_issue", label: "Delivery Issue" },
  { value: "workplace", label: "Workplace Documentation" },
  { value: "customer_support", label: "Customer Support" },
  { value: "insurance_claim", label: "Insurance Claim" },
  { value: "marketplace", label: "Marketplace Transaction" },
  { value: "other", label: "Other" },
];

export const STATUSES: { value: CaseStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "collecting", label: "Collecting Evidence" },
  { value: "ready", label: "Ready to Export" },
  { value: "submitted", label: "Submitted" },
  { value: "waiting", label: "Waiting for Response" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export const URGENCIES: { value: Urgency; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export const EVIDENCE_TYPES: { value: EvidenceType; label: string }[] = [
  { value: "photo", label: "Photo" },
  { value: "screenshot", label: "Screenshot" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio Note" },
  { value: "receipt", label: "Receipt" },
  { value: "pdf", label: "PDF" },
  { value: "email", label: "Email Text" },
  { value: "chat", label: "Chat Message" },
  { value: "call_note", label: "Call Note" },
  { value: "payment_proof", label: "Payment Proof" },
  { value: "location_note", label: "Location Note" },
  { value: "witness_note", label: "Witness Note" },
  { value: "before_after", label: "Before/After Photo" },
  { value: "other", label: "Other" },
];

export const IMPORTANCES: { value: Importance; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export const COMM_TYPES: { value: CommunicationType; label: string }[] = [
  { value: "email", label: "Email sent" },
  { value: "call", label: "Call made" },
  { value: "message", label: "Message sent" },
  { value: "in_person", label: "In person" },
  { value: "other", label: "Other" },
];

export const PACKET_TYPES: { value: PacketType; label: string }[] = [
  { value: "police_prep", label: "Police Report Preparation Packet" },
  { value: "attorney_review", label: "Attorney Review Packet" },
  { value: "landlord_tenant", label: "Landlord/Tenant Packet" },
  { value: "support_escalation", label: "Company Support Escalation Packet" },
  { value: "insurance_claim", label: "Insurance Claim Packet" },
  { value: "refund_claim", label: "Refund Claim Packet" },
  { value: "workplace", label: "Workplace Documentation Packet" },
  { value: "personal_backup", label: "Personal Backup Packet" },
];

export function labelFor<T extends string>(
  list: { value: T; label: string }[],
  value: T
): string {
  return list.find((i) => i.value === value)?.label ?? value;
}

export const STATUS_COLORS: Record<CaseStatus, string> = {
  draft: "bg-muted/15 text-muted border-muted/30",
  collecting: "bg-gold/10 text-gold border-gold/30",
  ready: "bg-emeraldx/10 text-emeraldx border-emeraldx/30",
  submitted: "bg-sky-400/10 text-sky-300 border-sky-400/30",
  waiting: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  resolved: "bg-emeraldx/15 text-emeraldx border-emeraldx/40",
  closed: "bg-muted/10 text-muted border-muted/25",
};

export const IMPORTANCE_COLORS: Record<Importance, string> = {
  low: "bg-muted/10 text-muted border-muted/25",
  medium: "bg-sky-400/10 text-sky-300 border-sky-400/30",
  high: "bg-gold/10 text-gold border-gold/30",
  critical: "bg-danger/10 text-danger border-danger/30",
};
