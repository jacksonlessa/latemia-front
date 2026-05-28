import { ClinicPhoto } from '@/components/public/atoms/clinic-photo';
import { clinicaContent } from '@/content/clinica';

export function ClinicaHero() {
  const { name, city } = clinicaContent;

  return (
    <section className="overflow-hidden bg-cream py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-12">
          <div className="flex max-w-[760px] flex-col items-start gap-5">
            <span className="text-[11px] font-semibold uppercase tracking-[1.4px] text-ink-muted">
              Sobre a clínica
            </span>

            <h1 className="font-display text-[clamp(32px,8vw,52px)] leading-[1.05] tracking-[-0.03em] text-ink">
              {name}
            </h1>

            <p className="text-[clamp(18px,4vw,24px)] font-semibold leading-[1.2] text-forest">
              {city}
            </p>

            <p className="max-w-[620px] text-base leading-[1.55] text-ink-soft">
              Conheça a estrutura e os tipos de atendimento da clínica parceira do
              Plano Pet Dr. Cleitinho em Camboriú/SC.
            </p>
          </div>

          <ClinicPhoto
            className="aspect-square w-full max-w-sm rounded-lg"
            sizes="(max-width: 1024px) 100vw, 384px"
          />
        </div>
      </div>
    </section>
  );
}
