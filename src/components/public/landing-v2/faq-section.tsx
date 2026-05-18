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
    question: 'E se eu precisar de emergência durante a carência?',
    answer:
      'O desconto emergencial de 50% ainda não está disponível nos primeiros 6 meses. Mas os descontos do Clube de Vantagens — em consultas, vacinas e outros procedimentos na clínica — já valem desde o primeiro dia.',
  },
  {
    question: 'O que é considerado emergência veterinária?',
    answer:
      'Situações que colocam a vida do pet em risco imediato ou que precisam de atendimento urgente para evitar piora grave — como traumas, convulsões, intoxicações, hemorragias e dificuldade respiratória. Consultas de rotina e procedimentos agendados não estão incluídos.',
  },
  {
    question: 'O benefício funciona em qualquer clínica veterinária?',
    answer:
      'Não. O desconto de 50% é aplicado exclusivamente na Dr. Cleitinho. Ao chegar, basta informar que você é assinante — a equipe verifica o cadastro e aplica o desconto na hora.',
  },
  {
    question: 'O desconto de 50% cobre internação e cirurgia?',
    answer:
      'Cobre toda a fase aguda da emergência: consulta, medicações administradas durante o atendimento e cirurgia de emergência se necessária. Internação de continuidade e cirurgias eletivas não estão incluídas no desconto.',
  },
  {
    question: 'Como o pagamento é feito?',
    answer:
      'A cobrança é mensal e automática no seu cartão de crédito. O valor é reajustado uma vez por ano pelo IPCA (inflação oficial), sempre com aviso de 30 dias de antecedência.',
  },
  {
    question: 'Meus dados de cartão ficam salvos com vocês?',
    answer:
      'Não. Os dados do cartão são processados diretamente pelo Pagar.me, nosso provedor de pagamento, e nunca passam pelos nossos servidores. Guardamos apenas uma referência anônima gerada pelo Pagar.me para realizar as cobranças mensais.',
  },
  {
    question: 'Posso incluir mais de um pet?',
    answer:
      'Sim! O plano é por pet — você pode incluir todos os seus companheiros. O total mensal é {{pricePerPet}} multiplicado pelo número de pets cadastrados.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer:
      'Sim, sem multa e sem aviso prévio. O plano continua ativo até o fim do mês já pago. Se quiser retomar depois, é só contratar novamente. Fale com a gente pelo WhatsApp ou e-mail.',
  },
  {
    question: 'Posso me arrepender e pedir reembolso?',
    answer:
      'Sim. Você tem 7 dias a partir da contratação para cancelar e receber o valor integral de volta, desde que ainda não tenha utilizado nenhum benefício. Basta entrar em contato pelo WhatsApp ou e-mail.',
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
