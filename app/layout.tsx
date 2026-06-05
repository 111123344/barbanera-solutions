import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Barbanera Solutions — 5 Booked Appointments in 30 Days or You Don't Pay",
  description:
    "We engineer predictable revenue engines for high-ticket businesses in Montreal and across North America. AI Receptionists, Performance Lead Gen, Revenue Strategy.",
  keywords: [
    "lead generation Montreal",
    "AI receptionist",
    "revenue strategy",
    "appointment setting",
    "high-ticket sales",
    "Barbanera Solutions",
  ],
  openGraph: {
    title: "Barbanera Solutions — Revenue-Guaranteed Lead Generation",
    description:
      "5 booked appointments in 30 days or you don't pay. Bilingual EN/FR operations.",
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
