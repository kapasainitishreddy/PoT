import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { APP_NAME, TAGLINE } from "@/lib/constants";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: `${APP_NAME} — ${TAGLINE}`,
  description:
    "Collect real screenshots, photos, receipts, messages, and notes into clean, export-ready evidence packets. Not legal advice.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0b1220",
};

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const body = (
    <html lang="en" className={`${inter.variable} ${grotesk.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );

  if (clerkEnabled) {
    return (
      <ClerkProvider
        appearance={{
          variables: {
            colorPrimary: "#e9c176",
            colorBackground: "#0e1729",
            colorText: "#f4f1ea",
          },
        }}
      >
        {body}
      </ClerkProvider>
    );
  }
  return body;
}
