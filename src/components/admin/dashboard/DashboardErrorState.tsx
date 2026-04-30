import Link from "next/link";
import { XCircle } from "lucide-react";

interface DashboardErrorStateProps {
  /** Error message returned by the failing endpoint. */
  message: string;
}

/**
 * Full-page error state shown when any of the dashboard endpoints fail.
 * Per PRD §7.3, the operator retries by reloading the entire page — there is
 * no per-block retry in this delivery.
 */
export function DashboardErrorState({ message }: DashboardErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm"
    >
      <XCircle
        className="h-16 w-16 text-[#C94040]"
        aria-hidden="true"
      />
      <h2 className="mt-4 text-xl font-semibold text-[#2C2C2E]">
        Falha ao carregar o dashboard
      </h2>
      <p className="mt-2 max-w-md text-sm text-[#6B6B6E]">{message}</p>
      <Link
        href="/admin/home"
        prefetch={false}
        className="mt-6 inline-flex items-center justify-center rounded-md bg-[#4E8C75] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3F7460]"
      >
        Tentar novamente
      </Link>
    </div>
  );
}
