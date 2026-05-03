import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  fetchMe,
  fetchNotificationEvents,
  fetchQuietHours,
} from "@/lib/api-server";
import { SESSION_COOKIE } from "@/lib/session";
import { NotificationEventsList } from "@/components/admin/configuracoes/organisms/notification-events-list";
import { QuietHoursForm } from "@/components/admin/configuracoes/molecules/quiet-hours-form";
import type {
  NotificationEventConfigDto,
  QuietHoursDto,
} from "@/lib/types/notifications";
import {
  updateNotificationEventConfig,
  updateQuietHours,
} from "../actions";

export default async function ConfiguracoesNotificacoesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const me = await fetchMe(token);
  if (!me || me.role !== "admin") {
    redirect("/admin/home");
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

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h1 className="mb-2 text-xl font-semibold text-[#2C2C2E] md:text-2xl">
          Notificações
        </h1>
        <p className="text-sm text-[#6B6B6E] md:text-base">
          Eventos de domínio que disparam notificações no Telegram e a janela de
          silêncio aplicada aos envios.
        </p>
      </div>

      <section
        aria-labelledby="notif-events-heading"
        className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6"
      >
        <h2
          id="notif-events-heading"
          className="mb-1 text-lg font-semibold text-[#2C2C2E]"
        >
          Eventos
        </h2>
        <p className="mb-4 text-sm text-[#6B6B6E]">
          Ative ou desative os eventos de domínio que disparam notificações.
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
            Janela de Silêncio
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
    </div>
  );
}
