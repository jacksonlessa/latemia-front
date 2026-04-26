'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Collapsible section for forms.
 * Uses native React state instead of a Radix collapsible primitive
 * since @radix-ui/react-collapsible is not installed.
 */
export function FormSection({
  title,
  description,
  defaultOpen = true,
  children,
  className,
}: FormSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const sectionId = `form-section-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={cn('rounded-lg border border-border', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={sectionId}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center justify-between gap-3 px-4 py-3 text-left',
          'rounded-t-lg hover:bg-muted/50 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4E8C75] focus-visible:ring-inset',
          !open && 'rounded-b-lg',
        )}
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div id={sectionId} className="px-4 pb-4 pt-2">
          {children}
        </div>
      )}
    </div>
  );
}
