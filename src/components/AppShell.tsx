"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  CreditCard,
  FileText,
  FolderOpen,
  Gavel,
  LayoutDashboard,
  ListTree,
  Lock,
  LogOut,
  MessageSquareText,
  Package,
  Settings,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { clerkEnabled, useAppUser, useRequireUser } from "@/lib/auth";
import { initStore, useStore } from "@/lib/store";
import { getPlan } from "@/lib/plans";
import PinLock, { lockApp, pinIsSet } from "./PinLock";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cases", label: "Cases", icon: FolderOpen },
  { href: "/evidence", label: "Evidence", icon: Shield },
  { href: "/timeline", label: "Timeline", icon: ListTree },
  { href: "/packets", label: "Packets", icon: Package },
  { href: "/police-report", label: "Police Prep", icon: FileText },
  { href: "/legal", label: "Legal Mode", icon: Gavel },
  { href: "/scripts", label: "Scripts", icon: MessageSquareText },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

const MOBILE_NAV = NAV.filter((n) =>
  ["/dashboard", "/cases", "/evidence", "/timeline", "/packets", "/settings"].includes(
    n.href
  )
);

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Shield;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-gold/10 font-semibold text-gold"
          : "text-muted hover:bg-navy-800 hover:text-ivory"
      }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready } = useRequireUser();
  const { signOutLocal } = useAppUser();
  const { subscription, cases, evidence } = useStore();
  const plan = getPlan(subscription.plan);

  useEffect(() => {
    if (user) initStore(user.id);
  }, [user]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        <ShieldCheck className="mr-2 animate-pulse text-gold" size={18} />
        Opening your private workspace…
      </div>
    );
  }

  const activeCases = cases.filter((c) => !c.is_archived).length;

  return (
    <div className="min-h-screen">
      <PinLock />

      {/* Desktop sidebar */}
      <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-navy-850 lg:flex">
        <Link href="/dashboard" className="flex items-center gap-2.5 px-5 py-5">
          <ShieldCheck size={22} className="text-gold" />
          <span className="font-display text-lg font-bold tracking-tight text-ivory">
            ProofTimeline
          </span>
        </Link>
        <div className="mx-4 mb-4 rounded-lg border border-line bg-navy-900 px-3 py-2.5">
          <p className="truncate text-sm font-semibold text-ivory">{user.name}</p>
          <p className="text-xs text-muted">
            {plan.name} plan · {activeCases} case{activeCases === 1 ? "" : "s"} ·{" "}
            {evidence.length} items
          </p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {NAV.map((n) => (
            <NavLink
              key={n.href}
              {...n}
              active={pathname === n.href || pathname.startsWith(n.href + "/")}
            />
          ))}
        </nav>
        <div className="space-y-1 border-t border-line p-3">
          {pinIsSet() ? (
            <button
              onClick={lockApp}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-navy-800 hover:text-ivory"
            >
              <Lock size={16} /> Lock app
            </button>
          ) : null}
          {clerkEnabled ? (
            <SignOutButton redirectUrl="/">
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-navy-800 hover:text-ivory">
                <LogOut size={16} /> Sign out
              </button>
            </SignOutButton>
          ) : (
            <button
              onClick={() => {
                signOutLocal();
                router.replace("/");
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-navy-800 hover:text-ivory"
            >
              <LogOut size={16} /> Sign out
            </button>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-line bg-navy-900/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-gold" />
          <span className="font-display font-bold text-ivory">ProofTimeline</span>
        </Link>
        <span className="pill border-gold/30 bg-gold/10 text-gold">{plan.name}</span>
      </header>

      <main className="px-4 pb-28 pt-6 lg:ml-64 lg:px-8 lg:pb-12">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="no-print fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-line bg-navy-950/95 px-1 py-1.5 backdrop-blur lg:hidden">
        {MOBILE_NAV.map((n) => {
          const active = pathname === n.href || pathname.startsWith(n.href + "/");
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold ${
                active ? "text-gold" : "text-muted"
              }`}
            >
              <n.icon size={18} />
              {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
