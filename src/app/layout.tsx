import { Toaster } from "@/components/ui/sonner";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, VT323 } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-primary",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-secondary",
  subsets: ["latin"],
});

const cyberpunk = VT323({
  variable: "--font-cyberpunk",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: {
    default: "justc0de_sessions | Editor",
    template: "%s | justc0de_sessions",
  },
  description: "Create, edit, and manage your blog content.",
  applicationName: "Blog Editor",
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Blog Editor",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: [
    {
      media: "(prefers-color-scheme: dark)",
      color: "#09090b",
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cyberpunk.variable} font-primary antialiased`}
    >
      <body className="h-screen min-h-full w-full">
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
