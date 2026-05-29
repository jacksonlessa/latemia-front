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
      '"A Mel foi atendida às 2h da manhã. Graças ao plano, paguei metade e o atendimento foi impecável. Recomendo para todo tutor responsável!"',
  },
  {
    name: 'Carlos M.',
    petLine: 'Tutor do Thor 🐕',
    initial: 'C',
    quote:
      '"Meu cachorro engoliu algo que não devia e precisou de atendimento urgente. O plano cobriu 50% e o processo foi simples, sem burocracia."',
  },
  {
    name: 'Fernanda R.',
    petLine: 'Tutora da Luna 🐈',
    initial: 'F',
    quote:
      '"Ótimo custo-benefício. Mensalidade acessível e quando precisei o desconto foi aplicado na hora. Plano simples e honesto como prometido."',
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
