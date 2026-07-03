"use client";

import { SignIn } from "@clerk/nextjs";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { clerkEnabled } from "@/lib/auth";
import { Disclaimer } from "@/components/ui";
import LocalAuthCard from "@/components/LocalAuthCard";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10">
      <Link href="/" className="flex items-center gap-2.5">
        <ShieldCheck size={22} className="text-gold" />
        <span className="font-display text-lg font-bold">ProofTimeline</span>
      </Link>
      <p className="text-sm text-muted">Your evidence workspace is private.</p>
      {clerkEnabled ? <SignIn /> : <LocalAuthCard mode="sign-in" />}
      <div className="w-full max-w-md">
        <Disclaimer compact />
      </div>
    </div>
  );
}
