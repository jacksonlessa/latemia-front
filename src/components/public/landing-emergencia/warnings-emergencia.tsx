import { AlertTriangle } from 'lucide-react';
import { emergenciaContent } from '@/content/emergencia';

export function WarningsEmergencia() {
  return (
    <section className="bg-white py-16" aria-labelledby="warnings-emergencia-heading">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[1.4px] text-ink-muted">
            Informações importantes
          </span>
          <h2
            id="warnings-emergencia-heading"
            className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-[-0.03em] text-ink"
          >
            O que você precisa saber
          </h2>
        </div>

        <ul className="mt-8 flex flex-col gap-4">
          {emergenciaContent.warnings.map((warning) => (
            <li
              key={warning}
              className="flex gap-4 rounded-[18px] border border-amber-200 bg-amber-50 p-5 sm:p-6"
            >
              <AlertTriangle
                className="mt-0.5 size-5 shrink-0 text-amber-700"
                aria-hidden
              />
              <p className="text-[15px] leading-[1.55] text-amber-950">{warning}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
