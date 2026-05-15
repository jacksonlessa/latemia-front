'use client';

import { useState } from 'react';

interface FaqEntry {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  /**
   * Per-pet monthly price in cents — when provided, replaces the
   * `{{pricePerPet}}` placeholder inside any FAQ answer string with the
   * formatted BRL value (e.g. "R$ 25,00"). Omitting it keeps the
   * placeholder visible, which would be a developer-visible bug — so the
   * parent page must always pass it.
   */
  pricePerPetCents?: number;
}

const priceFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function applyPlaceholders(text: string, pricePerPetCents?: number): string {
  if (pricePerPetCents === undefined) return text;
  return text.replaceAll(
    '{{pricePerPet}}',
    priceFormatter.format(pricePerPetCents / 100),
  );
}

const items: FaqEntry[] = [
  {
    question: 'Como funciona a carência de 6 meses?',
    answer:
      'Após o primeiro pagamento confirmado, o plano fica em carência por 6 meses. O contrato está ativo, mas o desconto emergencial ainda não pode ser utilizado. A partir do 7.º mês, o benefício está disponível integralmente.',
  },
  {
    question: 'O que é considerado emergência veterinária?',
    answer:
      'Qualquer situação que coloca a vida do animal em risco imediato ou causa sofrimento intenso e agudo — traumas, convulsões, intoxicações, hemorragias e dificuldade respiratória. Consultas de rotina ou procedimentos eletivos não se enquadram.',
  },
  {
    question: 'Como o pagamento é feito?',
    answer:
      'O plano é cobrado mensalmente via débito recorrente. O valor é fixo por pet e não sofre reajustes surpresa ao longo do período anual.',
  },
  {
    question: 'Como utilizo o benefício quando precisar?',
    answer:
      'Leve seu pet diretamente ao Dr. Cleitinho informando que é assinante do plano. A equipe verifica o cadastro e aplica o desconto de 50% automaticamente. Sem reembolso posterior.',
  },
  {
    question: 'Posso incluir mais de um pet?',
    answer:
      'Sim! O plano é por pet — você pode incluir todos os seus companheiros. O total mensal é {{pricePerPet}} multiplicado pelo número de pets cadastrados.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer:
      'Sim. O cancelamento pode ser solicitado a qualquer momento sem multa. O plano permanece ativo até o fim do período já pago. Entre em contato pelo WhatsApp.',
  },
];

export function FaqSection({ pricePerPetCents }: FaqSectionProps = {}) {
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
                    <p className="text-sm leading-[1.65] text-ink-soft">
                      {applyPlaceholders(item.answer, pricePerPetCents)}
                    </p>
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
