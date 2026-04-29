import type { Metadata } from "next";
import "./globals.css";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { cn } from "@/lib/utils";
import { HomologBanner } from "@/components/ui/homolog-banner";

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sans' });
const dmSerifDisplay = DM_Serif_Display({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-display-source' });

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
    <html lang="pt-BR" className={cn("font-sans", dmSans.variable, dmSerifDisplay.variable)}>
      <body suppressHydrationWarning>
        <HomologBanner env={process.env.NEXT_PUBLIC_APP_ENV} />
        {children}
      </body>
    </html>
  );
}
