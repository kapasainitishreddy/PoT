/**
 * Follow-up script generator.
 *
 * Rules: calm and professional only. No threats, blackmail, harassment,
 * false claims, or impersonation. The escalation template uses the careful
 * phrasing "I may seek professional advice" and nothing stronger.
 * Placeholders like [name] are left for the user to fill with real details —
 * the generator never invents names, dates, or reference numbers.
 */

export type ScriptType =
  | "submit_packet"
  | "ask_update"
  | "request_confirmation"
  | "escalate"
  | "request_refund"
  | "request_repair"
  | "request_deadline"
  | "confirm_resolution"
  | "close_case";

export type Tone = "soft" | "direct" | "professional";

export const SCRIPT_TYPES: { value: ScriptType; label: string }[] = [
  { value: "submit_packet", label: "Submit evidence packet" },
  { value: "ask_update", label: "Ask for update" },
  { value: "request_confirmation", label: "Request written confirmation" },
  { value: "escalate", label: "Escalate issue" },
  { value: "request_refund", label: "Request refund" },
  { value: "request_repair", label: "Request repair" },
  { value: "request_deadline", label: "Request response by deadline" },
  { value: "confirm_resolution", label: "Confirm resolution" },
  { value: "close_case", label: "Close case" },
];

export const TONES: { value: Tone; label: string }[] = [
  { value: "soft", label: "Soft" },
  { value: "direct", label: "Direct" },
  { value: "professional", label: "Professional" },
];

interface ScriptContext {
  caseTitle: string;
  organization: string;
  desiredOutcome: string;
}

const OPENERS: Record<Tone, string> = {
  soft: "Hello, I hope you are doing well.",
  direct: "Hello,",
  professional: "Dear Sir or Madam,",
};

const CLOSERS: Record<Tone, string> = {
  soft: "Thank you very much for your time and help.\n\nKind regards,\n[Your name]",
  direct: "Thank you.\n\n[Your name]",
  professional: "Thank you for your attention to this matter.\n\nSincerely,\n[Your name]",
};

export function generateScript(
  type: ScriptType,
  tone: Tone,
  ctx: ScriptContext
): string {
  const org = ctx.organization.trim() || "[organization]";
  const subjectRef = ctx.caseTitle.trim() || "[case reference]";
  const outcome = ctx.desiredOutcome.trim() || "[desired outcome]";

  const bodies: Record<ScriptType, string> = {
    submit_packet: `I am writing regarding "${subjectRef}". I have organized the relevant documentation into an evidence packet, which I am submitting with this message. It includes a summary of what happened, a chronological timeline, and an index of the supporting materials.\n\nPlease let me know if any additional information is needed, and how you would like me to proceed.`,
    ask_update: `I am following up on "${subjectRef}", which I previously raised with ${org}. Could you please share an update on its current status and the expected next step?`,
    request_confirmation: `Regarding "${subjectRef}": could you please confirm in writing what was discussed and agreed? Having written confirmation helps me keep accurate records on my side.`,
    escalate: `I am writing about "${subjectRef}". I have not yet been able to resolve this through the previous channel, so I would like to respectfully escalate it for review.\n\nMy requested resolution is: ${outcome}\n\nI would prefer to resolve this directly with ${org}. If we are unable to make progress, I may seek professional advice on the appropriate next steps.`,
    request_refund: `I am requesting a refund in connection with "${subjectRef}". Based on the documentation I have collected, my requested resolution is: ${outcome}\n\nPlease let me know what you need from me to process this, and the expected timeline.`,
    request_repair: `I am requesting a repair in connection with "${subjectRef}". The issue remains unresolved and I have documented it with dated records. Could you please schedule the repair and confirm the date in writing?`,
    request_deadline: `I am following up on "${subjectRef}". To keep this moving, could you please respond by [date]? If that timeline is not possible, please let me know when I can expect a response.`,
    confirm_resolution: `Thank you for resolving "${subjectRef}". I am writing to confirm my understanding of the resolution: ${outcome}\n\nIf anything above is inaccurate, please let me know. Otherwise I will consider this matter resolved.`,
    close_case: `I am writing to formally close "${subjectRef}" on my side. Thank you for your assistance throughout. Please keep this correspondence for your records, as I will for mine.`,
  };

  return `${OPENERS[tone]}\n\n${bodies[type]}\n\n${CLOSERS[tone]}`;
}
