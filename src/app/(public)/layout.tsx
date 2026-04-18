import type { Metadata } from 'next';
import { AnalyticsSlot } from '@/components/public/slots/analytics-slot';
import { CookieBannerSlot } from '@/components/public/slots/cookie-banner-slot';

export const metadata: Metadata = {
  title: 'Plano de Emergência Veterinária — Late & Mia',
  description:
    'Garanta 50% de desconto nos atendimentos de emergência para o seu pet. Plano simples, transparente e sem surpresas.',
  applicationName: 'Late & Mia',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-cream font-display min-h-screen">
      <AnalyticsSlot />
      {children}
      <CookieBannerSlot />
    </div>
  );
}
