export function CarenceSection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="grid grid-cols-1 items-center gap-8 sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-center overflow-hidden rounded-[18px] border border-sand-dark bg-cream">
              <div className="flex flex-1 flex-col gap-1 border-r border-sand-dark px-3.5 py-4">
                <div className="text-[10px] font-semibold uppercase tracking-[1px] text-ink-muted">
                  Contratação
                </div>
                <div className="font-display text-lg text-ink">Hoje</div>
              </div>
              <div className="flex flex-1 flex-col gap-1 border-r border-sand-dark px-3.5 py-4">
                <div className="text-[10px] font-semibold uppercase tracking-[1px] text-ink-muted">
                  Carência
                </div>
                <div className="font-display text-lg text-ink">6 meses</div>
              </div>
              <div className="flex flex-1 flex-col gap-1 bg-forest px-3.5 py-4">
                <div className="text-[10px] font-semibold uppercase tracking-[1px] text-white/70">
                  Benefício ativo
                </div>
                <div className="font-display text-lg text-white">50% off ✓</div>
              </div>
            </div>
            <div className="flex h-[180px] flex-col items-center justify-center gap-2.5 rounded-[18px] bg-forest-pale text-forest">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="opacity-35" aria-hidden>
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 10h18M8 3v4M16 3v4" />
              </svg>
              <span className="text-[11px] font-semibold uppercase tracking-[1px] text-ink-muted opacity-70">
                Foto clínica / equipe
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-semibold uppercase tracking-[1.4px] text-ink-muted">
              Carência
            </span>
            <h2 className="font-display text-[28px] leading-[1.05] tracking-[-0.03em] text-ink">
              6 meses para <em className="italic text-forest">proteger todos</em>.
            </h2>
            <p className="text-[14.5px] leading-[1.6] text-ink-soft">
              O período de carência existe para garantir o equilíbrio financeiro do plano e que possamos manter o benefício para todos os tutores. É uma prática padrão em planos de saúde.
            </p>
            <div className="flex items-start gap-3 rounded-xl border border-forest-soft bg-forest-pale px-4 py-3.5">
              <div className="mt-0.5 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3F5A41" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v.01M11 12h1v5h1" />
                </svg>
              </div>
              <p className="text-[13.5px] leading-[1.5] text-forest-deep">
                <strong className="font-bold">Quanto antes você contratar, mais cedo estará coberto.</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
