interface Testimonial {
  name: string;
  petLine: string;
  initial: string;
  quote: string;
}

const items: Testimonial[] = [
  {
    name: 'Ana Paula S.',
    petLine: 'Tutora da Mel 🐾',
    initial: 'A',
    quote:
      '"A equipe é extremamente atenciosa e cuidadosa. Senti que a Mel estava em boas mãos do primeiro minuto. Explicaram cada passo do atendimento com paciência e carinho."',
  },
  {
    name: 'Carlos M.',
    petLine: 'Tutor do Thor 🐕',
    initial: 'C',
    quote:
      '"Clínica organizada, limpa e com profissionais muito preparados. O Dr. e a equipe trataram o Thor com o mesmo carinho que eu trataria. Atendimento humano de verdade."',
  },
  {
    name: 'Fernanda R.',
    petLine: 'Tutora da Luna 🐈',
    initial: 'F',
    quote:
      '"Estrutura excelente e atendimento ágil. A Luna sempre fica tranquila durante as consultas — isso só acontece quando o ambiente e as pessoas transmitem confiança."',
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-cream py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[1.4px] text-ink-muted">
            Depoimentos
          </span>
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-[-0.03em] text-ink">
            Tutores que <span className="text-forest">já viveram</span> uma emergência.
          </h2>
        </div>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          {items.map((item) => (
            <div
              key={item.name}
              className="flex flex-col gap-3.5 rounded-[18px] border border-sand-dark bg-white p-[22px] sm:flex-1 sm:basis-[280px]"
            >
              <div className="flex gap-1 text-[14px] text-gold">⭐⭐⭐⭐⭐</div>
              <p className="text-[14.5px] leading-[1.6] text-ink">{item.quote}</p>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-forest-pale text-sm font-semibold text-forest-deep">
                  {item.initial}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-ink">{item.name}</div>
                  <div className="mt-px text-[12px] text-ink-muted">{item.petLine}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
