import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchMe, fetchSystemSettings } from "@/lib/api-server";
import { SESSION_COOKIE } from "@/lib/session";
import { SettingsForm } from "@/components/admin/configuracoes/organisms/settings-form";
import type { SystemSettingsDto } from "@/lib/types/system-settings";
import { saveSystemSettings } from "./actions";

export default async function ConfiguracoesGeraisPage() {
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

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h1 className="mb-2 text-xl font-semibold text-[#2C2C2E] md:text-2xl">
          Configurações — Gerais
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
    </div>
  );
}
