'use client';

import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlanStatusBadge } from '@/components/admin/planos/atoms/plan-status-badge/PlanStatusBadge';
import type { PlanStatus } from '@/lib/types/plan';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FrictionStatus = Extract<PlanStatus, 'carencia' | 'inadimplente'>;

interface FrictionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: FrictionStatus;
  onConfirm: () => void;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const statusConfig: Record<
  FrictionStatus,
  { title: string; description: string }
> = {
  carencia: {
    title: 'Plano em carência',
    description:
      'O plano deste pet ainda está em período de carência. O benefício pode estar sujeito a restrições conforme as regras do contrato. Deseja registrar o uso mesmo assim?',
  },
  inadimplente: {
    title: 'Plano inadimplente',
    description:
      'O plano deste pet está com pagamento em atraso. Verifique a situação financeira antes de prosseguir com o atendimento. Deseja registrar o uso mesmo assim?',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * FrictionConfirmDialog — Dialog de confirmação com friction design.
 *
 * Displayed before registering a benefit usage when the plan status is
 * `carencia` or `inadimplente`. Does not block the action — it alerts
 * the attendant and lets them proceed or cancel.
 */
export function FrictionConfirmDialog({
  open,
  onOpenChange,
  status,
  onConfirm,
}: FrictionConfirmDialogProps) {
  const config = statusConfig[status];

  function handleConfirm() {
    onOpenChange(false);
    onConfirm();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        aria-describedby="friction-dialog-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle
              className="size-5 text-amber-500 shrink-0"
              aria-hidden="true"
            />
            <DialogTitle>{config.title}</DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status atual:</span>
            <PlanStatusBadge status={status} />
          </div>
        </DialogHeader>

        <DialogDescription id="friction-dialog-description" className="text-sm leading-relaxed">
          {config.description}
        </DialogDescription>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-[#4E8C75] text-white hover:bg-[#4E8C75]/90"
          >
            Registrar mesmo assim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
