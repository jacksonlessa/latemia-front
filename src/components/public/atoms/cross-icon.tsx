import { XCircle } from 'lucide-react';

interface CrossIconProps {
  size?: number;
  className?: string;
}

export function CrossIcon({ size = 20, className }: CrossIconProps) {
  return (
    <XCircle
      size={size}
      className={`text-forest shrink-0 ${className ?? ''}`}
      aria-hidden="true"
    />
  );
}
