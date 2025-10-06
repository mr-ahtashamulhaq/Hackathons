import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ClimaPulse Lite - Lahore Climate Dashboard",
  description: "AI-powered climate trends dashboard for Lahore, Pakistan. Built for NASA Space Apps Challenge 2025 with real-time weather data and AI insights.",
  keywords: "climate, weather, Lahore, Pakistan, NASA, AI, dashboard, temperature, precipitation",
  authors: [{ name: "ClimaPulse Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#0ea5e9",
  openGraph: {
    title: "ClimaPulse Lite - Lahore Climate Dashboard",
    description: "Track Lahore's climate trends with AI-powered insights",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
