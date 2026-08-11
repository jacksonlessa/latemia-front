import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchMe, fetchDelinquencyTemplates } from "@/lib/api-server";
import { SESSION_COOKIE } from "@/lib/session";
import { DelinquencyTemplateEditor } from "@/components/admin/configuracoes/organisms/delinquency-template-editor";
import type { DelinquencyTemplateDto } from "@/lib/types/delinquency";
import { updateDelinquencyTemplate } from "../actions";

export default async function ConfiguracoesMensagensInadimplenciaPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const me = await fetchMe(token);
  if (!me || (me.role !== "admin" && me.role !== "atendente")) {
    redirect("/admin/home");
  }

  let templates: DelinquencyTemplateDto[] = [];
  let fetchError: string | null = null;
  try {
    templates = await fetchDelinquencyTemplates(token);
  } catch {
    fetchError = "Não foi possível carregar os templates de mensagem.";
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h1 className="mb-2 text-xl font-semibold text-[#2C2C2E] md:text-2xl">
          Mensagens de Inadimplência
        </h1>
        <p className="text-sm text-[#6B6B6E] md:text-base">
          Textos usados no fluxo de cobrança manual (1/2/5/10/14 dias de
          atraso). Cada estágio é editado independentemente.
        </p>
      </div>

      <section
        aria-labelledby="delinquency-templates-heading"
        className="space-y-4"
      >
        <h2 id="delinquency-templates-heading" className="sr-only">
          Templates de mensagem
        </h2>
        <DelinquencyTemplateEditor
          templates={templates}
          fetchError={fetchError}
          saveAction={updateDelinquencyTemplate}
        />
      </section>
    </div>
  );
}
