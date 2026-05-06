import { Clock } from "lucide-react";
import { MockDataBanner } from "./MockDataBanner";

interface Usage {
  id: string;
  pet: string;
  tutor: string;
  date: string;
  time: string;
  discount: string;
}

const mockUsages: Usage[] = [
  { id: "1", pet: "Rex", tutor: "João Silva", date: "16/04/2026", time: "14:30", discount: "R$ 250,00" },
  { id: "2", pet: "Luna", tutor: "Maria Santos", date: "16/04/2026", time: "11:15", discount: "R$ 180,00" },
  { id: "3", pet: "Bolt", tutor: "Carlos Souza", date: "15/04/2026", time: "16:45", discount: "R$ 320,00" },
  { id: "4", pet: "Mel", tutor: "Ana Paula", date: "15/04/2026", time: "09:20", discount: "R$ 150,00" },
  { id: "5", pet: "Thor", tutor: "Pedro Lima", date: "14/04/2026", time: "13:50", discount: "R$ 200,00" },
  { id: "6", pet: "Nina", tutor: "Juliana Costa", date: "14/04/2026", time: "10:30", discount: "R$ 175,00" },
];

interface RecentUsageProps {
  /**
   * Override opcional para permitir variantes (ex.: estado vazio em Storybook).
   * Quando omitido, usa `mockUsages` interno.
   */
  usages?: Usage[];
}

export function RecentUsage({ usages = mockUsages }: RecentUsageProps = {}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
      <MockDataBanner />
      <h3 className="mb-4 text-base font-semibold text-[#2C2C2E] md:text-lg">
        Últimos usos do benefício
      </h3>
      {usages.length === 0 ? (
        <p className="text-sm text-[#6B6B6E]">
          Nenhum uso registrado recentemente.
        </p>
      ) : (
        <div className="space-y-3">
          {usages.map((usage) => (
            <div
              key={usage.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#EAF4F0]">
                <Clock className="h-5 w-5 text-[#4E8C75]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#2C2C2E]">{usage.pet}</p>
                  <span className="text-sm font-semibold text-[#4E8C75]">
                    {usage.discount}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[#6B6B6E]">
                  {usage.tutor} • {usage.date} às {usage.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
