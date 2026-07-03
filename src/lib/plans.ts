import type { PlanId } from "./types";

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // USD / month
  blurb: string;
  caseLimit: number | null; // null = unlimited
  evidenceLimit: number;
  features: string[];
  highlighted?: boolean;
  stripePriceEnv?: string;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    blurb: "Start documenting today.",
    caseLimit: 2,
    evidenceLimit: 25,
    features: [
      "2 active cases",
      "25 evidence items",
      "Basic timeline",
      "Basic export",
      "Local/limited storage",
      "Watermarked evidence packet",
      "No AI packet polish",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: 9,
    blurb: "For a single serious dispute.",
    caseLimit: 10,
    evidenceLimit: 250,
    stripePriceEnv: "STRIPE_PRICE_STARTER",
    features: [
      "10 active cases",
      "250 evidence items",
      "Evidence timeline",
      "Professional evidence packet export",
      "Follow-up script generator",
      "Deadline and follow-up tracker",
      "No watermark",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    blurb: "Full documentation toolkit.",
    caseLimit: null,
    evidenceLimit: 2000,
    highlighted: true,
    stripePriceEnv: "STRIPE_PRICE_PRO",
    features: [
      "Unlimited cases",
      "2,000 evidence items",
      "AI case summary polish",
      "AI evidence packet formatting",
      "Police report preparation mode",
      "Legal documentation mode",
      "PDF-style export",
      "File fingerprint/hash",
      "Evidence index",
      "Follow-up history",
      "Priority support",
    ],
  },
  {
    id: "team",
    name: "Family/Team",
    price: 39,
    blurb: "Best for families, small teams, and advocates.",
    caseLimit: null,
    evidenceLimit: 2000,
    stripePriceEnv: "STRIPE_PRICE_TEAM",
    features: [
      "Shared workspace (coming soon)",
      "Up to 5 members",
      "Role-based access (coming soon)",
      "Shared case folders",
      "Export packets",
      "Audit log (coming soon)",
    ],
  },
];

export function getPlan(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}
