import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { isTerminalPlanStatus, type PlanStatus } from '@/lib/types/plan';

interface PlanStatusBadgeProps {
  status: PlanStatus;
  className?: string;
}

interface StatusConfig {
  label: string;
  className: string;
}

const statusConfig: Record<PlanStatus, StatusConfig> = {
  // Não-terminais
  pendente: {
    label: 'Pendente',
    // âmbar
    className:
      'border-transparent bg-amber-50 text-amber-600 hover:bg-amber-50',
  },
  carencia: {
    label: 'Carência',
    // azul claro
    className:
      'border-transparent bg-sky-50 text-sky-600 hover:bg-sky-50',
  },
  ativo: {
    label: 'Ativo',
    // verde sage da brand
    className:
      'border-transparent bg-[#EAF4F0] text-[#4E8C75] hover:bg-[#EAF4F0]',
  },
  inadimplente: {
    label: 'Inadimplente',
    // vermelho
    className:
      'border-transparent bg-red-50 text-red-600 hover:bg-red-50',
  },
  // Terminais — visual cinza/escuro/preto-roxo
  cancelado: {
    label: 'Cancelado',
    // cinza
    className:
      'border-transparent bg-gray-100 text-[#6B6B6E] hover:bg-gray-100',
  },
  estornado: {
    label: 'Estornado',
    // cinza escuro (texto branco para contraste)
    className:
      'border-transparent bg-slate-700 text-white hover:bg-slate-700',
  },
  contestado: {
    label: 'Contestado',
    // preto/roxo
    className:
      'border-transparent bg-purple-950 text-white hover:bg-purple-950',
  },
};

export function PlanStatusBadge({ status, className }: PlanStatusBadgeProps) {
  const config = statusConfig[status];
  const terminal = isTerminalPlanStatus(status);

  return (
    <Badge
      className={cn(
        'font-medium inline-flex items-center gap-1',
        config.className,
        className,
      )}
      aria-label={
        terminal
          ? `Status: ${config.label} (estado terminal)`
          : `Status: ${config.label}`
      }
    >
      {terminal ? (
        <Lock className="h-3 w-3" aria-hidden="true" data-testid="terminal-icon" />
      ) : null}
      {config.label}
    </Badge>
  );
}
