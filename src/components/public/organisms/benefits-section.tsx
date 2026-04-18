import { BenefitCard } from '@/components/public/molecules/benefit-card';
import { BadgeHighlight } from '@/components/public/atoms/badge-highlight';
import type { LandingContent } from '@/content/landing';

interface BenefitsSectionProps {
  data: LandingContent['benefits'];
}

export function BenefitsSection({ data }: BenefitsSectionProps) {
  return (
    <section className="px-6 md:px-10 py-16 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <BadgeHighlight>50% de desconto em emergências</BadgeHighlight>
        <h2 className="font-display text-3xl md:text-4xl text-forest mt-4">
          {data.heading}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.items.map((item) => (
          <BenefitCard key={item.title} {...item} />
        ))}
      </div>
    </section>
  );
}
