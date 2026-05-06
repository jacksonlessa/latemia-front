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

type RoleFilter = 'admin' | 'atendente' | '';
type StatusFilter = 'active' | 'inactive' | '';

export function UserFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentSearch = searchParams.get('search') ?? '';
  const currentRole = (searchParams.get('role') ?? '') as RoleFilter;
  const currentStatus = (searchParams.get('status') ?? '') as StatusFilter;

  // Controlled state for search input so URL changes (e.g. back navigation) reflect in the field
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

    // Reset to page 1 on any filter change
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

  function handleRoleChange(value: string) {
    router.replace(buildUrl({ role: value === 'all' ? '' : value }));
  }

  function handleStatusChange(value: string) {
    router.replace(buildUrl({ status: value === 'all' ? '' : value }));
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search input */}
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6E]"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Buscar por nome ou e-mail..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Buscar usuários"
        />
      </div>

      {/* Role filter */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="role-filter"
          className="text-sm text-[#6B6B6E] whitespace-nowrap"
        >
          Papel
        </label>
        <Select
          value={currentRole === '' ? 'all' : currentRole}
          onValueChange={handleRoleChange}
        >
          <SelectTrigger
            id="role-filter"
            className="w-full sm:w-[160px]"
            aria-label="Filtrar por papel"
          >
            <SelectValue placeholder="Todos os papéis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os papéis</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="atendente">Atendente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="status-filter"
          className="text-sm text-[#6B6B6E] whitespace-nowrap"
        >
          Status
        </label>
        <Select
          value={currentStatus === '' ? 'all' : currentStatus}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger
            id="status-filter"
            className="w-full sm:w-[160px]"
            aria-label="Filtrar por status"
          >
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
