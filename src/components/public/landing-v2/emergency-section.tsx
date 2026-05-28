import type { ReactNode } from 'react';
import Link from 'next/link';
import { AvailabilityBadge } from '@/components/public/atoms/availability-badge';

interface CovItem {
  title: string;
  description: string;
  icon: ReactNode;
}

const coveredItems: CovItem[] = [
  {
    title: 'Intoxicações',
    description: 'Envenenamento ou ingestão de substâncias tóxicas.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M10 2v6l-4 8a4 4 0 008 0l-4-8V2M8 2h4" />
      </svg>
    ),
  },
  {
    title: 'Convulsões',
    description: 'Crises súbitas que exigem atendimento imediato.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 12h3l2-7 4 14 2-7h7" />
      </svg>
    ),
  },
  {
    title: 'Falta de ar',
    description: 'Dificuldade respiratória aguda ou asfixia.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 12c0-3 2-5 4-5h4c2 0 4 2 4 5v3a3 3 0 01-3 3H9a3 3 0 01-3-3v-3z" />
      </svg>
    ),
  },
  {
    title: 'Hemorragias',
    description: 'Sangramentos externos e internos.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 2C8 8 6 11 6 14a6 6 0 0012 0c0-3-2-6-6-12z" />
      </svg>
    ),
  },
  {
    title: 'Choque',
    description: 'Hipovolêmico, séptico ou anafilático.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />
      </svg>
    ),
  },
  {
    title: 'Dor aguda',
    description: 'Dor intensa que afeta o bem-estar do pet.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
      </svg>
    ),
  },
  {
    title: 'Traumas graves',
    description: 'Atropelamentos, quedas e mordidas.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 2L4 14h7l-2 8 9-12h-7l1-8z" />
      </svg>
    ),
  },
  {
    title: 'Atendimento 24h',
    description: 'Prioridade na fila, dia ou madrugada.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
];

export function EmergencySection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="flex flex-col gap-2.5">
          <AvailabilityBadge variant="after-waiting" className="w-fit" />
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-[-0.03em] text-ink">
            E se uma emergência acontecer, o plano também{' '}
            <span className="text-forest">protege</span>.
          </h2>
          <p className="max-w-[720px] text-[15px] leading-[1.55] text-ink-soft">
            Depois da carência, o plano oferece 50% de desconto no atendimento
            emergencial realizado na clínica, ajudando a reduzir o impacto financeiro
            em um momento difícil.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {coveredItems.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-2.5 rounded-[18px] border border-sand-dark bg-forest-pale px-3.5 pb-4 pt-[18px] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-forest-soft hover:shadow-[0_8px_22px_rgba(0,0,0,0.05)]"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-forest-pale text-forest-deep">
                {item.icon}
              </div>
              <div className="text-[14.5px] font-bold leading-[1.25] tracking-[-0.1px] text-ink">
                {item.title}
              </div>
              <div className="text-[12.5px] leading-[1.4] text-ink-muted">{item.description}</div>
            </div>
          ))}
        </div>

        <div className="mt-[22px] flex items-start gap-3 rounded-[18px] border border-sand-dark bg-forest-pale p-4 text-[13px] leading-[1.55] text-ink-soft">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-forest)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-px flex-shrink-0"
            aria-hidden
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v.01M11 12h1v5h1" />
          </svg>
          <div>
            <strong className="text-ink">Em uma emergência, ligue para a clínica antes de sair de casa.</strong>{' '}
            Nossa equipe orienta você no caminho e prepara o atendimento.
          </div>
        </div>

        <p className="mt-5 max-w-[860px] text-[12px] leading-[1.5] text-ink-muted">
          A caracterização da emergência é feita pelo médico veterinário da clínica. O
          benefício vale para a fase aguda do atendimento, conforme os termos do plano.
        </p>

        <div className="mt-6">
          <Link
            href="/emergencia"
            className="inline-flex items-center justify-center rounded-full bg-forest px-6 py-3 text-[14px] font-semibold text-white transition-[filter] hover:brightness-110"
          >
            Entender proteção emergencial
          </Link>
        </div>
      </div>
    </section>
  );
}
