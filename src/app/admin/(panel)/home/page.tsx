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

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const user = await fetchMe(token);
  if (!user) {
    redirect("/admin/login");
  }

  try {
    const [kpis, statusChart, plansInitial] = await Promise.all([
      fetchKpis(token),
      fetchStatusChart(token),
      fetchInitialPlans(token, { page: 1, perPage: 20 }),
    ]);

    return (
      <DashboardHomeClient
        kpis={kpis}
        statusChart={statusChart}
        plansInitial={plansInitial}
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
