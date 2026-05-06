import { AlertTriangle } from 'lucide-react';
import type { PlanStatus } from '@/lib/types/plan';

interface TerminalStateBannerProps {
  status: PlanStatus;
}

const TERMINAL_REASONS: Partial<Record<PlanStatus, string>> = {
  cancelado: 'assinatura cancelada na operadora.',
  estornado: 'cobrança estornada integralmente (refund total).',
  contestado: 'cobrança contestada pelo titular do cartão (chargeback).',
};

const TERMINAL_LABELS: Partial<Record<PlanStatus, string>> = {
  cancelado: 'Cancelado',
  estornado: 'Estornado',
  contestado: 'Contestado',
};

/**
 * TerminalStateBanner — Molecule
 *
 * Visual highlight shown at the top of /admin/planos/[id] when the Plan
 * landed in a terminal status. It carries the human-readable reason for
 * the state so the operator does not need to decode the enum.
 */
export function TerminalStateBanner({ status }: TerminalStateBannerProps) {
  const label = TERMINAL_LABELS[status];
  const reason = TERMINAL_REASONS[status];

  if (!label || !reason) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <div>
        <p className="font-semibold">Plano encerrado: {label}</p>
        <p className="mt-1 text-red-700">
          Motivo: {reason} Este estado é definitivo — nenhum evento posterior
          reativa o plano.
        </p>
      </div>
    </div>
  );
}
