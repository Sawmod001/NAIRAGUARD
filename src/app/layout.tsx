import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NairaGuard — Naira-aware AWS FinOps",
  description:
    "See where your AWS spend goes. Find the waste. Understand what it means in naira. Naira-aware FinOps for teams that budget in NGN and pay in USD.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,600,700&f[]=satoshi@400,500,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
