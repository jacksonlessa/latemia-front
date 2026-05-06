'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function ClientFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentSearch = searchParams.get('search') ?? '';
  const [searchValue, setSearchValue] = useState(currentSearch);

  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  function buildUrl(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === '') {
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

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="relative flex-1">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6E]"
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder="Buscar por nome, CPF ou telefone..."
        value={searchValue}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="pl-9"
        aria-label="Buscar clientes"
      />
    </div>
  );
}
