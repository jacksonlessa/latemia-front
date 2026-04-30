import { AlertTriangle, Clock, DollarSign, AlertCircle } from "lucide-react";
import { MockDataBanner } from "./MockDataBanner";

interface Alert {
  id: string;
  type: "inadimplencia" | "carencia" | "pagamento" | "divergencia";
  message: string;
  details: string;
}

const mockAlerts: Alert[] = [
  { id: "1", type: "inadimplencia", message: "Rex", details: "pagamento em atraso há 3 dias" },
  { id: "2", type: "carencia", message: "Luna", details: "carência termina em 22 dias" },
  { id: "3", type: "pagamento", message: "Tutor João", details: "fatura de R$180 em aberto" },
  { id: "4", type: "divergencia", message: "Bolt", details: "webhook pendente de processamento" },
  { id: "5", type: "inadimplencia", message: "Mel", details: "pagamento em atraso há 5 dias" },
];

function AlertIcon({ type }: { type: Alert["type"] }) {
  const iconClass = "h-5 w-5 flex-shrink-0";

  switch (type) {
    case "inadimplencia":
      return <AlertTriangle className={`${iconClass} text-[#C94040]`} />;
    case "carencia":
      return <Clock className={`${iconClass} text-[#D97706]`} />;
    case "pagamento":
      return <DollarSign className={`${iconClass} text-[#D97706]`} />;
    case "divergencia":
      return <AlertCircle className={`${iconClass} text-[#D97706]`} />;
  }
}

interface AlertsPanelProps {
  /**
   * Override opcional para permitir variantes (ex.: estado vazio em Storybook).
   * Quando omitido, usa `mockAlerts` interno.
   */
  alerts?: Alert[];
}

export function AlertsPanel({ alerts = mockAlerts }: AlertsPanelProps = {}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
      <MockDataBanner />
      <h3 className="mb-4 text-base font-semibold text-[#2C2C2E] md:text-lg">
        Alertas e pendências
      </h3>
      {alerts.length === 0 ? (
        <p className="text-sm text-[#6B6B6E]">Nenhum alerta no momento.</p>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
            >
              <AlertIcon type={alert.type} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#2C2C2E]">{alert.message}</p>
                <p className="mt-0.5 text-xs text-[#6B6B6E]">{alert.details}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
