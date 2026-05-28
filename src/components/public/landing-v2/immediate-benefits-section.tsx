import type { ReactNode } from 'react';
import Link from 'next/link';

interface BenefitItem {
  label: string;
  description: string;
  discount: string;
  icon: ReactNode;
}

const benefits: BenefitItem[] = [
  {
    label: 'Microchipagem',
    description: 'Identificação permanente e rastreável.',
    discount: '30%',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="7" y="7" width="10" height="10" rx="1" />
        <path d="M7 4v1M12 4v1M17 4v1M7 19v1M12 19v1M17 19v1M4 7h1M4 12h1M4 17h1M19 7h1M19 12h1M19 17h1" />
      </svg>
    ),
  },
  {
    label: 'Consultas eletivas e de especialidades',
    description: 'Retornos, especialistas e avaliações preventivas.',
    discount: '30%',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
        <path d="M14 2v6h6M9 13h6M9 17h4" />
        <path d="M12 10v6" />
      </svg>
    ),
  },
  {
    label: 'Exames de sangue laboratoriais',
    description: 'Hemograma, bioquímica e perfis laboratoriais.',
    discount: '10%',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M10 2v6l-4 8a4 4 0 008 0l-4-8V2M8 2h4" />
      </svg>
    ),
  },
  {
    label: 'Exames de imagem',
    description: 'Raio-X, Ultrassom e similares.',
    discount: '5%',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M9 4v5M3 14h3l2-3 2 5 2-3 2 4 2-3h3" />
      </svg>
    ),
  },
  {
    label: 'Cirurgias eletivas',
    description: 'Procedimentos programados não emergenciais.',
    discount: '10%',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20 7l-8-5-8 5v10l8 5 8-5V7z" />
        <path d="M12 2v20M2 7l10 6 10-6" />
      </svg>
    ),
  },
];

export function ImmediateBenefitsSection() {
  return (
    <section className="bg-cream py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[1.4px] text-ink-muted">
            Começa desde o primeiro pagamento
          </span>
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-[-0.03em] text-ink">
            O <span className="text-forest">Clube de Vantagens</span> ajuda no cuidado do{' '}
            <span className="text-forest">dia a dia</span>.
          </h2>
          <p className="max-w-[680px] text-[15px] leading-[1.55] text-ink-soft">
            Enquanto a carência do benefício emergencial conta, você já pode usar os
            descontos de rotina na Late&Mia Clínica Veterinária.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-3 rounded-[18px] border border-sand-dark bg-white p-[22px] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-forest-soft hover:shadow-[0_8px_22px_rgba(0,0,0,0.05)]"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-forest-pale text-forest">
                {item.icon}
              </div>
              <div className="text-base font-bold leading-[1.25] tracking-[-0.2px] text-ink">
                {item.label}
              </div>
              <div className="text-sm leading-[1.5] text-ink-soft">{item.description}</div>
              <div className="mt-auto pt-1 text-[13px] font-semibold text-forest">
                Benefício: {item.discount} de desconto
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[760px] text-[12px] leading-[1.5] text-ink-muted">
            Descontos não cumulativos, válidos apenas para serviços prestados
            diretamente pela clínica. Não abrangem serviços terceirizados.
          </p>
          <Link
            href="/beneficios"
            className="inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-sand-dark bg-white px-5 py-3 text-[14px] font-semibold text-ink transition-colors hover:bg-cream"
          >
            Ver tabela oficial de benefícios
          </Link>
        </div>
      </div>
    </section>
  );
}
