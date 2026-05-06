import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PlanDetailSectionProps {
  title: string;
  subtitle?: ReactNode;
  /** Optional content rendered on the right side of the header (e.g. action button). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PlanDetailSection({
  title,
  subtitle,
  action,
  children,
  className,
}: PlanDetailSectionProps) {
  return (
    <section
      className={cn(
        'rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden',
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 md:px-5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[#2C2C2E]">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-[#6B6B6E]">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="flex shrink-0 items-center">{action}</div> : null}
      </header>
      <div className="px-4 py-4 md:px-5 md:py-5">{children}</div>
    </section>
  );
}
