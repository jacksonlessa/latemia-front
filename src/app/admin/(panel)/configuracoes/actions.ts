"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  fetchNotificationBuffer,
  fetchNotificationEvents,
  fetchQuietHours,
  patchNotificationEvent,
  putQuietHours,
  updateSystemSettings,
} from "@/lib/api-server";
import { SESSION_COOKIE } from "@/lib/session";
import type { UpdateSystemSettingsInput, SystemSettingsDto } from "@/lib/types/system-settings";
import type {
  ListNotificationBufferQuery,
  NotificationBufferListResponse,
  NotificationEventConfigDto,
  NotificationEventType,
  QuietHoursDto,
} from "@/lib/types/notifications";

type SaveResult =
  | { success: true; data: SystemSettingsDto }
  | { success: false; error: { code: string; message: string } };

export async function saveSystemSettings(
  payload: UpdateSystemSettingsInput,
): Promise<SaveResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Sessão expirada. Faça login novamente." },
    };
  }

  try {
    const data = await updateSystemSettings(token, payload);
    revalidatePath("/admin/configuracoes");
    return { success: true, data };
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && "message" in err) {
      return {
        success: false,
        error: {
          code: (err as { code: string }).code,
          message: (err as { message: string }).message,
        },
      };
    }
    return {
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: "Erro inesperado ao salvar as configurações.",
      },
    };
  }
}

// ---------------------------------------------------------------------------
// Notifications — admin actions
// ---------------------------------------------------------------------------

type ActionError = { code: string; message: string };

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ActionError };

type TokenResult =
  | { ok: true; token: string }
  | { ok: false; error: ActionError };

async function getTokenOrFail(): Promise<TokenResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return {
      ok: false,
      error: { code: "UNAUTHORIZED", message: "Sessão expirada. Faça login novamente." },
    };
  }
  return { ok: true, token };
}

function toActionError(err: unknown, fallback: string): ActionError {
  if (err && typeof err === "object" && "code" in err && "message" in err) {
    return {
      code: (err as { code: string }).code,
      message: (err as { message: string }).message,
    };
  }
  return { code: "UNKNOWN_ERROR", message: fallback };
}

export async function getNotificationEventsConfig(): Promise<
  ActionResult<NotificationEventConfigDto[]>
> {
  const auth = await getTokenOrFail();
  if (!auth.ok) return { success: false, error: auth.error };
  try {
    const data = await fetchNotificationEvents(auth.token);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: toActionError(err, "Erro ao carregar eventos de notificação."),
    };
  }
}

export async function updateNotificationEventConfig(
  type: NotificationEventType,
  enabled: boolean,
): Promise<ActionResult<NotificationEventConfigDto>> {
  const auth = await getTokenOrFail();
  if (!auth.ok) return { success: false, error: auth.error };
  try {
    const data = await patchNotificationEvent(auth.token, type, enabled);
    revalidatePath("/admin/configuracoes");
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: toActionError(err, "Erro ao atualizar evento de notificação."),
    };
  }
}

export async function getQuietHours(): Promise<ActionResult<QuietHoursDto>> {
  const auth = await getTokenOrFail();
  if (!auth.ok) return { success: false, error: auth.error };
  try {
    const data = await fetchQuietHours(auth.token);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: toActionError(err, "Erro ao carregar a janela de silêncio."),
    };
  }
}

export async function updateQuietHours(
  payload: QuietHoursDto,
): Promise<ActionResult<QuietHoursDto>> {
  const auth = await getTokenOrFail();
  if (!auth.ok) return { success: false, error: auth.error };
  try {
    const data = await putQuietHours(auth.token, payload);
    revalidatePath("/admin/configuracoes");
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: toActionError(err, "Erro ao salvar a janela de silêncio."),
    };
  }
}

export async function listNotificationBuffer(
  query: ListNotificationBufferQuery = {},
): Promise<ActionResult<NotificationBufferListResponse>> {
  const auth = await getTokenOrFail();
  if (!auth.ok) return { success: false, error: auth.error };
  try {
    const data = await fetchNotificationBuffer(auth.token, query);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: toActionError(err, "Erro ao carregar buffer de notificações."),
    };
  }
}
