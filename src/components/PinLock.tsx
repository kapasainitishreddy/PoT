"use client";

/**
 * Optional 4-digit app lock. The PIN never leaves the device — only a
 * SHA-256 hash of it is kept in localStorage. This is a privacy screen,
 * not account security (Clerk handles authentication).
 */

import { Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { sha256Text } from "@/lib/hash";

const PIN_HASH_KEY = "prooftimeline:pin-hash";
const LOCKED_KEY = "prooftimeline:locked";

export function pinIsSet(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem(PIN_HASH_KEY));
}

export function lockApp() {
  window.localStorage.setItem(LOCKED_KEY, "1");
  window.dispatchEvent(new Event("pt:lock-changed"));
}

export function clearPin() {
  window.localStorage.removeItem(PIN_HASH_KEY);
  window.localStorage.removeItem(LOCKED_KEY);
  window.dispatchEvent(new Event("pt:lock-changed"));
}

export async function setPin(pin: string) {
  window.localStorage.setItem(PIN_HASH_KEY, await sha256Text(pin));
  window.localStorage.removeItem(LOCKED_KEY);
  window.dispatchEvent(new Event("pt:lock-changed"));
}

export default function PinLock() {
  const [locked, setLocked] = useState(false);
  const [pin, setPinValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const check = () =>
      setLocked(pinIsSet() && window.localStorage.getItem(LOCKED_KEY) === "1");
    check();
    window.addEventListener("pt:lock-changed", check);
    return () => window.removeEventListener("pt:lock-changed", check);
  }, []);

  if (!locked) return null;

  const tryUnlock = async () => {
    const hash = await sha256Text(pin);
    if (hash === window.localStorage.getItem(PIN_HASH_KEY)) {
      window.localStorage.removeItem(LOCKED_KEY);
      setPinValue("");
      setError("");
      setLocked(false);
    } else {
      setError("Incorrect PIN. Try again.");
      setPinValue("");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/90 backdrop-blur-xl">
      <div className="card-gold w-full max-w-sm p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
          <Lock size={20} />
        </div>
        <h2 className="font-display text-xl font-semibold">Workspace locked</h2>
        <p className="mt-1 text-sm text-muted">
          Enter your 4-digit PIN to open your evidence workspace.
        </p>
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          autoFocus
          value={pin}
          onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && pin.length === 4) void tryUnlock();
          }}
          className="input mt-5 text-center text-2xl tracking-[0.6em]"
          aria-label="PIN"
        />
        {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
        <button
          className="btn-primary mt-4 w-full"
          disabled={pin.length !== 4}
          onClick={() => void tryUnlock()}
        >
          Unlock
        </button>
      </div>
    </div>
  );
}
