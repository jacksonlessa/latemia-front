import Link from 'next/link';
import { PriceTag } from '@/components/public/atoms/price-tag';
import { publicSite } from '@/config/public-site';
import type { LandingContent } from '@/content/landing';

interface PricingSectionProps {
  data: LandingContent['pricing'];
}

export function PricingSection({ data }: PricingSectionProps) {
  return (
    <section className="px-6 md:px-10 py-16 max-w-3xl mx-auto text-center">
      <h2 className="font-display text-3xl md:text-4xl text-forest mb-6">
        {data.heading}
      </h2>
      <div className="flex flex-col items-center gap-2 mb-4">
        <PriceTag cents={data.priceCents} className="font-display text-5xl md:text-6xl text-forest" />
        <span className="text-forest/70">{data.unitLabel}</span>
      </div>
      <p className="text-sm mb-8 max-w-xl mx-auto">{data.footnote}</p>
      <Link
        href={publicSite.checkoutPath}
        className="inline-block rounded-full bg-forest text-cream px-8 py-3 text-lg font-semibold hover:bg-forest-strong transition-colors"
      >
        Contratar agora
      </Link>
    </section>
  );
}
