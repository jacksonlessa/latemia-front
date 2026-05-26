import Link from 'next/link';
import { publicSite } from '@/config/public-site';

const whatsappHref = `https://wa.me/${publicSite.whatsapp.number}?text=${encodeURIComponent(
  publicSite.whatsapp.messages.homeFinal,
)}`;

export function FinalCtaSection() {
  return (
    <section className="bg-cream py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="rounded-[24px] bg-forest-deep p-8 text-white sm:p-10">
          <h2 className="font-display text-[clamp(30px,7vw,46px)] leading-[1.05] tracking-[-0.03em]">
            Comece agora e tenha benefícios desde o primeiro pagamento.
          </h2>
          <p className="mt-4 max-w-[840px] text-[15px] leading-[1.6] text-white/80">
            Contrate o Plano Pet Dr. Cleitinho e cuide do seu pet com descontos na
            rotina, orientação quando surgir dúvida e proteção emergencial após a
            carência.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={publicSite.checkoutPath}
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-forest-deep transition-[filter] hover:brightness-110"
            >
              Contratar por R$ 25/mês por pet
            </Link>
            <a
              href={whatsappHref}
              className="inline-flex items-center justify-center rounded-full border border-white/50 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
            >
              Falar pelo WhatsApp
            </a>
          </div>
          <p className="mt-5 text-[11px] leading-[1.5] text-white/65">
            Plano sujeito aos termos de uso. Benefício emergencial com carência de 180
            dias. Clube de Vantagens e orientação por WhatsApp disponíveis após
            confirmação do primeiro pagamento, conforme condições vigentes. Não
            constitui seguro, plano de saúde pet ou reembolso.
          </p>
        </div>
      </div>
    </section>
  );
}
