import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchMe, fetchNotificationBuffer } from "@/lib/api-server";
import { SESSION_COOKIE } from "@/lib/session";
import { NotificationBufferTable } from "@/components/admin/configuracoes/organisms/notification-buffer-table";
import type { NotificationBufferListResponse } from "@/lib/types/notifications";
import { listNotificationBuffer } from "../actions";

export default async function ConfiguracoesBufferPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const me = await fetchMe(token);
  if (!me || me.role !== "admin") {
    redirect("/admin/home");
  }

  let bufferData: NotificationBufferListResponse | null = null;
  let bufferError: string | null = null;
  try {
    bufferData = await fetchNotificationBuffer(token, { limit: 20 });
  } catch {
    bufferError = "Não foi possível carregar o buffer de notificações.";
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h1 className="mb-2 text-xl font-semibold text-[#2C2C2E] md:text-2xl">
          Buffer de Notificações
        </h1>
        <p className="text-sm text-[#6B6B6E] md:text-base">
          Auditoria das notificações: envios bem-sucedidos, pendentes e
          descartados.
        </p>
      </div>

      <section
        aria-labelledby="buffer-heading"
        className="rounded-xl border border-gray-100 bg-white shadow-sm"
      >
        <div className="px-4 pt-4 md:px-6 md:pt-6">
          <h2
            id="buffer-heading"
            className="mb-1 text-lg font-semibold text-[#2C2C2E]"
          >
            Histórico
          </h2>
          <p className="text-sm text-[#6B6B6E]">
            Use os filtros para auditar o status dos envios mais recentes.
          </p>
        </div>
        <NotificationBufferTable
          initialData={bufferData}
          initialError={bufferError}
          listAction={listNotificationBuffer}
        />
      </section>
    </div>
  );
}
