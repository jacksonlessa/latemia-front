import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LateMia — Dev",
  description: "LateMia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
