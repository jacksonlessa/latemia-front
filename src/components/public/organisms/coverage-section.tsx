import { CoverageItem } from '@/components/public/molecules/coverage-item';
import type { LandingContent } from '@/content/landing';

interface CoverageSectionProps {
  data: LandingContent['coverage'];
}

export function CoverageSection({ data }: CoverageSectionProps) {
  return (
    <section className="px-6 md:px-10 py-16 max-w-4xl mx-auto">
      <h2 className="font-display text-3xl md:text-4xl text-forest mb-8 text-center">
        {data.heading}
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.items.map((item) => (
          <CoverageItem key={item} label={item} />
        ))}
      </ul>
    </section>
  );
}
