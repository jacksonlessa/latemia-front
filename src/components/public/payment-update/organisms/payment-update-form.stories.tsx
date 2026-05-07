/**
 * Storybook stories for the validation/form screen of /atualizar-pagamento.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 *
 * Model: 1 client = 1 subscription with N items (pivô subscription consolidada).
 * The form now shows tutorMaskedName + petsCovered[] instead of petName/planStatus.
 *
 * chargesBehavior is aggregated across all client plans:
 *   - `immediate`   — at least one plan is pendente/inadimplente
 *   - `next_cycle`  — all plans are ativo/carencia
 *
 * A `ChargeFailedInline` story renders the same layout with the inline error
 * banner that appears when the consume returns `outcome: 'charge_failed'` —
 * the form stays active for a new attempt and the token is NOT invalidated.
 */

import type React from 'react';
import { PaymentCardForm } from '../molecules/payment-card-form';
import type { ChargesBehavior } from '@/domain/payment-update/types';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'public/payment-update/Organisms/PaymentUpdateForm',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Tela de validação inicial de `/atualizar-pagamento`: card de contexto do tutor ' +
          '(tutorMaskedName + petsCovered[]) seguido pelo PaymentCardForm. ' +
          'O `chargesBehavior` é agregado de todos os planos do cliente: ' +
          '`immediate` se há pelo menos 1 plano em pendente/inadimplente; ' +
          '`next_cycle` se todos estão em ativo/carencia. ' +
          'A variante `ChargeFailedInline` mostra o banner inline exibido ' +
          'quando o backend retorna `outcome: charge_failed` — formulário permanece ativo ' +
          'e o token continua válido para nova tentativa.',
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Preview component
// ---------------------------------------------------------------------------

interface PreviewProps {
  tutorMaskedName: string;
  petsCovered: string[];
  chargesBehavior: ChargesBehavior;
  errorMessage?: string;
  disabled?: boolean;
}

function buildPetsCoveredLabel(petsCovered: string[]): string {
  if (petsCovered.length === 1) {
    return `Pet coberto: ${petsCovered[0]}`;
  }
  return `Pets cobertos: ${petsCovered.join(', ')}`;
}

function PaymentUpdateFormPreview({
  tutorMaskedName,
  petsCovered,
  errorMessage,
  disabled = false,
}: PreviewProps) {
  return (
    <div className="space-y-6 max-w-lg">
      <header className="rounded-lg border border-border bg-white p-4 space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Titular do plano
          </p>
          <p className="font-medium text-foreground">{tutorMaskedName}</p>
        </div>

        <section aria-label="Pets cobertos">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            {petsCovered.length === 1 ? 'Pet coberto' : 'Pets cobertos'}
          </p>
          <p className="text-sm text-foreground">
            {buildPetsCoveredLabel(petsCovered)}
          </p>
        </section>
      </header>

      {errorMessage && (
        <div
          className="rounded-lg border border-destructive/40 bg-destructive/5 p-4"
          role="alert"
        >
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )}

      <PaymentCardForm onSuccess={() => {}} disabled={disabled} />

      <p className="text-xs text-muted-foreground text-center">
        Seus dados de cartão são criptografados e processados diretamente pelo
        Pagar.me — nunca passam pelos servidores da Late &amp; Mia.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Story type helper
// ---------------------------------------------------------------------------

type Story = {
  render: () => React.ReactElement;
  name?: string;
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** 1 pet, chargesBehavior=immediate — plano pendente/inadimplente */
export const Default1Pet: Story = {
  name: 'default — 1 pet (immediate)',
  render: () => (
    <PaymentUpdateFormPreview
      tutorMaskedName="J** S***"
      petsCovered={['Rex']}
      chargesBehavior="immediate"
    />
  ),
};

/** 3 pets, chargesBehavior=next_cycle — todos ativos/carência */
export const Default3Pets: Story = {
  name: 'default — 3 pets (next_cycle)',
  render: () => (
    <PaymentUpdateFormPreview
      tutorMaskedName="M**** O****"
      petsCovered={['Luna', 'Thor', 'Mel']}
      chargesBehavior="next_cycle"
    />
  ),
};

/** outcome: charge_failed — banner inline e formulário ativo (token vivo) */
export const ChargeFailedInline: Story = {
  name: 'outcome: charge_failed (inline retry)',
  render: () => (
    <PaymentUpdateFormPreview
      tutorMaskedName="J** S***"
      petsCovered={['Rex', 'Mia']}
      chargesBehavior="immediate"
      errorMessage="Cartão recusado. Tente outro cartão."
    />
  ),
};
