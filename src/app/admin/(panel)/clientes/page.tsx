import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchMe, fetchClients } from "@/lib/api-server";
import { SESSION_COOKIE } from "@/lib/session";
import { ClientsPageClient } from "@/components/admin/clientes/organisms/clients-page-client";
import type { PaginatedClients } from "@/lib/types/client";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ClientesPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const me = await fetchMe(token);
  if (!me) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search =
    typeof params.search === "string" && params.search
      ? params.search
      : undefined;

  let initialData: PaginatedClients | null = null;
  let fetchError: string | null = null;

  try {
    initialData = await fetchClients({ search, page, limit: 20, token });
  } catch {
    fetchError = "Não foi possível carregar a lista de clientes.";
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h1 className="mb-2 text-xl font-semibold text-[#2C2C2E] md:text-2xl">
          Clientes
        </h1>
        <p className="text-sm text-[#6B6B6E] md:text-base">
          Gestão de clientes e tutores
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-4 md:p-6">
        {fetchError ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <p className="text-sm text-destructive">{fetchError}</p>
            <a
              href={`/admin/clientes?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
              className="text-sm text-[#4E8C75] underline underline-offset-4 hover:opacity-80"
            >
              Tentar novamente
            </a>
          </div>
        ) : (
          <ClientsPageClient initialData={initialData!} page={page} />
        )}
      </div>
    </div>
  );
}
