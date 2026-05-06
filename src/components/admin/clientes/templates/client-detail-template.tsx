import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ClientDetailPageClient } from '@/components/admin/clientes/organisms/client-detail-page-client';
import type { ClientDetail } from '@/lib/types/client';
import type { PlanListItem } from '@/lib/types/plan';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClientDetailTemplateProps {
  client: ClientDetail;
  /** All plans for this client (up to 100, pre-loaded server-side). */
  plans: PlanListItem[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ClientDetailTemplate — Server Component.
 *
 * Provides the two-column page scaffold:
 * - "Voltar para Clientes" breadcrumb
 * - ClientDetailPageClient (client state owner) with data props
 *
 * No client-side state lives here; this is purely a layout wrapper.
 */
export function ClientDetailTemplate({
  client,
  plans,
}: ClientDetailTemplateProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Back navigation */}
      <div>
        <Link
          href="/admin/clientes"
          className="inline-flex items-center gap-1 text-sm text-[#4E8C75] hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4E8C75] rounded-sm"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para Clientes
        </Link>
      </div>

      {/* Client detail — interactive owner */}
      <ClientDetailPageClient client={client} plans={plans} />
    </div>
  );
}
