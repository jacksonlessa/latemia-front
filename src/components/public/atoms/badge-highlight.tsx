interface BadgeHighlightProps {
  children: React.ReactNode;
  className?: string;
}

export function BadgeHighlight({ children, className }: BadgeHighlightProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-forest text-cream px-3 py-1 text-sm font-semibold ${className ?? ''}`}
    >
      {children}
    </span>
  );
}
