import { AvailabilityBadge } from '@/components/public/atoms/availability-badge';
import { clubeContent } from '@/content/clube-vantagens';

export function HeroClube() {
  return (
    <section className="overflow-hidden bg-cream py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="flex max-w-[760px] flex-col items-start gap-5">
          <AvailabilityBadge variant="immediate" />

          <h1 className="font-display text-[clamp(32px,8vw,52px)] leading-[1.05] tracking-[-0.03em] text-ink">
            {clubeContent.hero.headline}
          </h1>

          <p className="max-w-[620px] text-base leading-[1.55] text-ink-soft">
            {clubeContent.hero.subtext}
          </p>
        </div>
      </div>
    </section>
  );
}
