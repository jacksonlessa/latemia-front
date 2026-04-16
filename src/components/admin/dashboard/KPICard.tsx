import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  progress?: number;
}

export function KPICard({ title, value, trend, progress }: KPICardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
      <h3 className="mb-2 text-xs text-[#6B6B6E] md:text-sm">{title}</h3>
      <div className="mb-3 flex items-end justify-between">
        <span className="text-2xl font-semibold text-[#2C2C2E] md:text-3xl">
          {value}
        </span>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm ${
              trend.isPositive ? "text-[#4E8C75]" : "text-[#C94040]"
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      {progress !== undefined && (
        <div className="h-2 w-full rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-[#4E8C75] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
