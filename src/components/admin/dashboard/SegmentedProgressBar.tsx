"use client";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface SegmentedProgressBarProps {
  ativos: number;
  carencia: number;
  inadimplentes: number;
  total: number;
}

export function SegmentedProgressBar({ ativos, carencia, inadimplentes, total }: SegmentedProgressBarProps) {
  const safe = total > 0 ? total : 1;
  const pctAtivos = Math.max(0, Math.min(100, Math.round((ativos / safe) * 100)));
  const pctCarencia = Math.max(0, Math.min(100, Math.round((carencia / safe) * 100)));
  const pctInadimplentes = Math.max(0, Math.min(100, Math.round((inadimplentes / safe) * 100)));

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          role="img"
          aria-label={`${ativos} ativos, ${carencia} carência, ${inadimplentes} inadimplentes`}
          className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100 cursor-help"
        >
          <div className="h-2 bg-[#4E8C75] transition-all duration-300" style={{ width: `${pctAtivos}%` }} />
          <div className="h-2 bg-[#D97706] transition-all duration-300" style={{ width: `${pctCarencia}%` }} />
          <div className="h-2 bg-[#C94040] transition-all duration-300" style={{ width: `${pctInadimplentes}%` }} />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {ativos} ativos · {carencia} carência · {inadimplentes} inadimplentes
      </TooltipContent>
    </Tooltip>
  );
}
