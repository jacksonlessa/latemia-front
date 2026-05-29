import { clubeContent } from '@/content/clube-vantagens';

export function ScenariosClube() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="rounded-[22px] border border-sand-dark bg-cream p-6 sm:p-8">
          <h2 className="font-display text-[clamp(28px,7vw,40px)] leading-[1.05] tracking-[-0.03em] text-ink">
            Quando o Clube faz diferença
          </h2>
          <p className="mt-3 max-w-[820px] text-[15px] leading-[1.6] text-ink-soft">
            Situações do dia a dia em que os descontos ajudam a manter o cuidado do
            pet com mais previsibilidade.
          </p>
          <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {clubeContent.scenarios.map((scenario) => (
              <li
                key={scenario}
                className="flex items-start gap-2.5 text-[15px] leading-[1.5] text-ink"
              >
                <span
                  className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-pale text-forest"
                  aria-hidden
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                {scenario}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
