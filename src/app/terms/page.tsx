import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { DISCLAIMER } from "@/lib/constants";

export const metadata = { title: "Terms of Service — ProofTimeline" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <ShieldCheck size={20} className="text-gold" />
        <span className="font-display font-bold">ProofTimeline</span>
      </Link>
      <h1 className="font-display text-3xl font-bold">Terms of Service</h1>
      <div className="prose-invert mt-6 space-y-5 text-sm leading-relaxed text-ivory/85">
        <p>
          ProofTimeline is a documentation and organization tool. By using it
          you agree to these terms.
        </p>
        <h2 className="font-display text-lg font-semibold text-ivory">1. Truthful use only</h2>
        <p>
          You may only upload truthful, real documentation that you have the
          right to hold. You must not use ProofTimeline to create, alter, or
          present fabricated evidence, forged timestamps, fake official
          documents, or false reports. False reports and fabricated evidence
          may have serious legal consequences for you.
        </p>
        <h2 className="font-display text-lg font-semibold text-ivory">2. Not legal advice</h2>
        <p>
          ProofTimeline is not a law firm, legal service, police service, or
          court filing system. Nothing in the app is legal advice, and no
          output is claimed to be admissible or accepted by any authority.
          Consult a qualified professional for legal matters.
        </p>
        <h2 className="font-display text-lg font-semibold text-ivory">3. No official submission</h2>
        <p>
          The app prepares documentation. It does not submit reports to
          police, courts, or agencies, and it does not represent or
          impersonate any official body.
        </p>
        <h2 className="font-display text-lg font-semibold text-ivory">4. Your data</h2>
        <p>
          Your cases and evidence belong to you. You can export or delete your
          data at any time from Settings. See the{" "}
          <Link href="/privacy" className="text-gold hover:underline">Privacy Policy</Link>{" "}
          for details on storage.
        </p>
        <h2 className="font-display text-lg font-semibold text-ivory">5. Disclaimer</h2>
        <p>{DISCLAIMER}</p>
      </div>
    </main>
  );
}
