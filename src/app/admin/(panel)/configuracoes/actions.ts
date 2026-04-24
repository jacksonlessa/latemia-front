"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { updateSystemSettings } from "@/lib/api-server";
import { SESSION_COOKIE } from "@/lib/session";
import type { UpdateSystemSettingsInput, SystemSettingsDto } from "@/lib/types/system-settings";

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
