'use client';

import { CheckoutSummaryItem } from '@/components/public/contratar/molecules/checkout-summary-item';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { CheckoutSummary } from '@/domain/checkout/checkout.types';
import { formatBRL } from '@/lib/currency';

export interface StepPagamentoProps {
  summary: CheckoutSummary;
  onNext: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
  formError?: string;
}

export function StepPagamento({ summary, onNext, onBack, isSubmitting = false, formError }: StepPagamentoProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-display text-2xl text-forest">Resumo do Pedido</h2>
        <p className="text-sm text-muted-foreground">
          Confira o resumo antes de concluir a contratação.
        </p>
      </div>

      {/* Pet list */}
      <div className="rounded-lg border border-border bg-white p-4 space-y-1 divide-y divide-border">
        {summary.pets.map((pet, index) => (
          <CheckoutSummaryItem
            key={`${pet.name}-${index}`}
            petName={pet.name}
            species={pet.species}
            pricePerPetCents={summary.pricePerPetCents}
          />
        ))}
      </div>

      {/* Total */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <Separator className="mb-3" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            Total ({summary.pets.length} {summary.pets.length === 1 ? 'pet' : 'pets'})
          </span>
          <span className="text-base font-bold text-forest tabular-nums">
            {formatBRL(summary.totalCents)}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">por mês</p>
      </div>

      {/* Static payment info message */}
      <div className="rounded-lg border border-[#4E8C75]/30 bg-[#4E8C75]/5 p-4">
        <p className="text-sm text-foreground leading-relaxed">
          Ao clicar em Concluir, sua solicitação será enviada. Em breve entraremos em contato para finalizar o pagamento.
        </p>
      </div>

      {/* Form-level error */}
      {formError && (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1" disabled={isSubmitting}>
          Voltar
        </Button>
        <Button
          type="button"
          onClick={onNext}
          className="flex-1 bg-[#4E8C75] hover:bg-[#3d7260] text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Aguarde...' : 'Concluir'}
        </Button>
      </div>
    </div>
  );
}
