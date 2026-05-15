import Link from 'next/link';
import { publicSite } from '@/config/public-site';

const whatsappHref = `https://wa.me/${publicSite.whatsapp.number}`;

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
        <div className="flex flex-col items-center gap-7 text-center lg:flex-row lg:items-center lg:gap-15 lg:text-left">
          <div className="h-[220px] w-full max-w-[320px] flex-shrink-0 overflow-hidden rounded-[28px] bg-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=700&fit=crop&h=500"
              alt="Cachorro filhote feliz olhando para a câmera"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div className="flex flex-col items-center gap-5 lg:items-start">
            <div className="text-[12px] font-semibold uppercase tracking-[1.4px] text-white/60">
              Preço justo, sem surpresas
            </div>
            <div
              className="flex items-baseline gap-1.5 font-display text-[72px] leading-none tracking-[-2px] text-white"
              aria-label={`${display} por pet por mês`}
            >
              <span>{display}</span>
              <span className="ml-1 font-sans text-base font-medium tracking-normal text-white/70">
                /pet · mês
              </span>
            </div>
            <p className="max-w-[280px] text-sm leading-[1.5] text-white/60 lg:max-w-none">
              O total é calculado pelo número de pets cadastrados. Cancele a qualquer momento, sem multa.
            </p>
            <div className="flex w-full max-w-[360px] flex-col gap-3 sm:flex-row sm:max-w-none lg:justify-start">
              <Link
                href={publicSite.checkoutPath}
                className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-6 py-[15px] text-[15px] font-semibold text-forest-deep transition-[filter] hover:brightness-110 active:scale-[0.97] sm:w-auto"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
                Contratar agora
              </Link>
              <a
                href={whatsappHref}
                className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#25D366] px-6 py-[15px] text-[15px] font-semibold text-white shadow-[0_2px_0_#1aaa50,0_8px_24px_rgba(37,211,102,0.25)] transition-[filter] hover:brightness-110 active:scale-[0.97] sm:w-auto"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                </svg>
                Falar pelo WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
