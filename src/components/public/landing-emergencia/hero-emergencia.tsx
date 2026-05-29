import { AvailabilityBadge } from '@/components/public/atoms/availability-badge';
import { emergenciaContent } from '@/content/emergencia';

export function HeroEmergencia() {
  const { hero } = emergenciaContent;

  return (
    <section className="overflow-hidden bg-cream py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="flex max-w-[760px] flex-col items-start gap-5">
          <AvailabilityBadge variant="after-waiting" className="text-sm" />

          <h1 className="font-display text-[clamp(32px,8vw,52px)] leading-[1.05] tracking-[-0.03em] text-ink">
            {hero.headline}
          </h1>

          <p className="text-[clamp(22px,5vw,32px)] font-semibold leading-[1.2] text-forest">
            {hero.discount}% de desconto em atendimento emergencial veterinário
          </p>

          <div
            className="w-full rounded-[18px] border border-amber-200 bg-amber-50 p-5 sm:p-6"
            role="note"
            aria-label={`Carência de ${hero.carenceDays} dias`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[1.2px] text-amber-800">
              Carência de {hero.carenceDays} dias — leia antes de contratar
            </p>
            <p className="mt-2 text-[15px] leading-[1.55] text-amber-950">
              O desconto de {hero.discount}% só pode ser usado após{' '}
              <strong>{hero.carenceDays} dias corridos</strong> a contar da confirmação
              do primeiro pagamento. Durante a carência o plano está ativo, mas este
              benefício ainda não está disponível.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
