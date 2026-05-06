import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { fetchMe } from "@/lib/api-server";
import { SESSION_COOKIE } from "@/lib/session";
import {
  fetchPetDetailUseCase,
  FetchPetDetailError,
} from "@/domain/pet/fetch-pet-detail.use-case";
import { listPlansUseCase } from "@/domain/plan/list-plans.use-case";
import type { PlanListResponse } from "@/lib/types/plan";
import type { PetDetail } from "@/lib/types/pet";
import { PetSpeciesBadge } from "@/components/admin/clientes/atoms/pet-species-badge";
import { PlanStatusBadge } from "@/components/admin/planos/atoms/plan-status-badge/PlanStatusBadge";

interface PageProps {
  params: Promise<{ id: string; petId: string }>;
}

const longDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
});

function formatLongDate(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return longDateFormatter.format(new Date(iso));
  } catch {
    return "—";
  }
}

function formatDateTime(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return dateTimeFormatter.format(new Date(iso));
  } catch {
    return "—";
  }
}

function formatWeight(weight: number): string {
  return `${weight.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} kg`;
}

function formatSex(sex: PetDetail["sex"]): string {
  return sex === "male" ? "Macho" : "Fêmea";
}

function formatYesNo(value: boolean): string {
  return value ? "Sim" : "Não";
}

export default async function PetDetailPage({ params }: PageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const me = await fetchMe(token);
  if (!me) {
    redirect("/admin/login");
  }

  const { id: clientId, petId } = await params;

  let pet: PetDetail;
  try {
    pet = await fetchPetDetailUseCase({ clientId, petId, token });
  } catch (err) {
    if (err instanceof FetchPetDetailError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  let plansResponse: PlanListResponse | null = null;
  try {
    plansResponse = await listPlansUseCase({
      petId,
      perPage: 100,
      token,
    });
  } catch {
    // degradação graciosa: a seção Planos exibirá mensagem de indisponibilidade
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <Link
          href={`/admin/clientes/${clientId}`}
          className="inline-flex items-center gap-1 text-sm text-[#4E8C75] hover:opacity-80"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para Cliente
        </Link>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-[#2C2C2E] md:text-2xl">
            {pet.name}
          </h1>
          <PetSpeciesBadge species={pet.species} />
        </div>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[#6B6B6E]">
              Espécie
            </dt>
            <dd className="mt-1 text-sm text-[#2C2C2E]">
              {pet.species === "canino" ? "Canino" : "Felino"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[#6B6B6E]">
              Raça
            </dt>
            <dd className="mt-1 text-sm text-[#2C2C2E]">{pet.breed || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[#6B6B6E]">
              Sexo
            </dt>
            <dd className="mt-1 text-sm text-[#2C2C2E]">
              {formatSex(pet.sex)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[#6B6B6E]">
              Data de nascimento
            </dt>
            <dd className="mt-1 text-sm text-[#2C2C2E]">
              {formatLongDate(pet.birthDate)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[#6B6B6E]">
              Peso
            </dt>
            <dd className="mt-1 text-sm text-[#2C2C2E]">
              {formatWeight(pet.weight)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[#6B6B6E]">
              Castrado
            </dt>
            <dd className="mt-1 text-sm text-[#2C2C2E]">
              {formatYesNo(pet.castrated)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[#6B6B6E]">
              Cadastrado em
            </dt>
            <dd className="mt-1 text-sm text-[#2C2C2E]">
              {formatDateTime(pet.createdAt)}
            </dd>
          </div>
          {pet.updatedAt ? (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-[#6B6B6E]">
                Atualizado em
              </dt>
              <dd className="mt-1 text-sm text-[#2C2C2E]">
                {formatDateTime(pet.updatedAt)}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h2 className="mb-4 text-base font-semibold text-[#2C2C2E]">
          Planos
          {plansResponse !== null ? ` (${plansResponse.data.length})` : ""}
        </h2>
        {plansResponse === null ? (
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar os planos.
          </p>
        ) : plansResponse.data.length === 0 ? (
          <p className="text-sm text-[#6B6B6E]">
            Nenhum plano vinculado a este pet.
          </p>
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
                      {formatDateTime(plan.createdAt)}
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
