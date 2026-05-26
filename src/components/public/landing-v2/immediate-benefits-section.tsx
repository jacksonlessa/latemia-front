import Link from 'next/link';

const benefits = [
  { label: 'Microchipagem', discount: '30%' },
  { label: 'Consultas eletivas e de especialidades', discount: '30%' },
  { label: 'Exames de sangue laboratoriais', discount: '10%' },
  { label: 'Exames de imagem, como Raio-X e Ultrassom', discount: '5%' },
  { label: 'Cirurgias eletivas', discount: '10%' },
];

export function ImmediateBenefitsSection() {
  return (
    <section className="bg-cream py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[1.4px] text-ink-muted">
            Começa desde o primeiro pagamento
          </span>
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-[-0.03em] text-ink">
            O Clube de Vantagens ajuda no cuidado do dia a dia.
          </h2>
          <p className="max-w-[680px] text-[15px] leading-[1.55] text-ink-soft">
            Enquanto a carência do benefício emergencial conta, você já pode usar os
            descontos de rotina na Late&Mia Clínica Veterinária.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-[18px] border border-sand-dark bg-white">
          <div className="grid grid-cols-[1fr_auto] gap-2 border-b border-sand-dark bg-cream px-4 py-3 text-[12px] font-semibold uppercase tracking-[1px] text-ink-muted">
            <span>Procedimento</span>
            <span>Desconto</span>
          </div>
          {benefits.map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[1fr_auto] gap-2 border-b border-sand-dark px-4 py-3 text-[14px] text-ink last:border-b-0"
            >
              <span>{item.label}</span>
              <strong className="text-forest">{item.discount}</strong>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[760px] text-[12px] leading-[1.5] text-ink-muted">
            Descontos não cumulativos, válidos apenas para serviços prestados
            diretamente pela clínica. Não abrangem serviços terceirizados.
          </p>
          <Link
            href="/beneficios"
            className="inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-sand-dark bg-white px-5 py-3 text-[14px] font-semibold text-ink transition-colors hover:bg-cream"
          >
            Ver tabela oficial de benefícios
          </Link>
        </div>
      </div>
    </section>
  );
}
