'use client';

import { PlanFilterBar } from '@/components/admin/planos/molecules/plan-filter-bar/PlanFilterBar';
import { PlanTable } from '@/components/admin/planos/organisms/plan-table/PlanTable';
import type { PlanListResponse } from '@/lib/types/plan';

interface PlansPageClientProps {
  initialData: PlanListResponse;
  page: number;
}

export function PlansPageClient({ initialData, page }: PlansPageClientProps) {
  const { data, meta } = initialData;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <PlanFilterBar />

      {/* Data table */}
      <PlanTable
        plans={data}
        total={meta.total}
        page={page}
        limit={meta.limit}
      />
    </div>
  );
}
