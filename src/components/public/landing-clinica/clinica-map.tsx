import { clinicaContent } from '@/content/clinica';

function hasMapsUrl(value: string): boolean {
  return value.length > 0 && value !== 'TODO';
}

export function ClinicaMap() {
  const { mapsUrl } = clinicaContent;

  if (!hasMapsUrl(mapsUrl)) {
    return null;
  }

  return (
    <section className="bg-cream py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[1.4px] text-ink-muted">
            Localização
          </span>
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-[-0.03em] text-ink">
            Como chegar
          </h2>
        </div>

        <div className="mt-8 overflow-hidden rounded-[18px] border border-sand-dark bg-white">
          <iframe
            title="Mapa da Clínica Veterinária Dr. Cleitinho"
            src={mapsUrl}
            className="aspect-[16/10] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
