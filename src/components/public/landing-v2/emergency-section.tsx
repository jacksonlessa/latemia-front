import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Clock,
  Droplet,
  FlaskConical,
  HeartPulse,
  Info,
  Sun,
  Wind,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { AvailabilityBadge } from '@/components/public/atoms/availability-badge';

interface CovItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

const coveredItems: CovItem[] = [
  {
    title: 'Intoxicações',
    description: 'Envenenamento ou ingestão de substâncias tóxicas.',
    icon: FlaskConical,
  },
  {
    title: 'Convulsões',
    description: 'Crises súbitas que exigem atendimento imediato.',
    icon: Activity,
  },
  {
    title: 'Falta de ar',
    description: 'Dificuldade respiratória aguda ou asfixia.',
    icon: Wind,
  },
  {
    title: 'Hemorragias',
    description: 'Sangramentos externos e internos.',
    icon: Droplet,
  },
  {
    title: 'Choque',
    description: 'Hipovolêmico, séptico ou anafilático.',
    icon: HeartPulse,
  },
  {
    title: 'Dor aguda',
    description: 'Dor intensa que afeta o bem-estar do pet.',
    icon: Sun,
  },
  {
    title: 'Traumas graves',
    description: 'Atropelamentos, quedas e mordidas.',
    icon: Zap,
  },
  {
    title: 'Atendimento 24h',
    description: 'Prioridade na fila, dia ou madrugada.',
    icon: Clock,
  },
];

export function EmergencySection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="flex flex-col gap-2.5">
          <AvailabilityBadge variant="after-waiting" className="w-fit" />
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-[-0.03em] text-ink">
            E se uma <span className="text-forest">emergência</span> acontecer, o plano
            também <span className="text-forest">protege</span>.
          </h2>
          <p className="max-w-[720px] text-[15px] leading-[1.55] text-ink-soft">
            Depois da carência, o plano oferece 50% de desconto no atendimento
            emergencial realizado na clínica, ajudando a reduzir o impacto financeiro
            em um momento difícil.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {coveredItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col gap-2.5 rounded-[18px] border border-sand-dark bg-forest-pale px-3.5 pb-4 pt-[18px] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-forest-soft hover:shadow-[0_8px_22px_rgba(0,0,0,0.05)]"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-forest-deep">
                  <Icon size={22} strokeWidth={1.8} aria-hidden />
                </div>
                <div className="text-[14.5px] font-bold leading-[1.25] tracking-[-0.1px] text-ink">
                  {item.title}
                </div>
                <div className="text-[12.5px] leading-[1.4] text-ink-muted">{item.description}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-[22px] flex items-start gap-3 rounded-[18px] border border-sand-dark bg-forest-pale p-4 text-[13px] leading-[1.55] text-ink-soft">
          <Info
            size={20}
            strokeWidth={2}
            className="mt-px flex-shrink-0 text-forest"
            aria-hidden
          />
          <div>
            <strong className="text-ink">Em uma emergência, ligue para a clínica antes de sair de casa.</strong>{' '}
            Nossa equipe orienta você no caminho e prepara o atendimento.
          </div>
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
