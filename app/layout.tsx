import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Field Guide Studio | Small Kitchen",
  description: "Manage your small-kitchen editorial website.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
