import Link from 'next/link';
import { publicSite } from '@/config/public-site';

const whatsappHref = `https://wa.me/${publicSite.whatsapp.number}?text=${encodeURIComponent(
  publicSite.whatsapp.messages.emergencia,
)}`;

export function CtaEmergencia() {
  return (
    <section className="bg-cream py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="rounded-[24px] bg-forest-deep p-8 text-white sm:p-10">
          <h2 className="font-display text-[clamp(30px,7vw,46px)] leading-[1.05] tracking-[-0.03em]">
            Contrate o plano e saiba quando a proteção emergencial estiver disponível.
          </h2>
          <p className="mt-4 max-w-[840px] text-[15px] leading-[1.6] text-white/80">
            Após a confirmação do primeiro pagamento, a carência de 180 dias começa a
            contar. Quando ela terminar, você poderá usar o desconto de 50% em
            atendimentos emergenciais na Clínica Veterinária Late&Mia, em Camboriú/SC.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={publicSite.checkoutPath}
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-forest-deep transition-[filter] hover:brightness-110"
            >
              Contratar agora
            </Link>
            <a
              href={whatsappHref}
              className="inline-flex items-center justify-center rounded-full border border-white/50 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
            >
              Falar pelo WhatsApp
            </a>
          </div>
          <p className="mt-5 text-[12px] leading-[1.5] text-white/70">
            Benefício emergencial com carência de 180 dias. Válido somente na Clínica Dr.
            Cleitinho. Não é seguro nem plano de saúde pet.
          </p>
        </div>
      </div>
    </section>
  );
}
