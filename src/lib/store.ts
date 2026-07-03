"use client";

/**
 * Local-first data store.
 *
 * Privacy model: all case and evidence data lives in the browser
 * (localStorage) namespaced per user. Nothing is sent to a server unless
 * Supabase is configured. supabase/schema.sql contains the production
 * schema (with Row Level Security) that mirrors these shapes 1:1 —
 * swapping this module's persistence for Supabase queries is the
 * production upgrade path documented in the README.
 */

import { useSyncExternalStore } from "react";
import type {
  Case,
  Communication,
  EvidenceItem,
  SavedScript,
  StoreData,
  Subscription,
  TimelineEvent,
} from "./types";
import { seedDemoData } from "./demo";

const EMPTY: StoreData = {
  cases: [],
  evidence: [],
  events: [],
  communications: [],
  scripts: [],
  subscription: { plan: "free" },
  demoSeeded: false,
};

let currentUserId = "";
let cache: StoreData = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function storageKey(userId: string) {
  return `prooftimeline:data:${userId}`;
}

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  if (typeof window === "undefined" || !currentUserId) return;
  try {
    window.localStorage.setItem(storageKey(currentUserId), JSON.stringify(cache));
  } catch {
    // Storage quota exceeded — metadata still lives in memory for the session.
  }
}

export function initStore(userId: string) {
  if (typeof window === "undefined") return;
  if (loaded && currentUserId === userId) return;
  currentUserId = userId;
  const raw = window.localStorage.getItem(storageKey(userId));
  if (raw) {
    try {
      cache = { ...EMPTY, ...(JSON.parse(raw) as StoreData) };
    } catch {
      cache = { ...EMPTY };
    }
  } else {
    cache = { ...EMPTY };
  }
  if (!cache.demoSeeded) {
    cache = seedDemoData(cache, userId);
    cache.demoSeeded = true;
    persist();
  }
  loaded = true;
  emit();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): StoreData {
  return cache;
}

export function getServerSnapshot(): StoreData {
  return EMPTY;
}

export function useStore(): StoreData {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function update(mutator: (data: StoreData) => StoreData) {
  cache = mutator(cache);
  persist();
  emit();
}

export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  );
}

export function nowIso(): string {
  return new Date().toISOString();
}

/* ------------------------------- Cases -------------------------------- */

export function createCase(data: Omit<Case, "id" | "created_at" | "updated_at">): Case {
  const item: Case = { ...data, id: uid(), created_at: nowIso(), updated_at: nowIso() };
  update((d) => ({ ...d, cases: [item, ...d.cases] }));
  return item;
}

export function updateCase(id: string, patch: Partial<Case>) {
  update((d) => ({
    ...d,
    cases: d.cases.map((c) =>
      c.id === id ? { ...c, ...patch, updated_at: nowIso() } : c
    ),
  }));
}

export function deleteCase(id: string) {
  update((d) => ({
    ...d,
    cases: d.cases.filter((c) => c.id !== id),
    evidence: d.evidence.filter((e) => e.case_id !== id),
    events: d.events.filter((e) => e.case_id !== id),
    communications: d.communications.filter((c) => c.case_id !== id),
    scripts: d.scripts.filter((s) => s.case_id !== id),
  }));
}

/* ------------------------------ Evidence ------------------------------ */

export function createEvidence(
  data: Omit<EvidenceItem, "id" | "created_at" | "updated_at">
): EvidenceItem {
  const item: EvidenceItem = {
    ...data,
    id: uid(),
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  update((d) => ({ ...d, evidence: [item, ...d.evidence] }));
  return item;
}

export function updateEvidence(id: string, patch: Partial<EvidenceItem>) {
  update((d) => ({
    ...d,
    evidence: d.evidence.map((e) =>
      e.id === id ? { ...e, ...patch, updated_at: nowIso() } : e
    ),
  }));
}

export function deleteEvidence(ids: string[]) {
  const set = new Set(ids);
  update((d) => ({ ...d, evidence: d.evidence.filter((e) => !set.has(e.id)) }));
}

export function moveEvidence(ids: string[], caseId: string) {
  const set = new Set(ids);
  update((d) => ({
    ...d,
    evidence: d.evidence.map((e) =>
      set.has(e.id) ? { ...e, case_id: caseId, updated_at: nowIso() } : e
    ),
  }));
}

/* --------------------------- Timeline events -------------------------- */

export function createEvent(
  data: Omit<TimelineEvent, "id" | "created_at" | "updated_at">
): TimelineEvent {
  const item: TimelineEvent = {
    ...data,
    id: uid(),
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  update((d) => ({ ...d, events: [item, ...d.events] }));
  return item;
}

export function updateEvent(id: string, patch: Partial<TimelineEvent>) {
  update((d) => ({
    ...d,
    events: d.events.map((e) =>
      e.id === id ? { ...e, ...patch, updated_at: nowIso() } : e
    ),
  }));
}

export function deleteEvent(id: string) {
  update((d) => ({ ...d, events: d.events.filter((e) => e.id !== id) }));
}

/* ---------------------------- Communications -------------------------- */

export function createCommunication(
  data: Omit<Communication, "id" | "created_at" | "updated_at">
): Communication {
  const item: Communication = {
    ...data,
    id: uid(),
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  update((d) => ({ ...d, communications: [item, ...d.communications] }));
  return item;
}

export function deleteCommunication(id: string) {
  update((d) => ({
    ...d,
    communications: d.communications.filter((c) => c.id !== id),
  }));
}

/* -------------------------------- Scripts ----------------------------- */

export function saveScript(
  data: Omit<SavedScript, "id" | "created_at" | "updated_at">
): SavedScript {
  const item: SavedScript = {
    ...data,
    id: uid(),
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  update((d) => ({ ...d, scripts: [item, ...d.scripts] }));
  return item;
}

export function deleteScript(id: string) {
  update((d) => ({ ...d, scripts: d.scripts.filter((s) => s.id !== id) }));
}

/* ----------------------------- Subscription --------------------------- */

export function setSubscription(sub: Subscription) {
  // TODO(stripe): in production the plan comes from the Stripe webhook
  // (src/app/api/stripe/webhook) writing to the subscriptions table —
  // this local setter powers the mock upgrade flow only.
  update((d) => ({ ...d, subscription: sub }));
}

export function clearDemoData() {
  update((d) => ({
    ...d,
    cases: d.cases.filter((c) => !c.is_demo),
    evidence: d.evidence.filter((e) => !e.is_demo),
    events: d.events.filter((e) => !e.is_demo),
    communications: d.communications.filter((c) => !c.is_demo),
    scripts: d.scripts.filter((s) => !s.is_demo),
  }));
}

export function exportAllData(): string {
  return JSON.stringify(cache, null, 2);
}
