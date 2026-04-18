import { FaqItem } from '@/components/public/molecules/faq-item';
import type { LandingContent } from '@/content/landing';

interface FaqSectionProps {
  data: LandingContent['faq'];
}

export function FaqSection({ data }: FaqSectionProps) {
  return (
    <section className="px-6 md:px-10 py-16 max-w-3xl mx-auto">
      <h2 className="font-display text-3xl md:text-4xl text-forest mb-8 text-center">
        {data.heading}
      </h2>
      <div className="flex flex-col gap-3">
        {data.items.map((item) => (
          <FaqItem key={item.question} {...item} />
        ))}
      </div>
    </section>
  );
}
