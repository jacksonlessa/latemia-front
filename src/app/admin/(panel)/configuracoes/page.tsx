import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  fetchMe,
  fetchNotificationBuffer,
  fetchNotificationEvents,
  fetchQuietHours,
  fetchSystemSettings,
} from "@/lib/api-server";
import { SESSION_COOKIE } from "@/lib/session";
import { SettingsForm } from "@/components/admin/configuracoes/organisms/settings-form";
import { NotificationEventsList } from "@/components/admin/configuracoes/organisms/notification-events-list";
import { QuietHoursForm } from "@/components/admin/configuracoes/molecules/quiet-hours-form";
import { NotificationBufferTable } from "@/components/admin/configuracoes/organisms/notification-buffer-table";
import type { SystemSettingsDto } from "@/lib/types/system-settings";
import type {
  NotificationBufferListResponse,
  NotificationEventConfigDto,
  QuietHoursDto,
} from "@/lib/types/notifications";
import {
  listNotificationBuffer,
  saveSystemSettings,
  updateNotificationEventConfig,
  updateQuietHours,
} from "./actions";

export default async function ConfiguracoesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const me = await fetchMe(token);
  if (!me || me.role !== "admin") {
    redirect("/admin/home");
  }

  let initialValues: SystemSettingsDto | null = null;
  let fetchError: string | null = null;

  try {
    initialValues = await fetchSystemSettings(token);
  } catch {
    fetchError = "Não foi possível carregar as configurações do sistema.";
  }

  let events: NotificationEventConfigDto[] = [];
  let eventsError: string | null = null;
  try {
    events = await fetchNotificationEvents(token);
  } catch {
    eventsError = "Não foi possível carregar os eventos de notificação.";
  }

  let quietHours: QuietHoursDto | null = null;
  let quietHoursError: string | null = null;
  try {
    quietHours = await fetchQuietHours(token);
  } catch {
    quietHoursError = "Não foi possível carregar a janela de silêncio.";
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
          Configurações
        </h1>
        <p className="text-sm text-[#6B6B6E] md:text-base">
          Configurações globais do sistema
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <SettingsForm
          initialValues={initialValues}
          saveAction={saveSystemSettings}
          fetchError={fetchError}
        />
      </div>

      <section
        aria-labelledby="notif-events-heading"
        className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6"
      >
        <h2
          id="notif-events-heading"
          className="mb-1 text-lg font-semibold text-[#2C2C2E]"
        >
          Notificações — Eventos
        </h2>
        <p className="mb-4 text-sm text-[#6B6B6E]">
          Ative ou desative os eventos de domínio que disparam notificações no
          Telegram.
        </p>
        <NotificationEventsList
          events={events}
          fetchError={eventsError}
          toggleAction={updateNotificationEventConfig}
        />
      </section>

      <section
        aria-labelledby="quiet-hours-heading"
        className="rounded-xl border border-gray-100 bg-white shadow-sm"
      >
        <div className="px-4 pt-4 md:px-6 md:pt-6">
          <h2
            id="quiet-hours-heading"
            className="mb-1 text-lg font-semibold text-[#2C2C2E]"
          >
            Notificações — Janela de Silêncio
          </h2>
          <p className="text-sm text-[#6B6B6E]">
            Mensagens disparadas durante a janela ficam pendentes no buffer e
            são enviadas em resumo ao final.
          </p>
        </div>
        <QuietHoursForm
          initialValues={quietHours}
          saveAction={updateQuietHours}
          fetchError={quietHoursError}
        />
      </section>

      <section
        aria-labelledby="buffer-heading"
        className="rounded-xl border border-gray-100 bg-white shadow-sm"
      >
        <div className="px-4 pt-4 md:px-6 md:pt-6">
          <h2
            id="buffer-heading"
            className="mb-1 text-lg font-semibold text-[#2C2C2E]"
          >
            Notificações — Buffer
          </h2>
          <p className="text-sm text-[#6B6B6E]">
            Auditoria das notificações: envios bem-sucedidos, pendentes e
            descartados.
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
