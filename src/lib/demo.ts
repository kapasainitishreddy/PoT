import type { StoreData } from "./types";

/**
 * Demo data — clearly marked "Demo" everywhere it appears.
 * It is intentionally mundane and never styled to look like real
 * official evidence. All packet pages rendered from demo cases are
 * stamped "DEMO ONLY".
 */
export function seedDemoData(data: StoreData, userId: string): StoreData {
  const t = (daysAgo: number, hour = 10) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  const base = {
    clerk_user_id: userId,
    is_demo: true,
    private_notes: "",
    is_archived: false,
  };

  const c1 = {
    ...base,
    id: "demo-case-1",
    title: "Demo — Damaged headphones refund",
    category: "refund_claim" as const,
    incident_at: t(21),
    location: "Online order",
    people_involved: "Support agent (first name only in chat)",
    organization: "Example Electronics Store",
    what_happened:
      "Headphones arrived with a cracked headband. Requested a refund through the store's support chat; was asked for photos and the order number.",
    desired_outcome: "Full refund to original payment method.",
    urgency: "medium" as const,
    status: "waiting" as const,
    follow_up_date: t(-3).slice(0, 10),
    created_at: t(21),
    updated_at: t(2),
  };

  const c2 = {
    ...base,
    id: "demo-case-2",
    title: "Demo — Landlord repair issue",
    category: "landlord_tenant" as const,
    incident_at: t(45),
    location: "Apartment unit (kitchen)",
    people_involved: "Property manager",
    organization: "Example Property Management",
    what_happened:
      "Kitchen sink has been leaking under the cabinet. Reported by email twice; no repair scheduled yet. Water damage is spreading to the cabinet base.",
    desired_outcome: "Repair scheduled and completed; written confirmation.",
    urgency: "high" as const,
    status: "collecting" as const,
    follow_up_date: t(-5).slice(0, 10),
    created_at: t(45),
    updated_at: t(4),
  };

  const c3 = {
    ...base,
    id: "demo-case-3",
    title: "Demo — Internet bill overcharge",
    category: "billing_dispute" as const,
    incident_at: t(14),
    location: "Monthly bill",
    people_involved: "Billing department",
    organization: "Example Internet Provider",
    what_happened:
      "Monthly bill increased by $30 without notice. Plan documents show a 12-month fixed price that has not expired.",
    desired_outcome: "Bill corrected to the agreed price and credit applied.",
    urgency: "medium" as const,
    status: "draft" as const,
    follow_up_date: "",
    created_at: t(14),
    updated_at: t(14),
  };

  const c4 = {
    ...base,
    id: "demo-case-4",
    title: "Demo — Stolen backpack report preparation",
    category: "police_report" as const,
    incident_at: t(7, 18),
    location: "Coffee shop, Main Street",
    people_involved: "Unknown",
    organization: "",
    what_happened:
      "Backpack taken from a chair while ordering. Contained a laptop and notebook. Staff said cameras may cover the seating area.",
    desired_outcome: "File a police report with an organized summary and evidence list.",
    urgency: "high" as const,
    status: "ready" as const,
    follow_up_date: "",
    created_at: t(7),
    updated_at: t(1),
  };

  const ev = (
    id: string,
    caseId: string,
    title: string,
    type: string,
    daysAgo: number,
    description: string,
    source: string,
    importance: string,
    tags: string[]
  ) => ({
    id,
    clerk_user_id: userId,
    case_id: caseId,
    title: `Demo — ${title}`,
    type: type as never,
    created_or_captured_at: t(daysAgo),
    uploaded_at: t(daysAgo - 1 < 0 ? 0 : daysAgo - 1),
    description,
    source,
    related_event: "",
    importance: importance as never,
    tags,
    file_name: "",
    file_type: "",
    file_size: 0,
    file_hash: "",
    file_data_url: "",
    file_url: "",
    private_note: "",
    include_in_export: true,
    is_demo: true,
    created_at: t(daysAgo),
    updated_at: t(daysAgo),
  });

  const evidence = [
    ev("demo-ev-1", "demo-case-1", "Unboxing photo of cracked headband", "photo", 20, "Photo taken immediately after opening the package.", "Self", "high", ["damage", "delivery"]),
    ev("demo-ev-2", "demo-case-1", "Order confirmation email", "email", 24, "Order number and price for the headphones.", "Example Electronics Store", "medium", ["order"]),
    ev("demo-ev-3", "demo-case-1", "Support chat transcript", "chat", 18, "Chat where the agent requested photos and promised follow-up.", "Store support chat", "high", ["support"]),
    ev("demo-ev-4", "demo-case-2", "Photo of leak under sink", "photo", 40, "Water pooling under the kitchen sink cabinet.", "Self", "critical", ["leak", "damage"]),
    ev("demo-ev-5", "demo-case-2", "First repair request email", "email", 38, "Email to property manager describing the leak.", "Self", "high", ["request"]),
    ev("demo-ev-6", "demo-case-3", "Bill showing new higher charge", "receipt", 12, "Latest bill with the increased amount.", "Example Internet Provider", "high", ["billing"]),
    ev("demo-ev-7", "demo-case-4", "Note on time and seating location", "witness_note", 7, "Written note of the timeline and where the backpack was placed.", "Self", "medium", ["notes"]),
  ];

  const evn = (
    id: string,
    caseId: string,
    daysAgo: number,
    title: string,
    description: string,
    importance: string,
    key = false
  ) => ({
    id,
    clerk_user_id: userId,
    case_id: caseId,
    happened_at: t(daysAgo),
    title: `Demo — ${title}`,
    description,
    evidence_ids: [],
    importance: importance as never,
    tags: [],
    source: "",
    is_key_event: key,
    show_in_packet: true,
    is_demo: true,
    created_at: t(daysAgo),
    updated_at: t(daysAgo),
  });

  const events = [
    evn("demo-tl-1", "demo-case-1", 21, "Package delivered damaged", "Headphones arrived with cracked headband.", "high", true),
    evn("demo-tl-2", "demo-case-1", 18, "Contacted support", "Opened support chat and shared photos.", "medium"),
    evn("demo-tl-3", "demo-case-2", 45, "Leak first noticed", "Water under the kitchen sink cabinet.", "critical", true),
    evn("demo-tl-4", "demo-case-2", 38, "First repair request sent", "Email sent to property manager.", "high"),
    evn("demo-tl-5", "demo-case-2", 20, "Second repair request sent", "Follow-up email; no response received.", "high"),
    evn("demo-tl-6", "demo-case-3", 14, "Higher bill received", "Bill increased by $30 without notice.", "high", true),
    evn("demo-tl-7", "demo-case-4", 7, "Backpack taken", "Backpack taken from chair at coffee shop.", "critical", true),
  ];

  const communications = [
    {
      id: "demo-comm-1",
      clerk_user_id: userId,
      case_id: "demo-case-2",
      type: "email" as const,
      person_contacted: "Property manager",
      happened_at: t(20),
      summary: "Demo — Second repair request with photos attached.",
      outcome: "No response yet.",
      next_follow_up: t(-5).slice(0, 10),
      is_demo: true,
      created_at: t(20),
      updated_at: t(20),
    },
  ];

  return {
    ...data,
    cases: [...data.cases, c1, c2, c3, c4],
    evidence: [...data.evidence, ...evidence],
    events: [...data.events, ...events],
    communications: [...data.communications, ...communications],
  };
}
