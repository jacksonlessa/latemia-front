import { ExclusionItem } from '@/components/public/molecules/exclusion-item';
import type { LandingContent } from '@/content/landing';

interface ExclusionsSectionProps {
  data: LandingContent['exclusions'];
}

export function ExclusionsSection({ data }: ExclusionsSectionProps) {
  return (
    <section className="px-6 md:px-10 py-16 max-w-4xl mx-auto">
      <h2 className="font-display text-3xl md:text-4xl text-forest mb-8 text-center">
        {data.heading}
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.items.map((item) => (
          <ExclusionItem key={item} label={item} />
        ))}
      </ul>
    </section>
  );
}
