'use client';

import { useState, type ReactNode } from 'react';

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

const notCoveredItems: CovItem[] = [
  {
    title: 'Vacinas',
    description: 'Vacinação anual e vermifugação de rotina.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    title: 'Check-ups',
    description: 'Consultas de rotina sem urgência.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="3" />
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      </svg>
    ),
  },
  {
    title: 'Estética',
    description: 'Banho, tosa e procedimentos cosméticos.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
      </svg>
    ),
  },
  {
    title: 'Castração',
    description: 'Procedimentos eletivos programados.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9l6 6M15 9l-6 6" />
      </svg>
    ),
  },
  {
    title: 'Exames preventivos',
    description: 'Sem indicação de emergência.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M9 9h6M9 13h6M9 17h4" />
      </svg>
    ),
  },
  {
    title: 'Internações eletivas',
    description: 'Programadas ou de longo prazo.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M8 7V5a4 4 0 018 0v2" />
      </svg>
    ),
  },
];

type Tab = 'yes' | 'no';

export function CoverageSection() {
  const [tab, setTab] = useState<Tab>('yes');
  const isYes = tab === 'yes';

  return (
    <section className="bg-cream py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[1.4px] text-ink-muted">
            Coberturas
          </span>
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-[-0.03em] text-ink">
            O que o plano <span className="text-forest">cobre</span>.
          </h2>
          <p className="max-w-[560px] text-[15px] leading-[1.55] text-ink-soft">
            Situações que colocam a vida do seu pet em risco imediato — é para isso que existimos.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Coberturas do plano"
          className="mt-8 mb-6 inline-flex gap-0.5 rounded-full border border-sand-dark bg-white p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={isYes}
            onClick={() => setTab('yes')}
            className={`inline-flex cursor-pointer items-center gap-[7px] rounded-full border-none px-[18px] py-2.5 text-[13.5px] font-semibold leading-none transition-all duration-200 ${
              isYes
                ? 'bg-forest text-white shadow-[0_2px_8px_rgba(93,122,94,0.25)]'
                : 'bg-transparent text-ink-soft'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="block shrink-0" aria-hidden>
              <path d="M4 12l5 5L20 6" />
            </svg>
            Coberto
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isYes}
            onClick={() => setTab('no')}
            className={`inline-flex cursor-pointer items-center gap-[7px] rounded-full border-none px-[18px] py-2.5 text-[13.5px] font-semibold leading-none transition-all duration-200 ${
              !isYes
                ? 'bg-[#6E6E68] text-white shadow-[0_2px_8px_rgba(110,110,104,0.25)]'
                : 'bg-transparent text-ink-soft'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="block shrink-0" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
            Não coberto
          </button>
        </div>

        <div role="tabpanel">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {(isYes ? coveredItems : notCoveredItems).map((item) => (
              <div
                key={item.title}
                className={`group relative flex flex-col gap-2.5 rounded-[18px] border border-sand-dark bg-white px-3.5 pt-[18px] pb-4 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(0,0,0,0.05)] ${
                  isYes ? 'hover:border-forest-soft' : 'hover:border-[#C8C6BD]'
                }`}
              >
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                    isYes ? 'bg-forest-pale text-forest-deep' : 'bg-[#ECEAE2] text-[#6E6E68]'
                  }`}
                >
                  {item.icon}
                </div>
                <div className="text-[14.5px] font-bold leading-[1.25] tracking-[-0.1px] text-ink">
                  {item.title}
                </div>
                <div className="text-[12.5px] leading-[1.4] text-ink-muted">{item.description}</div>
              </div>
            ))}
          </div>
          <div className="mt-[22px] flex items-start gap-3 rounded-[18px] border border-sand-dark bg-white p-4 text-[13px] leading-[1.55] text-ink-soft">
            {isYes ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-forest)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-px flex-shrink-0" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v.01M11 12h1v5h1" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6E6E68" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-px flex-shrink-0" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v.01M11 12h1v5h1" />
              </svg>
            )}
            <div>
              {isYes ? (
                <>
                  <strong className="text-ink">Em uma emergência, ligue para a clínica antes de sair de casa.</strong>{' '}
                  Nossa equipe orienta você no caminho e prepara o atendimento.
                </>
              ) : (
                <>
                  <strong className="text-ink">Para procedimentos não cobertos, oferecemos 15% de desconto</strong>{' '}
                  em consultas eletivas, exames de imagem e laboratoriais — exclusivo para membros.
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
