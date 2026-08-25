import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
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
  title: "Blog Editor",
  description: "Blog Editor",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cyberpunk.variable} antialiased font-primary`}
    >
      <body className="min-h-full h-screen w-full ">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
