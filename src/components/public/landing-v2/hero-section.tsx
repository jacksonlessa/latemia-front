import Link from 'next/link';
import { publicSite } from '@/config/public-site';

const whatsappHref = `https://wa.me/${publicSite.whatsapp.number}`;

export function HeroSection() {
  return (
    <section className="overflow-hidden bg-cream p-0">
      <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-0 sm:min-h-[560px] sm:grid-cols-2 sm:items-center">
        <div className="flex flex-col items-start gap-5 px-6 pt-[52px] pb-10 sm:px-10 sm:py-[60px]">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-forest-soft bg-forest-pale px-3.5 py-1.5 text-[12.5px] font-semibold text-forest-deep">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
            </svg>
            50% de desconto* em emergências
          </div>

          <h1 className="font-display text-[clamp(36px,10vw,58px)] leading-[1.05] tracking-[-0.03em] text-ink">
            Emergência veterinária sem <span className="text-forest">susto no bolso</span>.
          </h1>

          <p className="max-w-[480px] text-base leading-[1.55] text-ink-soft">
            O Plano Emergência Late & Mia garante metade do valor dos atendimentos urgentes para o seu pet — de forma simples, com mensalidade fixa.
          </p>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:w-auto">
            <Link
              href={publicSite.checkoutPath}
              className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border-none bg-forest px-6 py-[15px] text-[15px] font-semibold text-white shadow-[0_2px_0_var(--color-forest-deep),0_8px_24px_rgba(93,122,94,0.28)] transition-[filter,transform] hover:brightness-110 active:scale-[0.97] sm:w-auto"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
              Contratar agora — R$ 25/mês
            </Link>
            <a
              href={whatsappHref}
              className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-sand-dark bg-transparent px-6 py-[15px] text-[15px] font-semibold text-ink shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:bg-white active:scale-[0.97] sm:w-auto"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
              Tirar dúvidas
            </a>
          </div>

          <div className="flex w-full items-center gap-2.5 rounded-xl border border-sand-dark bg-white px-4 py-3">
            <div className="flex">
              {['🐕', '🐈', '🐶'].map((emoji, idx) => (
                <div
                  key={idx}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-forest-soft text-xs first:ml-0 -ml-1.5"
                >
                  {emoji}
                </div>
              ))}
            </div>
            <div className="text-[12.5px] leading-[1.35] text-ink-soft">
              <strong className="text-ink">Tutores que já confiam no plano.</strong>
              <br />
              Atendimento 24h na Late & Mia, Camboriú.
            </div>
          </div>

          <p className="text-[11px] leading-[1.45] text-ink-muted">
            *Após carência de 180 dias, em emergências atendidas na unidade Late &amp; Mia (Camboriú), na fase aguda do quadro. Consulte exclusões e condições nos{' '}
            <Link href="/termos" className="underline underline-offset-2 hover:text-ink">
              termos do plano
            </Link>
            .
          </p>
        </div>

        <div className="relative mx-5 mb-6 h-[280px] sm:mx-0 sm:mr-5 sm:my-5 sm:h-auto sm:min-h-[420px] lg:min-h-[480px]">
          <div className="h-full w-full overflow-hidden rounded-[28px] bg-forest-pale">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.pexels.com/photos/5426879/pexels-photo-5426879.jpeg?auto=compress&cs=tinysrgb&w=800&fit=crop&h=900"
              alt="Tutora com seu cachorro no sofá"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-2.5 rounded-xl border border-white/60 bg-white/90 px-3.5 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-pale">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5D7A5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[1px] text-ink-muted">
                Desconto garantido*
              </div>
              <div className="mt-0.5 font-display text-[22px] leading-none text-ink">50% off</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
