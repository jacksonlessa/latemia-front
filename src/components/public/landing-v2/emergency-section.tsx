import Link from 'next/link';
import { AvailabilityBadge } from '@/components/public/atoms/availability-badge';

const emergencies = [
  'Traumas graves',
  'Intoxicações',
  'Convulsões',
  'Dificuldade respiratória aguda',
  'Hemorragias',
  'Dor aguda intensa',
];

export function EmergencySection() {
  return (
    <section className="bg-cream py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="flex flex-col gap-2.5">
          <AvailabilityBadge variant="after-waiting" className="w-fit" />
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-[-0.03em] text-ink">
            E se uma emergência acontecer, o plano também protege.
          </h2>
          <p className="max-w-[720px] text-[15px] leading-[1.55] text-ink-soft">
            Depois da carência, o plano oferece 50% de desconto no atendimento
            emergencial realizado na clínica, ajudando a reduzir o impacto financeiro
            em um momento difícil.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {emergencies.map((item) => (
            <div
              key={item}
              className="rounded-[14px] border border-sand-dark bg-white px-4 py-3 text-[14px] font-semibold text-ink"
            >
              {item}
            </div>
          ))}
        </div>

        <p className="mt-5 max-w-[860px] text-[12px] leading-[1.5] text-ink-muted">
          A caracterização da emergência é feita pelo médico veterinário da clínica. O
          benefício vale para a fase aguda do atendimento, conforme os termos do plano.
        </p>

        <div className="mt-6">
          <Link
            href="/emergencia"
            className="inline-flex items-center justify-center rounded-full bg-forest px-6 py-3 text-[14px] font-semibold text-white transition-[filter] hover:brightness-110"
          >
            Entender proteção emergencial
          </Link>
        </div>
      </div>
    </section>
  );
}
