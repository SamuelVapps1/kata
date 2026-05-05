import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PM Kata - AI PM Candidate Evaluation",
  description: "60-minute sandbox for evaluating AI-native senior PM candidates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
