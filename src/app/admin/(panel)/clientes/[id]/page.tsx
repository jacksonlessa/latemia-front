import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { fetchMe, fetchClientDetail, fetchSystemSettings } from "@/lib/api-server";
import { SESSION_COOKIE } from "@/lib/session";
import { ApiError } from "@/lib/api-errors";
import { listPlansUseCase } from "@/domain/plan/list-plans.use-case";
import { getPublicConfigSSR } from "@/domain/public-config/get-public-config.server";
import { ClientDetailTemplate } from "@/components/admin/clientes/templates/client-detail-template";
import type { PlanListItem } from "@/lib/types/plan";

interface PageProps {
  params: Promise<{ id: string }>;
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

  let plans: PlanListItem[] = [];
  try {
    const plansResponse = await listPlansUseCase({
      clientId: id,
      perPage: 100,
      token,
    });
    plans = plansResponse.data;
  } catch {
    // Graceful degradation: render with empty plans list.
    // The PetPlanPanel will show "Nenhum plano encontrado" per pet.
  }

  // Public, unauthenticated source for the per-pet price — used by
  // `AddPetToClientDialog` to compute the local financial preview. Never
  // rejects (fail-safe fallback), same source consumed by `/contratar`.
  const { pricePerPetCents } = await getPublicConfigSSR();

  // Additional-pet contract text (`pet_addition_contract_text`). Fetched
  // via `GET /v1/settings`, which is admin-only on the backend — for an
  // `atendente` actor this call 403s and we gracefully degrade to the
  // dialog's built-in placeholder text (see `AddPetToClientDialog`'s
  // `DEFAULT_CONTRACT_TEXT`) instead of blocking the whole page.
  let petAdditionContractText = "";
  try {
    const settings = await fetchSystemSettings(token);
    petAdditionContractText = settings.pet_addition_contract_text ?? "";
  } catch {
    // Fail-safe: dialog falls back to its default placeholder text.
  }

  return (
    <ClientDetailTemplate
      client={client}
      plans={plans}
      pricePerPetCents={pricePerPetCents}
      petAdditionContractText={petAdditionContractText}
    />
  );
}
