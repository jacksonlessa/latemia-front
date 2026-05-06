import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { fetchMe, fetchClientDetail } from "@/lib/api-server";
import { SESSION_COOKIE } from "@/lib/session";
import { ApiError } from "@/lib/api-errors";
import { listPlansUseCase } from "@/domain/plan/list-plans.use-case";
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

  return <ClientDetailTemplate client={client} plans={plans} />;
}
