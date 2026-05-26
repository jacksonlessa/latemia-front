export function CarenceSection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[1.4px] text-ink-muted">
            Carência
          </span>
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-[-0.03em] text-ink">
            O que tem carência e o que começa agora?
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-[18px] border border-forest-soft bg-forest-pale p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[1.2px] text-forest-deep">
              Começa após o primeiro pagamento
            </div>
            <ul className="mt-3 space-y-2 text-[15px] text-ink">
              <li>Clube de Vantagens</li>
              <li>Orientação por WhatsApp</li>
            </ul>
          </div>
          <div className="rounded-[18px] border border-amber-200 bg-amber-50 p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[1.2px] text-amber-700">
              Começa após 180 dias
            </div>
            <ul className="mt-3 space-y-2 text-[15px] text-ink">
              <li>50% de desconto no atendimento emergencial</li>
            </ul>
          </div>
        </div>
        <p className="mt-5 max-w-[860px] text-[13px] leading-[1.6] text-ink-soft">
          A carência vale apenas para o benefício emergencial. Durante esse período, o
          plano já está ativo e os benefícios de rotina podem ser utilizados conforme a
          tabela vigente.
        </p>
      </div>
    </section>
  );
}
