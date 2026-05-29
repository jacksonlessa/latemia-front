import { clubeContent } from '@/content/clube-vantagens';

export function BenefitsClube() {
  return (
    <section className="bg-cream py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[1.4px] text-ink-muted">
            Descontos de rotina
          </span>
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-[-0.03em] text-ink">
            Tabela do Clube de Vantagens
          </h2>
          <p className="max-w-[680px] text-[15px] leading-[1.55] text-ink-soft">
            Use os descontos na Late&Mia Clínica Veterinária assim que o primeiro
            pagamento for confirmado.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-[18px] border border-sand-dark bg-white">
          <div className="grid grid-cols-[1fr_auto] gap-2 border-b border-sand-dark bg-cream px-4 py-3 text-[12px] font-semibold uppercase tracking-[1px] text-ink-muted">
            <span>Procedimento</span>
            <span>Desconto</span>
          </div>
          {clubeContent.benefits.map((item) => (
            <div
              key={item.procedure}
              className="grid grid-cols-[1fr_auto] gap-2 border-b border-sand-dark px-4 py-3 text-[14px] text-ink last:border-b-0"
            >
              <span>{item.procedure}</span>
              <strong className="text-forest">{item.discount}%</strong>
            </div>
          ))}
        </div>

        <p className="mt-6 max-w-[860px] text-[12px] leading-[1.5] text-ink-muted">
          {clubeContent.legalNote}
        </p>
      </div>
    </section>
  );
}
