import { AlertTriangle, ShieldCheck } from "lucide-react";
import {
  DISCLAIMER,
  IMPORTANCE_COLORS,
  IMPORTANCES,
  STATUS_COLORS,
  STATUSES,
  labelFor,
} from "@/lib/constants";
import type { CaseStatus, Importance } from "@/lib/types";
import type { ReactNode } from "react";

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-lg border border-line bg-navy-850/60 text-muted ${
        compact ? "px-3 py-2 text-[11px]" : "px-4 py-3 text-xs"
      }`}
    >
      <span className="mr-1.5 inline-flex align-middle text-gold/70">
        <ShieldCheck size={compact ? 12 : 14} />
      </span>
      {DISCLAIMER}
    </div>
  );
}

export function WarningBanner({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3">
      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-danger" />
      <p className="text-sm text-ivory/90">{children}</p>
    </div>
  );
}

export function StatusBadge({ status }: { status: CaseStatus }) {
  return (
    <span className={`pill ${STATUS_COLORS[status]}`}>
      {labelFor(STATUSES, status)}
    </span>
  );
}

export function ImportanceBadge({ importance }: { importance: Importance }) {
  return (
    <span className={`pill ${IMPORTANCE_COLORS[importance]}`}>
      {labelFor(IMPORTANCES, importance)}
    </span>
  );
}

export function DemoBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="pill border-sky-400/40 bg-sky-400/10 text-sky-300">Demo</span>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ivory md:text-3xl">
          {title}
        </h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
      <p className="font-display text-lg font-semibold text-ivory">{title}</p>
      {subtitle ? <p className="max-w-md text-sm text-muted">{subtitle}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function UsageMeter({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number | null;
}) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wider text-muted">{label}</span>
        <span className="text-muted">
          {used}
          {limit != null ? ` / ${limit}` : " · unlimited"}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-700">
        <div
          className={`h-full rounded-full transition-all ${
            pct >= 100 ? "bg-danger" : pct >= 80 ? "bg-amber-400" : "bg-gold"
          }`}
          style={{ width: limit != null ? `${pct}%` : "8%" }}
        />
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
