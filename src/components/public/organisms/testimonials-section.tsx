import { TestimonialCard } from '@/components/public/molecules/testimonial-card';
import type { LandingContent } from '@/content/landing';

interface TestimonialsSectionProps {
  data: LandingContent['testimonials'];
}

export function TestimonialsSection({ data }: TestimonialsSectionProps) {
  return (
    <section className="px-6 md:px-10 py-16 max-w-6xl mx-auto">
      <h2 className="font-display text-3xl md:text-4xl text-forest mb-10 text-center">
        {data.heading}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.items.map((item) => (
          <TestimonialCard key={`${item.petName}-${item.tutorName}`} {...item} />
        ))}
      </div>
    </section>
  );
}
