import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: 1 | 2 | 3 | 4 | 5;
  className?: string;
}

export function StarRating({ rating, className }: StarRatingProps) {
  return (
    <span
      role="img"
      aria-label={`${rating} de 5 estrelas`}
      className={`flex gap-0.5 ${className ?? ''}`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={16}
          className={i < rating ? 'fill-forest text-forest' : 'fill-sand text-sand'}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
