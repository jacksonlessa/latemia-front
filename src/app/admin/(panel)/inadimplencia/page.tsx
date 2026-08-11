import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  fetchMe,
  fetchDelinquencyTemplates,
  fetchDelinquentClients,
} from "@/lib/api-server";
import { SESSION_COOKIE } from "@/lib/session";
import { DelinquentClientsList } from "@/components/admin/inadimplencia/organisms/delinquent-clients-list";
import type {
  DelinquencyTemplateDto,
  DelinquentClientDto,
} from "@/lib/types/delinquency";

export default async function InadimplenciaPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const me = await fetchMe(token);
  if (!me || (me.role !== "admin" && me.role !== "atendente")) {
    redirect("/admin/home");
  }

  let clients: DelinquentClientDto[] = [];
  let templates: DelinquencyTemplateDto[] = [];
  let fetchError: string | null = null;

  try {
    const [clientsResponse, templatesResponse] = await Promise.all([
      fetchDelinquentClients(token, { sort: "daysOverdue:desc" }),
      fetchDelinquencyTemplates(token),
    ]);
    clients = clientsResponse.data;
    templates = templatesResponse;
  } catch {
    fetchError = "Não foi possível carregar a listagem de inadimplência.";
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h1 className="mb-2 text-xl font-semibold text-[#2C2C2E] md:text-2xl">
          Inadimplência
        </h1>
        <p className="text-sm text-[#6B6B6E] md:text-base">
          Clientes com plano em atraso, dias de atraso e a mensagem do fluxo
          de cobrança pendente de envio para cada um.
        </p>
      </div>

      <section aria-labelledby="delinquent-clients-heading" className="space-y-4">
        <h2 id="delinquent-clients-heading" className="sr-only">
          Clientes inadimplentes
        </h2>
        <DelinquentClientsList
          initialClients={clients}
          templates={templates}
          initialSort="daysOverdue:desc"
          fetchError={fetchError}
        />
      </section>
    </div>
  );
}
