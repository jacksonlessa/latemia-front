'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PlanStatus } from '@/lib/types/plan';

const STATUS_OPTIONS: Array<{ value: PlanStatus | 'todos'; label: string }> = [
  { value: 'todos', label: 'Todos os status' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'inadimplente', label: 'Inadimplente' },
  { value: 'cancelado', label: 'Cancelado' },
];

export function PlanFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentSearch = searchParams.get('search') ?? '';
  const currentStatus = searchParams.get('status') ?? 'todos';

  const [searchValue, setSearchValue] = useState(currentSearch);

  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  function buildUrl(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === '' || value === 'todos') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    params.set('page', '1');
    return `?${params.toString()}`;
  }

  function handleSearchChange(value: string) {
    setSearchValue(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      router.replace(buildUrl({ search: value }));
    }, 300);
  }

  function handleStatusChange(value: string) {
    router.replace(buildUrl({ status: value }));
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Status filter */}
      <Select value={currentStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full sm:w-48" aria-label="Filtrar por status">
          <SelectValue placeholder="Todos os status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Search */}
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6E]"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Buscar por cliente ou pet..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Buscar planos"
        />
      </div>
    </div>
  );
}
