import { StarRating } from '@/components/public/atoms/star-rating';
import type { Testimonial } from '@/content/landing';

export function TestimonialCard({ petName, tutorName, rating, quote }: Testimonial) {
  return (
    <article className="rounded-2xl bg-white/60 border border-sand p-6 flex flex-col gap-3">
      <StarRating rating={rating} />
      <blockquote className="text-sm leading-relaxed">&ldquo;{quote}&rdquo;</blockquote>
      <footer className="text-sm">
        <span className="font-semibold text-forest">{petName}</span>
        <span className="text-forest/70"> — tutor(a) {tutorName}</span>
      </footer>
    </article>
  );
}
