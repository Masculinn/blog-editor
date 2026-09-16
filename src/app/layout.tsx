import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-primary",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-secondary",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Editor",
    template: "%s",
  },
  description: "Create, edit, and manage your blog content.",
  applicationName: "Blog Editor",
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Blog Editor",
    statusBarStyle: "black",
    startupImage: "/assets/logo.png",
  },
  creator: "Burak Bilen",
};

export const viewport: Viewport = {
  themeColor: [
    {
      media: "(prefers-color-scheme: dark)",
      color: "#000000",
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="h-screen min-h-full w-full font-primary">
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
