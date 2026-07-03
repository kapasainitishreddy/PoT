export type CaseCategory =
  | "police_report"
  | "legal_documentation"
  | "landlord_tenant"
  | "harassment"
  | "stolen_item"
  | "billing_dispute"
  | "refund_claim"
  | "delivery_issue"
  | "workplace"
  | "customer_support"
  | "insurance_claim"
  | "marketplace"
  | "other";

export type CaseStatus =
  | "draft"
  | "collecting"
  | "ready"
  | "submitted"
  | "waiting"
  | "resolved"
  | "closed";

export type Urgency = "low" | "medium" | "high" | "critical";

export type EvidenceType =
  | "photo"
  | "screenshot"
  | "video"
  | "audio"
  | "receipt"
  | "pdf"
  | "email"
  | "chat"
  | "call_note"
  | "payment_proof"
  | "location_note"
  | "witness_note"
  | "before_after"
  | "other";

export type Importance = "low" | "medium" | "high" | "critical";

export interface Case {
  id: string;
  clerk_user_id: string;
  title: string;
  category: CaseCategory;
  incident_at: string; // ISO datetime
  location: string;
  people_involved: string;
  organization: string;
  what_happened: string;
  desired_outcome: string;
  urgency: Urgency;
  status: CaseStatus;
  private_notes: string;
  follow_up_date: string; // ISO date or ""
  is_archived: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface EvidenceItem {
  id: string;
  clerk_user_id: string;
  case_id: string;
  title: string;
  type: EvidenceType;
  created_or_captured_at: string;
  uploaded_at: string;
  description: string;
  source: string;
  related_event: string;
  importance: Importance;
  tags: string[];
  file_name: string;
  file_type: string;
  file_size: number;
  file_hash: string; // SHA-256 hex
  file_data_url: string; // local-mode inline storage; Supabase mode stores file_url
  file_url: string;
  private_note: string;
  include_in_export: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimelineEvent {
  id: string;
  clerk_user_id: string;
  case_id: string;
  happened_at: string;
  title: string;
  description: string;
  evidence_ids: string[];
  importance: Importance;
  tags: string[];
  source: string;
  is_key_event: boolean;
  show_in_packet: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export type CommunicationType = "email" | "call" | "message" | "in_person" | "other";

export interface Communication {
  id: string;
  clerk_user_id: string;
  case_id: string;
  type: CommunicationType;
  person_contacted: string;
  happened_at: string;
  summary: string;
  outcome: string;
  next_follow_up: string;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export type PacketType =
  | "police_prep"
  | "attorney_review"
  | "landlord_tenant"
  | "support_escalation"
  | "insurance_claim"
  | "refund_claim"
  | "workplace"
  | "personal_backup";

export interface PacketOptions {
  includeAllEvidence: boolean;
  selectedEvidenceIds: string[];
  hidePrivateNotes: boolean;
  includeFileHashes: boolean;
  includeScripts: boolean;
  includeContactDetails: boolean;
  includeUploadTimestamps: boolean;
  includeOriginalFilenames: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export interface SavedScript {
  id: string;
  clerk_user_id: string;
  case_id: string;
  script_type: string;
  tone: string;
  body: string;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export type PlanId = "free" | "starter" | "pro" | "team";

export interface Subscription {
  plan: PlanId;
  // TODO(stripe): persist stripe_customer_id / stripe_subscription_id when
  // real Stripe checkout is wired up. See src/app/api/stripe/checkout.
}

export interface StoreData {
  cases: Case[];
  evidence: EvidenceItem[];
  events: TimelineEvent[];
  communications: Communication[];
  scripts: SavedScript[];
  subscription: Subscription;
  demoSeeded: boolean;
}
