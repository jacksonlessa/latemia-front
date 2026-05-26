'use client';

import { useState } from 'react';

interface FaqEntry {
  question: string;
  answer: string;
}

const items: FaqEntry[] = [
  {
    question: 'O plano é só para emergência?',
    answer:
      'Não. O plano tem três pilares: Clube de Vantagens desde o primeiro pagamento, orientação por WhatsApp e 50% de desconto em atendimentos emergenciais após a carência.',
  },
  {
    question: 'Posso usar algum benefício antes dos 6 meses?',
    answer:
      'Sim. O Clube de Vantagens e a orientação por WhatsApp ficam disponíveis após a confirmação do primeiro pagamento. A carência de 180 dias vale apenas para o desconto emergencial.',
  },
  {
    question: 'O plano vale em qualquer clínica?',
    answer:
      'Não. Os benefícios são válidos para serviços prestados na Late&Mia Clínica Veterinária, em Camboriú.',
  },
  {
    question: 'É plano de saúde pet ou seguro?',
    answer:
      'Não. É um programa de benefícios da própria clínica, com descontos e condições definidos nos termos de uso.',
  },
  {
    question: 'Quanto custa?',
    answer: 'R$ 25 por mês por pet cadastrado.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[1.4px] text-ink-muted">
            Perguntas frequentes
          </span>
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-[-0.03em] text-ink">
            Tem <span className="text-forest">dúvidas</span>? A gente responde.
          </h2>
        </div>
        <div className="mt-10 flex flex-col gap-2">
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-[18px] border border-sand-dark bg-cream"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-3.5 border-none bg-transparent px-5 py-[18px] text-left text-[15px] font-semibold text-ink"
                >
                  {item.question}
                  <span
                    className={`flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,border-color] duration-300 ${
                      isOpen
                        ? 'border-forest bg-forest rotate-180'
                        : 'border-sand-dark bg-white'
                    }`}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isOpen ? '#FFFFFF' : '#5D7A5E'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </button>
                <div
                  className={`grid overflow-hidden px-5 transition-[grid-template-rows,padding] duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr] pb-[18px]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="text-sm leading-[1.65] text-ink-soft">{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
