import type { Metadata } from "next";
import { Inter, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta" });

export const metadata: Metadata = {
  title: "QuickGig - Local Hyper-Gigs & Micro-Tasks",
  description: "Find and post hyper-local gigs and micro-tasks in your neighborhood within minutes.",
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${outfit.variable} ${plusJakarta.variable} min-h-screen bg-[#f8fafc] text-[#0f172a] antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
