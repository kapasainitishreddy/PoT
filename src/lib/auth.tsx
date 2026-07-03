"use client";

/**
 * Auth abstraction.
 *
 * When Clerk keys are configured (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) the app
 * uses Clerk end to end: <ClerkProvider> in the root layout, clerkMiddleware
 * protecting /dashboard and friends, and Clerk's user id linked to all data.
 *
 * Without keys, the app runs in local demo mode: a mock user stored in
 * localStorage so every feature works offline with zero configuration.
 */

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export const clerkEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

export interface AppUser {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: AppUser | null;
  ready: boolean;
  signOutLocal: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  ready: false,
  signOutLocal: () => {},
});

const DEMO_KEY = "prooftimeline:demo-user";

export function readDemoUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEMO_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
}

export function createDemoUser(name: string, email: string): AppUser {
  const user: AppUser = {
    id: "local-user",
    name: name || "Local user",
    email: email || "local@device",
  };
  window.localStorage.setItem(DEMO_KEY, JSON.stringify(user));
  return user;
}

function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(readDemoUser());
    setReady(true);
  }, []);

  const signOutLocal = useCallback(() => {
    window.localStorage.removeItem(DEMO_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, signOutLocal }}>
      {children}
    </AuthContext.Provider>
  );
}

function ClerkAuthBridge({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const appUser: AppUser | null = user
    ? {
        id: user.id,
        name: user.fullName || user.username || "User",
        email: user.primaryEmailAddress?.emailAddress || "",
      }
    : null;
  return (
    <AuthContext.Provider
      value={{ user: appUser, ready: isLoaded, signOutLocal: () => {} }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (clerkEnabled) return <ClerkAuthBridge>{children}</ClerkAuthBridge>;
  return <DemoAuthProvider>{children}</DemoAuthProvider>;
}

export function useAppUser() {
  return useContext(AuthContext);
}

export function useRequireUser() {
  const { user, ready } = useAppUser();
  const router = useRouter();
  useEffect(() => {
    if (ready && !user) router.replace("/sign-in");
  }, [ready, user, router]);
  return { user, ready };
}
