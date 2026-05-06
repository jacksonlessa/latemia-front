import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchMe } from "@/lib/api-server";
import { SESSION_COOKIE } from "@/lib/session";
import {
  fetchKpis,
  fetchStatusChart,
  fetchInitialPlans,
} from "@/lib/dashboard-api";
import { DashboardErrorState } from "@/components/admin/dashboard/DashboardErrorState";
import { DashboardHomeClient } from "@/components/admin/dashboard/DashboardHomeClient";

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function pickString(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const user = await fetchMe(token);
  if (!user) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const status = pickString(params.status);
  const search = pickString(params.search);
  const plansFilters = { status, search };

  try {
    const [kpis, statusChart, plansInitial] = await Promise.all([
      fetchKpis(token),
      fetchStatusChart(token),
      fetchInitialPlans(token, { page: 1, perPage: 20, status, search }),
    ]);

    return (
      <DashboardHomeClient
        kpis={kpis}
        statusChart={statusChart}
        plansInitial={plansInitial}
        plansFilters={plansFilters}
        role={user.role}
      />
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro inesperado ao carregar o dashboard.";
    return <DashboardErrorState message={message} />;
  }
}
