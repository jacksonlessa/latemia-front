import type { LucideIcon } from 'lucide-react';
import {
  Bubbles,
  ClipboardList,
  Microchip,
  ScanLine,
  Scissors,
  Stethoscope,
  Syringe,
  TestTube,
} from 'lucide-react';
import Link from 'next/link';

interface BenefitItem {
  label: string;
  description: string;
  discount: string;
  icon: LucideIcon;
}

const benefits: BenefitItem[] = [
  {
    label: 'Consultas eletivas e de especialidades',
    description: 'Retornos, especialistas e avaliações preventivas.',
    discount: 'até 30%',
    icon: Stethoscope,
  },
  {
    label: 'Exames de sangue laboratoriais',
    description: 'Hemograma, bioquímica e perfis laboratoriais.',
    discount: '10%',
    icon: TestTube,
  },
  {
    label: 'Cirurgias eletivas',
    description: 'Procedimentos programados não emergenciais.',
    discount: '10%',
    icon: Scissors,
  },
  {
    label: 'Procedimentos',
    description: 'Tratamentos e cuidados clínicos de rotina.',
    discount: '10%',
    icon: ClipboardList,
  },
  {
    label: 'Banho e Tosa',
    description: 'Higiene, estética e bem-estar do seu pet.',
    discount: '10%',
    icon: Bubbles,
  },
  {
    label: 'Vacinas',
    description: 'Imunização e prevenção de doenças.',
    discount: '10%',
    icon: Syringe,
  },
  {
    label: 'Exames de imagem (Raio-X e Ultrassom)',
    description: 'Diagnóstico por imagem na clínica.',
    discount: '5%',
    icon: ScanLine,
  },
  {
    label: 'Microchipagem **',
    description: 'Identificação permanente e rastreável.',
    discount: '30%',
    icon: Microchip,
  },
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
            O <span className="text-forest">Clube de Vantagens</span> ajuda no cuidado do{' '}
            <span className="text-forest">dia a dia</span>.
          </h2>
          <p className="max-w-[680px] text-[15px] leading-[1.55] text-ink-soft">
            Enquanto a carência do benefício emergencial conta, você já pode usar os
            descontos de rotina na Late&Mia Clínica Veterinária.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex flex-col gap-3 rounded-[18px] border border-sand-dark bg-white p-[22px] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-forest-soft hover:shadow-[0_8px_22px_rgba(0,0,0,0.05)]"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-forest-pale text-forest">
                  <Icon size={22} strokeWidth={1.8} aria-hidden />
                </div>
                <div className="text-base font-bold leading-[1.25] tracking-[-0.2px] text-ink">
                  {item.label}
                </div>
                <div className="text-sm leading-[1.5] text-ink-soft">{item.description}</div>
                <div className="mt-auto pt-1 text-[13px] font-semibold text-forest">
                  Benefício: {item.discount} de desconto
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[760px] text-[12px] leading-[1.5] text-ink-muted">
            Descontos não cumulativos, válidos apenas para serviços prestados
            diretamente pela clínica. Não abrangem serviços terceirizados. **
            Mediante agendamento prévio.
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
