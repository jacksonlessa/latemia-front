import { CheckCircle2 } from 'lucide-react';

interface CheckIconProps {
  size?: number;
  className?: string;
}

export function CheckIcon({ size = 20, className }: CheckIconProps) {
  return (
    <CheckCircle2
      size={size}
      className={`text-forest shrink-0 ${className ?? ''}`}
      aria-hidden="true"
    />
  );
}
