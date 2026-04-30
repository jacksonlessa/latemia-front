import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchBenefitUsages, fetchMe } from '@/lib/api-server';
import { SESSION_COOKIE } from '@/lib/session';
import { UsoBeneficioPageClient } from './UsoBeneficioPageClient';
import type {
  BenefitUsageResponse,
  Paginated,
} from '@/lib/types/benefit-usage';

// Default page size mirrors the backend cap (`perPage` ≤ 100, default 20).
const PER_PAGE = 20;

// RFC 4122-compatible UUID matcher used to validate the `planId` query param
// before forwarding it to the backend (defense-in-depth — backend also
// validates via class-validator, but failing fast in the page avoids an
// unnecessary 422 round-trip).
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/** Reads a `string` value from the dynamic searchParams shape. */
function readString(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

/** Reads a positive integer page number from searchParams (clamped to >= 1). */
function readPage(value: string | string[] | undefined): number {
  const raw = readString(value);
  if (!raw) return 1;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

/** Returns the input only if it looks like a UUID; otherwise undefined. */
function readUuid(value: string | string[] | undefined): string | undefined {
  const raw = readString(value);
  if (!raw) return undefined;
  return UUID_REGEX.test(raw) ? raw : undefined;
}

/**
 * Server Component — `/admin/uso-beneficio`.
 *
 * Admin-only page. Validates session + role, parses `searchParams`, fetches
 * the paginated benefit-usage list and delegates rendering to the Client
 * Component. Atendentes are redirected to `/admin/home?error=forbidden`.
 */
export default async function UsoBeneficioPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect('/admin/login');
  }

  const me = await fetchMe(token);
  if (!me) {
    redirect('/admin/login');
  }
  if (me.role !== 'admin') {
    // Page is admin-only by PRD requirement F3 (req. 10).
    redirect('/admin/home?error=forbidden');
  }

  const params = await searchParams;
  const page = readPage(params.page);
  const planId = readUuid(params.planId);
  const from = readString(params.from);
  const to = readString(params.to);

  let initialData: Paginated<BenefitUsageResponse> | null = null;
  let fetchError: string | null = null;

  try {
    initialData = await fetchBenefitUsages({
      page,
      limit: PER_PAGE,
      planId,
      from,
      to,
      token,
    });
  } catch {
    fetchError = 'Não foi possível carregar a lista de usos de benefício.';
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page header */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h1 className="mb-2 text-xl font-semibold text-[#2C2C2E] md:text-2xl">
          Uso do Benefício
        </h1>
        <p className="text-sm text-[#6B6B6E] md:text-base">
          Histórico e controle de uso dos benefícios
        </p>
      </div>

      {fetchError ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-destructive">{fetchError}</p>
        </div>
      ) : (
        <UsoBeneficioPageClient
          initialData={initialData!}
          initialFilters={{
            page,
            planId: planId ?? '',
            from: from ?? '',
            to: to ?? '',
          }}
        />
      )}
    </div>
  );
}
