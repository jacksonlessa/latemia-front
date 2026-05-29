import { publicSite } from '@/config/public-site';

const whatsappHref = `https://wa.me/${publicSite.whatsapp.number}?text=${encodeURIComponent(
  publicSite.whatsapp.messages.clinica,
)}`;

export function ClinicaCta() {
  return (
    <section className="bg-cream py-16 pb-20">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="rounded-[22px] border border-sand-dark bg-white p-8 sm:p-10">
          <h2 className="font-display text-[clamp(26px,6vw,38px)] leading-[1.05] tracking-[-0.03em] text-ink">
            Entre em contato
          </h2>
          <p className="mt-4 max-w-[640px] text-[15px] leading-[1.6] text-ink-soft">
            Tem dúvidas sobre a clínica, os atendimentos ou o plano? Fale com a equipe
            pelo WhatsApp — respondemos de forma clara, sem pressão de venda.
          </p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp da clínica (abre em nova aba)"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-forest px-6 py-3 text-[15px] font-semibold text-white transition-[filter] hover:brightness-110"
          >
            Falar pelo WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
