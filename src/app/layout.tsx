import type { Metadata } from "next";
import "./globals.css";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { cn } from "@/lib/utils";
import { HomologBanner } from "@/components/ui/homolog-banner";
import { SITE_URL } from "@/config/seo";

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sans' });
const dmSerifDisplay = DM_Serif_Display({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-display-source' });

// `metadataBase` resolves relative URLs in `openGraph.images` / `twitter.images`
// across every page. Per-route metadata lives in `src/config/seo.ts`; this
// root metadata only carries fallback values when a child page does not set
// its own.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Dr. Cleitinho",
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
