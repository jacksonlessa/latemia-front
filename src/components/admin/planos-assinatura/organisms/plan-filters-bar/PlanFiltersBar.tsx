'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PlanFiltersBarProps {
  nameFilter: string;
  onNameFilterChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Filter bar for plans list — currently supports filtering by name.
 * Stateless: parent controls the value.
 */
export function PlanFiltersBar({
  nameFilter,
  onNameFilterChange,
  className,
  disabled = false,
}: PlanFiltersBarProps) {
  return (
    <div className={cn('flex items-center gap-3', className)} role="search" aria-label="Filtros de planos">
      <div className="relative flex-1 max-w-sm">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6E]"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Buscar por nome..."
          value={nameFilter}
          onChange={(e) => onNameFilterChange(e.target.value)}
          className="pl-9"
          aria-label="Buscar planos por nome"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
