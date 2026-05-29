import Link from 'next/link';
import { publicSite } from '@/config/public-site';
import { clubeContent } from '@/content/clube-vantagens';

const priceFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const whatsappHref = `https://wa.me/${publicSite.whatsapp.number}?text=${encodeURIComponent(
  publicSite.whatsapp.messages.clube,
)}`;

export interface CtaClubeProps {
  /** Per-pet monthly price in cents — injected by the page (SSR fetch). */
  pricePerPetCents: number;
}

export function CtaClube({ pricePerPetCents }: CtaClubeProps) {
  const displayPrice = priceFormatter.format(Math.round(pricePerPetCents / 100));

  return (
    <section className="bg-cream py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="rounded-[24px] bg-forest-deep p-8 text-white sm:p-10">
          <h2 className="font-display text-[clamp(30px,7vw,46px)] leading-[1.05] tracking-[-0.03em]">
            Contrate o plano e use o Clube desde o primeiro pagamento.
          </h2>
          <p className="mt-4 max-w-[840px] text-[15px] leading-[1.6] text-white/80">
            Por {displayPrice} por mês por pet, você ativa o Clube de Vantagens e
            mantém descontos de rotina na clínica.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={publicSite.checkoutPath}
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-forest-deep transition-[filter] hover:brightness-110"
            >
              Contratar por {displayPrice}/mês por pet
            </Link>
            <a
              href={whatsappHref}
              className="inline-flex items-center justify-center rounded-full border border-white/50 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
            >
              Falar pelo WhatsApp
            </a>
            <Link
              href={clubeContent.officialBenefitsLink}
              className="inline-flex items-center justify-center rounded-full border border-white/35 px-6 py-3 text-[15px] font-semibold text-white/95 transition-colors hover:bg-white/10 sm:ml-0"
            >
              Tabela oficial de benefícios
            </Link>
          </div>
          <p className="mt-5 text-[11px] leading-[1.5] text-white/65">
            {clubeContent.legalNote}
          </p>
        </div>
      </div>
    </section>
  );
}
