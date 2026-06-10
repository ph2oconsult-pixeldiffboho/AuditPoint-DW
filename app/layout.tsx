import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AuditPoint DW",
  description: "Independent drinking water process audit engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
