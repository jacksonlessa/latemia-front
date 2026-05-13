'use client';

import { CONTRATO_TEXTO } from '@/content/contrato';
import { Button } from '@/components/ui/button';

export interface StepContratoProps {
  accepted: boolean;
  onAcceptedChange: (value: boolean) => void;
  onNext: () => void;
  onBack: () => void;
  /**
   * When `true`, the contract acceptance step will require an OTP verification
   * flow before allowing the user to advance to payment (overlay rendered by
   * Task 10.0). Defaults to `false` to preserve the current funnel behaviour
   * until the backend flag is enabled. This prop is intentionally declared and
   * propagated in Task 9.0 but not yet consumed — Task 10.0 implements the
   * overlay flow.
   */
  otpEnabled?: boolean;
}

export function StepContrato({
  accepted,
  onAcceptedChange,
  onNext,
  onBack,
  otpEnabled: _otpEnabled = false,
}: StepContratoProps) {
  // `otpEnabled` is declared and propagated by Task 9.0 — the OTP overlay
  // implementation lands in Task 10.0. Renaming to `_otpEnabled` documents the
  // deliberate non-use without triggering the unused-variable lint rule.
  void _otpEnabled;
  const checkboxId = 'contrato-aceite';

  return (
    <div className="space-y-6">
      {/* Contract text with fixed-height scrollable area */}
      <div
        className="rounded-lg border border-border bg-muted/30 p-4 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground"
        style={{ height: '200px' }}
        role="region"
        aria-label="Texto do contrato"
        tabIndex={0}
      >
        {CONTRATO_TEXTO}
      </div>

      {/* Acceptance checkbox */}
      <div className="flex items-start gap-3">
        <input
          id={checkboxId}
          type="checkbox"
          checked={accepted}
          onChange={(e) => onAcceptedChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 cursor-pointer rounded border-border accent-[#4E8C75]"
        />
        <label
          htmlFor={checkboxId}
          className="text-sm leading-snug cursor-pointer select-none"
        >
          Li e concordo com todos os termos e condições do Contrato de Prestação de Serviços do
          Plano Emergência Veterinária.
        </label>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Voltar
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={!accepted}
          className="flex-1 bg-[#4E8C75] hover:bg-[#3d7260] text-white"
        >
          Avançar
        </Button>
      </div>
    </div>
  );
}
