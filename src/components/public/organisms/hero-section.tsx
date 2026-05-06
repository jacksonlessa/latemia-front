import Link from 'next/link';
import type { LandingContent } from '@/content/landing';

interface HeroSectionProps {
  data: LandingContent['hero'];
}

export function HeroSection({ data }: HeroSectionProps) {
  return (
    <section className="px-6 md:px-10 py-12 md:py-20 max-w-5xl mx-auto text-center">
      <h1 className="font-display text-4xl md:text-6xl text-forest leading-tight mb-6">
        {data.title}
      </h1>
      <p className="text-lg md:text-xl text-forest/80 mb-8 max-w-2xl mx-auto">
        {data.subtitle}
      </p>
      <Link
        href={data.ctaHref}
        className="inline-block rounded-full bg-forest text-cream px-8 py-3 text-lg font-semibold hover:bg-forest-strong transition-colors"
      >
        {data.ctaLabel}
      </Link>
    </section>
  );
}
