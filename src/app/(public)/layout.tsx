import type { Metadata } from 'next';
import { AnalyticsSlot } from '@/components/public/slots/analytics-slot';
import { ConsentProvider } from '@/components/public/consent/consent-provider';
import { ConsentModeInit } from '@/components/public/consent/consent-mode-init';
import { CookieBanner } from '@/components/public/consent/cookie-banner';
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
    <ConsentProvider>
      <TouchpointProvider>
        <ConsentModeInit />
        <div className="bg-cream min-h-screen">
          <AnalyticsSlot />
          {children}
        </div>
        <CookieBanner />
      </TouchpointProvider>
    </ConsentProvider>
  );
}
