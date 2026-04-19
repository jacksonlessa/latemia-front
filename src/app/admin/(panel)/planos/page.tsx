import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchMe } from '@/lib/api-server';
import { SESSION_COOKIE } from '@/lib/session';
import { listPlansUseCase } from '@/domain/plan/list-plans.use-case';
import { PlansPageClient } from '@/components/admin/planos/organisms/plans-page-client/PlansPageClient';
import type { PlanListResponse } from '@/lib/types/plan';
import type { PlanStatus } from '@/lib/types/plan';

const VALID_STATUSES = new Set<PlanStatus>([
  'pendente',
  'ativo',
  'inadimplente',
  'cancelado',
]);

function parseStatus(value: unknown): PlanStatus | undefined {
  if (typeof value === 'string' && VALID_STATUSES.has(value as PlanStatus)) {
    return value as PlanStatus;
  }
  return undefined;
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PlanosPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect('/admin/login');
  }

  const me = await fetchMe(token);
  if (!me) {
    redirect('/admin/login');
  }

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search =
    typeof params.search === 'string' && params.search
      ? params.search
      : undefined;
  const status = parseStatus(params.status);

  let initialData: PlanListResponse | null = null;
  let fetchError: string | null = null;

  try {
    initialData = await listPlansUseCase({
      page,
      perPage: 20,
      status,
      search,
      token,
    });
  } catch {
    fetchError = 'Não foi possível carregar a lista de planos.';
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h1 className="mb-2 text-xl font-semibold text-[#2C2C2E] md:text-2xl">
          Planos
        </h1>
        <p className="text-sm text-[#6B6B6E] md:text-base">
          Gestão de planos e coberturas
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4 md:p-6">
        {fetchError ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <p className="text-sm text-destructive">{fetchError}</p>
            <a
              href={`/admin/planos?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}${status ? `&status=${status}` : ''}`}
              className="text-sm text-[#4E8C75] underline underline-offset-4 hover:opacity-80"
            >
              Tentar novamente
            </a>
          </div>
        ) : (
          <PlansPageClient initialData={initialData!} page={page} />
        )}
      </div>
    </div>
  );
}
