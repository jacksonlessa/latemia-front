'use client';

import { ClientFilterBar } from '@/components/admin/clientes/molecules/client-filter-bar';
import { ClientsTable } from '@/components/admin/clientes/organisms/clients-table';
import type { PaginatedClients } from '@/lib/types/client';

interface ClientsPageClientProps {
  initialData: PaginatedClients;
  page: number;
}

export function ClientsPageClient({ initialData, page }: ClientsPageClientProps) {
  const { data, meta } = initialData;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <ClientFilterBar />
      </div>

      {/* Data table */}
      <ClientsTable
        data={data}
        total={meta.total}
        page={page}
        limit={meta.limit}
      />
    </div>
  );
}
