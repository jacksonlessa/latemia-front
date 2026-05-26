import Link from 'next/link';
import { publicSite } from '@/config/public-site';

interface PriceSectionProps {
  /** Per-pet monthly price in cents — injected by the page (SSR fetch). */
  pricePerPetCents: number;
}

const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function PriceSection({ pricePerPetCents }: PriceSectionProps) {
  // `25` na cópia original; agora deriva do back. Sempre cents → real,
  // sem decimais para preservar o layout do bloco hero da landing.
  const display = formatter.format(Math.round(pricePerPetCents / 100));

  return (
    <section id="contratar" className="bg-forest-deep py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="mx-auto max-w-[760px] text-center">
          <h2 className="font-display text-[clamp(36px,8vw,64px)] leading-[1.05] tracking-[-0.03em] text-white">
            {display} por mês por pet.
          </h2>
          <p className="mt-4 text-[15px] leading-[1.6] text-white/75">
            Um valor simples para manter benefícios ativos na clínica e preparar seu
            pet para imprevistos futuros.
          </p>
          <ul className="mt-6 space-y-2 text-left text-[14px] text-white/85 sm:mx-auto sm:max-w-[580px]">
            <li>• Cobrança mensal recorrente no cartão</li>
            <li>• Uma fatura para múltiplos pets</li>
            <li>• Cancelamento a qualquer momento, sem multa</li>
            <li>• Carência individual por pet para o benefício emergencial</li>
          </ul>
          <div className="mt-7">
            <Link
              href={publicSite.checkoutPath}
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-forest-deep transition-[filter] hover:brightness-110"
            >
              Contratar plano agora
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
