import type { Metadata } from "next";
import "./globals.css";
import { Inter, Fraunces } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display', style: ['normal', 'italic'] });

export const metadata: Metadata = {
  title: "Late & Mia",
  description: "Plano de Emergência Veterinária — 50% de desconto em atendimentos emergenciais para o seu pet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={cn("font-sans", inter.variable, fraunces.variable)}>
      <body>{children}</body>
    </html>
  );
}
