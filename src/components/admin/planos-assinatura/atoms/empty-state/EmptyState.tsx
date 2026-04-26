import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 text-center',
        className,
      )}
    >
      {icon && (
        <div className="text-[#6B6B6E] opacity-50" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[#2C2C2E]">{title}</h3>
      <p className="max-w-sm text-sm text-[#6B6B6E]">{description}</p>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
