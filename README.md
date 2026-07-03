# ProofTimeline

**Collect proof. Build evidence packets. Export clearly.**

ProofTimeline helps you collect real screenshots, photos, receipts, messages,
emails, videos, call notes, documents, and timelines into clean evidence
packets — for police report preparation, legal documentation, landlord
disputes, billing disputes, refund claims, workplace documentation,
harassment documentation, stolen item reports, customer support escalations,
insurance claims, and small claims preparation.

---

## Ethical rules (non-negotiable)

This app organizes **real, user-provided** documentation. It will never:

- Create fake screenshots, fake police reports, or fake legal documents
- Modify uploaded evidence or make it look official
- Fabricate timestamps, dates, people, locations, report numbers, or references
- Claim legal admissibility or acceptance by any authority
- Impersonate official agencies or use official-looking seals/formatting
- Pretend to submit anything directly to police or courts
- Encourage false reports

The document builder (`src/lib/packet.ts`) is deterministic: every line comes
verbatim from user input, and every missing field renders as **"Not
provided."** The follow-up script generator produces calm, professional
messages only — no threats, no false claims, and escalation is limited to the
phrasing *"I may seek professional advice."*

## Legal disclaimer

> ProofTimeline helps organize real documentation into clear evidence
> packets. It is not legal advice and does not guarantee acceptance by
> police, courts, companies, landlords, or agencies. Only upload truthful
> information. False reports or fabricated evidence may have serious
> consequences.

This disclaimer appears throughout the app and on every generated packet.

---

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** (deep navy / charcoal / ivory / muted gold design system)
- **Clerk** for authentication (with a zero-config local demo mode fallback)
- **Stripe** for subscriptions (mock upgrade flow until keys are set)
- **Supabase** for database + private file storage (full schema with RLS in
  `supabase/schema.sql`; local-first browser storage until configured)
- **React Hook Form + Zod** for validated forms
- **lucide-react** icons; PWA manifest included

### Local-first privacy model

Out of the box (no keys at all), ProofTimeline runs fully in the browser:
data is stored in `localStorage` namespaced per user, files under 2 MB are
kept inline, every file gets a **SHA-256 fingerprint computed client-side**,
and nothing ever leaves the device. Configuring Clerk/Supabase upgrades the
same data shapes to cloud accounts with Row Level Security.

---

## Setup

### 1. Local development

```bash
npm install
cp .env.example .env.local   # optional — the app runs with zero keys
npm run dev                  # http://localhost:3000
npm run build                # production build
```

### 2. Clerk setup

1. Create an application at [dashboard.clerk.com](https://dashboard.clerk.com).
2. Copy the publishable + secret keys into `.env.local`:
   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.
3. Set the sign-in/up paths (already defaulted in `.env.example`):
   `/sign-in`, `/sign-up`, after-auth redirect `/dashboard`.
4. That's it — `src/middleware.ts` automatically switches from demo mode to
   `clerkMiddleware` route protection, and `/sign-in`, `/sign-up` render the
   Clerk components. Two-factor authentication is managed in Clerk.

### 3. Supabase setup

1. Create a project at [supabase.com](https://supabase.com/dashboard).
2. Run `supabase/schema.sql` in the SQL editor — it creates all tables,
   Row Level Security policies, storage policies, and `updated_at` triggers.
3. Create a **private** storage bucket named `evidence`.
4. Configure Clerk as a third-party auth provider in Supabase (Auth →
   Third-Party Auth) so `auth.jwt()->>'sub'` resolves to the Clerk user id
   used by the RLS policies.
5. Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` (server-only, used by the Stripe webhook).

### 4. Stripe setup

1. Create three recurring prices (Starter $9, Pro $19, Family/Team $39) in
   [dashboard.stripe.com](https://dashboard.stripe.com).
2. Fill in `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
   `STRIPE_WEBHOOK_SECRET`, and the `STRIPE_PRICE_*` ids.
3. Complete the `TODO(stripe)` blocks in
   `src/app/api/stripe/checkout/route.ts` and
   `src/app/api/stripe/webhook/route.ts` (the exact code is inlined as
   comments). Until then, the billing page uses a clearly-labeled mock
   upgrade flow.

### Environment variables

See [.env.example](./.env.example) for the full annotated list. **Never
commit `.env` / `.env.local`** — they are gitignored, and no secrets are
hardcoded anywhere in the codebase.

---

## Database schema

Tables (all with `id`, `clerk_user_id`, `created_at`, `updated_at`):

| Table | Purpose |
| --- | --- |
| `profiles` | Display name/email per Clerk user |
| `cases` | Case folders: title, category, incident, status, urgency, follow-up |
| `evidence_items` | Evidence metadata + `file_url`, `file_name`, `file_type`, `file_size`, `file_hash`, `uploaded_at`, `created_or_captured_at`, `include_in_export` |
| `timeline_events` | Manual timeline events, key-event + show-in-packet flags |
| `evidence_logs` | Append-only integrity log per evidence item |
| `evidence_packets` | Generated packet snapshots (type, options, document JSON) |
| `follow_ups` | Deadline / follow-up tracker |
| `saved_scripts` | Saved follow-up scripts |
| `communications` | Email/call/message log with outcomes |
| `subscriptions` | Plan + Stripe ids (webhook-written, user-readable) |
| `usage_limits` | Cached usage counters |

### RLS security notes

- Every table has RLS **enabled** with a single owner policy:
  `clerk_user_id = auth.jwt()->>'sub'` for `USING` and `WITH CHECK`.
- `subscriptions` is read-only for users; only the Stripe webhook (service
  role key) writes to it.
- The `evidence` storage bucket is private; object paths are prefixed with
  the owner's Clerk user id and policies enforce owner-only read/write/delete.
- No public evidence by default, and **case sharing is disabled in the MVP**
  — there are no cross-user grants of any kind.

---

## Features

**Complete and working (no keys required):**

- Sign up / login / logout (Clerk when configured; local demo mode otherwise)
- Protected routes (`clerkMiddleware` or client guard)
- Landing page, pricing page, terms, privacy
- Create / edit / archive / delete cases (13 categories, 7 statuses, urgency,
  follow-up dates, private notes) with plan limits enforced
- Evidence upload with full metadata, tags, importance, include-in-export,
  browser-side **SHA-256 file fingerprints**, and re-verify integrity check
- Bulk select on evidence: move between cases, delete
- Search + filters across cases (category/status/urgency/text) and evidence
  (type/importance/tag/text)
- Auto-merged chronological timeline (incidents, evidence, communications,
  follow-ups, manual events; key-event and hide/show-in-packet controls)
- Evidence Packet Builder: 8 packet types, cover page, incident overview,
  desired outcome, timeline, evidence index + details, communications
  history, file fingerprints, disclaimer; user controls for private notes,
  hashes, contact details, timestamps, filenames, evidence selection
- Print / save-as-PDF view, JSON export, CSV evidence index
- Police Report Preparation mode (guided form, emergency + truthfulness
  warnings, evidence checklist, printable summary)
- Legal Documentation mode (6 guided flows with checklists)
- Follow-up script generator (9 types × 3 tones, safe wording, save/copy)
- Communications log with outcomes and next-follow-up dates
- Billing page with current-plan badge, usage meters, upgrade/downgrade
- Settings: profile, plan/usage, 4-digit app lock (hashed, device-only),
  privacy notes, export-all-data JSON, demo-data removal
- Demo data clearly marked "Demo"; demo packets stamped **DEMO ONLY**;
  free-plan packets watermarked
- PWA manifest

**Mocked / placeholder (clearly labeled in code):**

- Stripe checkout + webhook (`TODO(stripe)` blocks with exact implementation
  steps); upgrade flow applies the plan locally until keys exist
- Supabase persistence (schema + client helper ready; the store is
  local-first until keys exist)
- AI packet "polish" (the deterministic builder is the ground truth; an LLM
  pass would be added behind the same never-invent-facts rules)
- ZIP export with original files
- Team workspace, role-based access, audit log (Family/Team plan)
- Account deletion flow

---

## Deployment notes

- Deploy on Vercel (or any Node host): set the env vars from `.env.example`
  in the project settings.
- `npm run build` must pass with zero env vars (demo mode) — CI-safe.
- Point the Stripe webhook to `/api/stripe/webhook` after configuring keys.

## Roadmap

- End-to-end encrypted storage
- Certified timestamping
- OCR for receipts and documents
- Email/Gmail import
- WhatsApp screenshot parser
- Audio/video transcription
- Attorney sharing portal
- Official integrations only where legal APIs exist
- Mobile apps + push notifications
- Team workspaces with role-based access
- Stripe production billing
- Evidence packet templates by country/state
