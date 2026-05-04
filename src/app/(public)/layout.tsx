import type { Metadata } from 'next';
import { AnalyticsSlot } from '@/components/public/slots/analytics-slot';
import { CookieBannerSlot } from '@/components/public/slots/cookie-banner-slot';
import { TouchpointProvider } from '@/domain/touchpoints/touchpoint-provider';

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
    <div className="bg-cream min-h-screen">
      <AnalyticsSlot />
      <TouchpointProvider>{children}</TouchpointProvider>
      <CookieBannerSlot />
    </div>
  );
}
