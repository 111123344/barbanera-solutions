import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Barbanera Motors — Premium Hand-Picked Used Vehicles, Wheels & OEM Parts",
  description:
    "We source, inspect, and deliver high-quality used cars, premium wheel setups, and OEM parts across Montreal. Seamless Facebook Marketplace transactions, backed by elite mechanical verification.",
  keywords: [
    "used cars Montreal",
    "OEM parts Montreal",
    "premium wheels",
    "car flipping",
    "Facebook Marketplace cars",
    "Barbanera Motors",
  ],
  openGraph: {
    title: "Barbanera Motors — Zero Dealership Fluff. Built to Drive.",
    description:
      "Hand-picked used vehicles, premium wheels, and OEM parts. Mechanically verified. Montreal-wide delivery.",
    type: "website",
    locale: "en_CA",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
