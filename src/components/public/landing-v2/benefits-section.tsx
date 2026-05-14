import type { ReactNode } from 'react';
import Link from 'next/link';

interface BenefitItem {
  title: string;
  description: string;
  icon: ReactNode;
}

const items: BenefitItem[] = [
  {
    title: '50% em emergências*',
    description:
      'Metade do valor dos atendimentos urgentes fica por conta do plano. Você paga menos no pior momento.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
      </svg>
    ),
  },
  {
    title: 'Mensalidade fixa',
    description:
      'R$ 25/pet por mês. Sem categorias, sem franquias escondidas, sem surpresas no cartão.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
      </svg>
    ),
  },
  {
    title: 'Orientação por WhatsApp',
    description:
      'Canal exclusivo das 07h às 23h para tirar dúvidas antes de sair de casa em uma emergência.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.4 2.1L8.1 9.8a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.7.7a2 2 0 011.8 2z" />
      </svg>
    ),
  },
];

export function BenefitsSection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[1.4px] text-ink-muted">
            Por que contratar
          </span>
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-[-0.03em] text-ink">
            Um plano feito para quando <span className="text-forest">mais importa</span>.
          </h2>
          <p className="max-w-[560px] text-[15px] leading-[1.55] text-ink-soft">
            Sem categorias confusas, sem letras miúdas. Um valor fixo, um benefício claro.
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
              <div className="text-base font-bold tracking-[-0.2px] text-ink">{item.title}</div>
              <div className="text-sm leading-[1.5] text-ink-soft">{item.description}</div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[11px] leading-[1.45] text-ink-muted">
          *Após carência de 180 dias, em emergências atendidas na unidade Late &amp; Mia (Camboriú), na fase aguda do quadro. Consulte exclusões e condições nos{' '}
          <Link href="/termos" className="underline underline-offset-2 hover:text-ink">
            termos do plano
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
