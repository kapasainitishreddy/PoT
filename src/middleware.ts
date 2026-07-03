import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/cases(.*)",
  "/evidence(.*)",
  "/timeline(.*)",
  "/packets(.*)",
  "/police-report(.*)",
  "/legal(.*)",
  "/scripts(.*)",
  "/communications(.*)",
  "/billing(.*)",
  "/settings(.*)",
]);

// With Clerk configured, protected routes require a session server-side.
// In local demo mode (no keys) the client-side guard in the app shell
// redirects unauthenticated visitors to /sign-in.
export default clerkEnabled
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) await auth.protect();
    })
  : function middleware() {
      return NextResponse.next();
    };

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
