import Link from 'next/link';
import { ClinicPhoto } from '@/components/public/atoms/clinic-photo';

export function AboutClinicSection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="grid grid-cols-1 gap-6 rounded-[22px] sm:grid-cols-2">
          <div>
            <h2 className="font-display text-[clamp(28px,7vw,40px)] leading-[1.05] tracking-[-0.03em] text-ink">
              Um plano ligado a uma <span className="text-forest">clínica real</span>, em{' '}
              <span className="text-forest">Camboriú</span>.
            </h2>
            <p className="mt-3 text-[15px] leading-[1.6] text-ink-soft">
              O Plano Pet Dr. Cleitinho é oferecido pela Late&Mia Clínica Veterinária,
              localizada em Camboriú/SC. A contratação é digital, mas o cuidado
              acontece perto de você, com uma equipe veterinária que acompanha os pets
              na rotina e nos momentos de urgência.
            </p>
            <Link
              href="/sobre-a-clinica"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-forest px-6 py-3 text-[14px] font-semibold text-white transition-[filter] hover:brightness-110"
            >
              Conhecer a clínica
            </Link>
          </div>
          <ClinicPhoto
            className="min-h-[220px] rounded-[18px] sm:min-h-[280px]"
            sizes="(max-width: 640px) 100vw, 480px"
          />
        </div>
      </div>
    </section>
  );
}
