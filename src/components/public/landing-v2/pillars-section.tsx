import type { ReactNode } from 'react';
import { AvailabilityBadge } from '@/components/public/atoms/availability-badge';

interface PillarItem {
  title: string;
  description: string;
  icon: ReactNode;
  badge: 'immediate' | 'after-waiting';
}

const items: PillarItem[] = [
  {
    title: 'Clube de Vantagens',
    description:
      'Descontos em consultas, exames e procedimentos de rotina na Late&Mia.',
    badge: 'immediate',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 2L9.1 8.6 2 9.3l5.4 4.7L5.8 21 12 17.3 18.2 21l-1.6-7 5.4-4.7-7.1-.7L12 2z" />
      </svg>
    ),
  },
  {
    title: 'Orientação por WhatsApp',
    description:
      'Dúvidas com a equipe em horário estendido, das 07h às 23h.',
    badge: 'immediate',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.4 2.1L8.1 9.8a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.7.7a2 2 0 011.8 2z" />
      </svg>
    ),
  },
  {
    title: 'Proteção Emergencial',
    description:
      'Após 180 dias, 50% de desconto em atendimentos emergenciais na clínica.',
    badge: 'after-waiting',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
      </svg>
    ),
  },
];

export function PillarsSection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[1.4px] text-ink-muted">
            Cuidado agora, proteção depois
          </span>
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-[-0.03em] text-ink">
            <span className="text-forest">Cuidado</span> que começa agora.{' '}
            <span className="text-forest">Proteção</span> para quando precisar.
          </h2>
          <p className="max-w-[640px] text-[15px] leading-[1.55] text-ink-soft">
            Desde o primeiro pagamento, seu pet já acessa benefícios de rotina e
            orientação pelo WhatsApp. Após a carência, conta também com desconto em
            emergências.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-3 rounded-[18px] border border-sand-dark bg-cream p-[22px]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-pale text-forest">
                {item.icon}
              </div>
              <AvailabilityBadge variant={item.badge} className="w-fit" />
              <div className="text-base font-bold tracking-[-0.2px] text-ink">
                {item.title}
              </div>
              <div className="text-sm leading-[1.5] text-ink-soft">{item.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
