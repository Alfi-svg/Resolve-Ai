import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Upay ResolveAI | Understand. Investigate. Resolve.",
  description:
    "AI intelligence layer for Upay: Autonomous transaction investigation, policy RAG, and proactive fraud risk guard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f8faf9] text-gray-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
