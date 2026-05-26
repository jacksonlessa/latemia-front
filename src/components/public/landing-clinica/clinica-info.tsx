import { clinicaContent } from '@/content/clinica';

function hasClinicaField(value: string): boolean {
  return value.length > 0 && value !== 'TODO';
}

export function ClinicaInfo() {
  const { services, address, institutionalUrl } = clinicaContent;
  const showAddress = hasClinicaField(address);
  const showInstitutionalUrl = hasClinicaField(institutionalUrl);

  return (
    <section className="bg-cream py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[1.4px] text-ink-muted">
            Estrutura e atendimentos
          </span>
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-[-0.03em] text-ink">
            Serviços disponíveis
          </h2>
          <p className="max-w-[680px] text-[15px] leading-[1.55] text-ink-soft">
            A clínica oferece atendimento veterinário completo para a rotina e para
            situações que exigem maior estrutura.
          </p>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {services.map((service) => (
            <li
              key={service}
              className="rounded-[18px] border border-sand-dark bg-white px-5 py-4 text-[15px] text-ink"
            >
              {service}
            </li>
          ))}
        </ul>

        {(showAddress || showInstitutionalUrl) && (
          <div className="mt-10 flex flex-col gap-4 rounded-[18px] border border-sand-dark bg-white p-6 sm:p-8">
            {showAddress ? (
              <div>
                <h3 className="text-[12px] font-semibold uppercase tracking-[1px] text-ink-muted">
                  Endereço
                </h3>
                <p className="mt-2 text-[15px] leading-[1.55] text-ink">{address}</p>
              </div>
            ) : null}

            {showInstitutionalUrl ? (
              <a
                href={institutionalUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Site da clínica (abre em nova aba)"
                className="inline-flex w-fit items-center justify-center rounded-full border border-forest/30 px-5 py-2.5 text-[14px] font-semibold text-forest transition-colors hover:bg-forest/5"
              >
                Visitar site da clínica
              </a>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
