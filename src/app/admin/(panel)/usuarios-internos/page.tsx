import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchMe, listUsers } from "@/lib/api-server";
import { SESSION_COOKIE } from "@/lib/session";
import { UsersPageClient } from "@/components/admin/usuarios-internos/organisms/users-page-client";
import type { PaginatedInternalUsers } from "@/lib/types/users";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function UsuariosInternosPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const me = await fetchMe(token);
  if (!me || me.role !== "admin") {
    redirect("/admin/home");
  }

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = typeof params.search === "string" && params.search ? params.search : undefined;
  const role =
    params.role === "admin" || params.role === "atendente" ? params.role : undefined;
  // Default status is "active" per spec
  const status: "active" | "inactive" =
    params.status === "inactive" ? "inactive" : "active";

  let initialData: PaginatedInternalUsers | null = null;
  let fetchError: string | null = null;

  try {
    initialData = await listUsers(token, {
      page,
      limit: 20,
      search,
      role,
      status,
    });
  } catch {
    fetchError = "Não foi possível carregar a lista de usuários.";
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h1 className="mb-2 text-xl font-semibold text-[#2C2C2E] md:text-2xl">
          Usuários Internos
        </h1>
        <p className="text-sm text-[#6B6B6E] md:text-base">
          Gestão de usuários e permissões de acesso
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        {fetchError ? (
          <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <p className="text-sm text-destructive">{fetchError}</p>
            <a
              href={`/admin/usuarios-internos?page=${page}&status=${status}${search ? `&search=${encodeURIComponent(search)}` : ""}${role ? `&role=${role}` : ""}`}
              className="text-sm text-[#4E8C75] underline underline-offset-4 hover:opacity-80"
            >
              Tentar novamente
            </a>
          </div>
        ) : (
          <UsersPageClient
            initialData={initialData!}
            page={page}
            currentUserId={me.id}
          />
        )}
      </div>
    </div>
  );
}
