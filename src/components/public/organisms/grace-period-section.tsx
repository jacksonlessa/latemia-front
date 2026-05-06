import type { LandingContent } from '@/content/landing';

interface GracePeriodSectionProps {
  data: LandingContent['gracePeriod'];
}

export function GracePeriodSection({ data }: GracePeriodSectionProps) {
  return (
    <section className="px-6 md:px-10 py-16 max-w-3xl mx-auto text-center">
      <h2 className="font-display text-3xl md:text-4xl text-forest mb-4">
        {data.heading}
      </h2>
      <p className="text-lg leading-relaxed">{data.body}</p>
    </section>
  );
}
