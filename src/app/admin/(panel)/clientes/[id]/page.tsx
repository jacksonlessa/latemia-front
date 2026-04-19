import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { fetchMe, fetchClientDetail } from "@/lib/api-server";
import { SESSION_COOKIE } from "@/lib/session";
import { ClientPetsList } from "@/components/admin/clientes/organisms/client-pets-list";
import { ApiError } from "@/lib/api-errors";
import { listPlansUseCase } from "@/domain/plan/list-plans.use-case";
import { PlanStatusBadge } from "@/components/admin/planos/atoms/plan-status-badge/PlanStatusBadge";

interface PageProps {
  params: Promise<{ id: string }>;
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
});

function formatDate(iso: string): string {
  try {
    return dateFormatter.format(new Date(iso));
  } catch {
    return "—";
  }
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export default async function ClienteDetailPage({ params }: PageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const me = await fetchMe(token);
  if (!me) {
    redirect("/admin/login");
  }

  const { id } = await params;

  let client;
  try {
    client = await fetchClientDetail(id, token);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  const plansResponse = await listPlansUseCase({
    clientId: id,
    perPage: 100,
    token,
  });

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/admin/clientes"
          className="inline-flex items-center gap-1 text-sm text-[#4E8C75] hover:opacity-80"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para Clientes
        </Link>
      </div>

      {/* Client info header */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h1 className="mb-4 text-xl font-semibold text-[#2C2C2E] md:text-2xl">
          {client.name}
        </h1>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[#6B6B6E]">
              CPF
            </dt>
            <dd className="mt-1 font-mono text-sm text-[#2C2C2E]">
              {client.cpf}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[#6B6B6E]">
              Telefone
            </dt>
            <dd className="mt-1 text-sm text-[#2C2C2E]">
              {formatPhone(client.phone)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[#6B6B6E]">
              E-mail
            </dt>
            <dd className="mt-1 text-sm text-[#2C2C2E]">{client.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[#6B6B6E]">
              Cadastrado em
            </dt>
            <dd className="mt-1 text-sm text-[#2C2C2E]">
              {formatDate(client.createdAt)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Addresses */}
      {client.addresses.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
          <h2 className="mb-4 text-base font-semibold text-[#2C2C2E]">
            Endereço{client.addresses.length > 1 ? "s" : ""}
          </h2>
          <ul className="space-y-3">
            {client.addresses.map((addr) => (
              <li key={addr.id} className="text-sm text-[#2C2C2E]">
                {addr.street}, {addr.number}
                {addr.complement ? ` — ${addr.complement}` : ""} &mdash;{" "}
                {addr.city}/{addr.state} — CEP {addr.cep}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pets */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h2 className="mb-4 text-base font-semibold text-[#2C2C2E]">
          Pets ({client.pets.length})
        </h2>
        <ClientPetsList pets={client.pets} />
      </div>

      {/* Planos */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h2 className="mb-4 text-base font-semibold text-[#2C2C2E]">
          Planos ({plansResponse.data.length})
        </h2>
        {plansResponse.data.length === 0 ? (
          <p className="text-sm text-[#6B6B6E]">Nenhum plano cadastrado.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {plansResponse.data.map((plan) => (
              <li key={plan.id} className="py-3 first:pt-0 last:pb-0">
                <Link
                  href={`/admin/planos/${plan.id}`}
                  className="flex items-center justify-between gap-4 hover:opacity-80"
                  aria-label={`Ver detalhe do plano de ${plan.petName}`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#2C2C2E]">
                      {plan.petName}
                    </p>
                    <p className="text-xs text-[#6B6B6E]">
                      {formatDate(plan.createdAt)}
                    </p>
                  </div>
                  <PlanStatusBadge status={plan.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
