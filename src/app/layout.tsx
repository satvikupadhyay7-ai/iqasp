
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IQ Aspirants | Prepare Smarter",
  description: "Your space for focused preparation, mentors and learning.",
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
