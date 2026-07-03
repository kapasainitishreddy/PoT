import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata = { title: "Privacy Policy — ProofTimeline" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <ShieldCheck size={20} className="text-gold" />
        <span className="font-display font-bold">ProofTimeline</span>
      </Link>
      <h1 className="font-display text-3xl font-bold">Privacy Policy</h1>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-ivory/85">
        <h2 className="font-display text-lg font-semibold text-ivory">Private by default</h2>
        <p>
          Every case and evidence item belongs to your account only. There is
          no public evidence, and case sharing is disabled. In local mode
          (the default without cloud keys configured), all data is stored in
          your browser and never leaves your device.
        </p>
        <h2 className="font-display text-lg font-semibold text-ivory">Cloud mode</h2>
        <p>
          When the app is deployed with Supabase, data is stored in a database
          protected by Row Level Security so only your authenticated account
          can read your rows, and files live in a private storage bucket
          scoped to your user id. Authentication is handled by Clerk.
        </p>
        <h2 className="font-display text-lg font-semibold text-ivory">File integrity</h2>
        <p>
          Uploaded files are never modified. A SHA-256 fingerprint is computed
          in your browser at upload time so you can verify a file has not
          changed since.
        </p>
        <h2 className="font-display text-lg font-semibold text-ivory">Your controls</h2>
        <p>
          Settings lets you export all of your data as JSON and delete your
          workspace data. An optional 4-digit app lock (stored only as a hash
          on your device) adds a privacy screen on shared devices.
        </p>
        <h2 className="font-display text-lg font-semibold text-ivory">Contact</h2>
        <p>
          Questions about privacy can be raised through the support channel of
          your plan.
        </p>
      </div>
    </main>
  );
}
