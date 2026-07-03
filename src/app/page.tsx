import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  Camera,
  Clock,
  FileCheck2,
  FileText,
  ListTree,
  Package,
  Receipt,
  Scale,
  Shield,
  ShieldCheck,
  ShieldOff,
  Siren,
  Wallet,
  Briefcase,
  UserRoundX,
  Backpack,
  Umbrella,
} from "lucide-react";
import { Disclaimer } from "@/components/ui";
import { TRUTH_WARNING } from "@/lib/constants";

const TRUST = [
  { icon: Camera, title: "Real evidence only", text: "Original files stay unaltered. The app organizes — it never edits or fabricates." },
  { icon: Clock, title: "Timestamped uploads", text: "Every item records when it was captured and when it was uploaded." },
  { icon: ListTree, title: "Organized timeline", text: "Incidents, evidence, and communications merge into one clear chronology." },
  { icon: Package, title: "Export-ready packets", text: "Cover page, timeline, evidence index, and file fingerprints — print or save as PDF." },
  { icon: Scale, title: "Not legal advice", text: "A documentation tool that prepares you for official channels. Nothing more claimed." },
];

const USE_CASES = [
  { icon: Siren, label: "Police report preparation" },
  { icon: Building2, label: "Landlord disputes" },
  { icon: Receipt, label: "Billing disputes" },
  { icon: Wallet, label: "Refund claims" },
  { icon: Briefcase, label: "Workplace documentation" },
  { icon: UserRoundX, label: "Harassment documentation" },
  { icon: Backpack, label: "Stolen item reports" },
  { icon: Umbrella, label: "Insurance claims" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy-900">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-6">
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={22} className="text-gold" />
          <span className="font-display text-lg font-bold tracking-tight">ProofTimeline</span>
        </div>
        <nav className="flex items-center gap-2 md:gap-4">
          <Link href="/pricing" className="hidden text-sm text-muted hover:text-ivory md:block">
            Pricing
          </Link>
          <Link href="/sign-in" className="btn-ghost">Sign in</Link>
          <Link href="/sign-up" className="btn-primary">Start Free</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(700px 340px at 50% -10%, rgba(233,193,118,0.10), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-16 text-center md:pt-24">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-navy-850 px-3.5 py-1.5 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            Secure, private evidence workspace
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Turn scattered proof into a{" "}
            <span className="text-gold">clear evidence packet.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted md:text-lg">
            Collect screenshots, receipts, messages, photos, videos, notes, and
            timelines in one secure workspace.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/sign-up" className="btn-primary px-7 py-3 text-base">
              <Shield size={18} /> Start Free
            </Link>
            <Link href="/sign-in" className="btn-outline px-7 py-3 text-base">
              <FileText size={18} /> View Demo Packet
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted">
            Free plan works entirely on your device — no keys, no upload required.
          </p>
        </div>
      </section>

      {/* Warning banner */}
      <section className="mx-auto max-w-3xl px-4">
        <div className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/5 px-5 py-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-danger" />
          <p className="text-sm">
            <span className="font-semibold text-danger">Integrity notice: </span>
            {TRUTH_WARNING}
          </p>
        </div>
      </section>

      {/* Trust bullets */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <h2 className="mb-10 text-center font-display text-2xl font-bold md:text-3xl">
          Built for honest documentation
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST.map((t) => (
            <div key={t.title} className="card p-6">
              <t.icon size={20} className="mb-4 text-gold" />
              <h3 className="font-display font-semibold">{t.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{t.text}</p>
            </div>
          ))}
          <div className="card border-gold/25 p-6">
            <ShieldOff size={20} className="mb-4 text-gold" />
            <h3 className="font-display font-semibold">What this app will never do</h3>
            <p className="mt-1.5 text-sm text-muted">
              No fake screenshots, no fake police reports or legal documents, no
              altered evidence, no fabricated timestamps, no claims of legal
              admissibility, no impersonation of official agencies.
            </p>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-24">
        <h2 className="mb-10 text-center font-display text-2xl font-bold md:text-3xl">
          Made for real situations
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {USE_CASES.map((u) => (
            <div
              key={u.label}
              className="card group flex flex-col items-center gap-3 p-5 text-center transition-colors hover:border-gold/40"
            >
              <u.icon size={22} className="text-muted transition-colors group-hover:text-gold" />
              <span className="text-sm font-semibold">{u.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 pb-20 text-center">
        <div className="card-gold px-6 py-12">
          <FileCheck2 size={26} className="mx-auto mb-4 text-gold" />
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            Collect proof. Build evidence packets. Export clearly.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
            Create a secure place for proof, timelines, and evidence packets —
            ready when you speak with police, a landlord, a company, or a
            qualified professional.
          </p>
          <Link href="/sign-up" className="btn-primary mt-6 px-7 py-3 text-base">
            Start Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <Disclaimer />
          <div className="mt-6 flex flex-col items-start justify-between gap-4 text-xs text-muted md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-gold/60" />
              <span>© {new Date().getFullYear()} ProofTimeline</span>
            </div>
            <div className="flex gap-5">
              <Link href="/pricing" className="hover:text-ivory">Pricing</Link>
              <Link href="/terms" className="hover:text-ivory">Terms</Link>
              <Link href="/privacy" className="hover:text-ivory">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
