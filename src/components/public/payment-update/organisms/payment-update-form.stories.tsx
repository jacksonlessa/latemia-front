/**
 * Storybook stories for the validation/form screen of /atualizar-pagamento.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 *
 * The orchestrator (`AtualizarPagamentoClient`) renders this layout when the
 * token validates successfully. Three subtitle variants exist, one per
 * `chargesBehavior` value returned by the backend on `GET /v1/payment-update/:token`:
 *   - next_cycle     — `ativo`/`carencia`
 *   - first_charge   — `pendente`
 *   - overdue_charge — `inadimplente`
 *
 * A fourth story (`ChargeFailedInline`) renders the same layout with the
 * inline error banner that appears when the consume returns
 * `outcome: 'charge_failed'` — the form stays active for a new attempt and
 * the token is NOT invalidated.
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
          'Tela de validação inicial de `/atualizar-pagamento`: card de contexto do plano ' +
          '(petName, planStatus e subtítulo derivado de `chargesBehavior`) seguido pelo ' +
          'PaymentCardForm. A variante `ChargeFailedInline` mostra o banner inline exibido ' +
          'quando o backend retorna `outcome: charge_failed` — formulário permanece ativo ' +
          'e o token continua válido para nova tentativa.',
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Local copies of subtitle/label tables — kept aligned with the orchestrator
// to render the stories in isolation without a router/navigation dep.
// ---------------------------------------------------------------------------

const STATUS_LABEL: Record<string, string> = {
  inadimplente: 'Inadimplente',
  ativo: 'Ativo',
  carencia: 'Em carência',
  pendente: 'Pendente',
};

const BEHAVIOR_SUBTITLES: Record<ChargesBehavior, string> = {
  next_cycle:
    'O novo cartão será usado na próxima cobrança do seu plano.',
  first_charge:
    'A primeira cobrança será processada agora com o novo cartão.',
  overdue_charge:
    'A cobrança em atraso será processada agora com o novo cartão.',
};

interface PreviewProps {
  petName: string;
  planStatus: string;
  chargesBehavior: ChargesBehavior;
  errorMessage?: string;
  disabled?: boolean;
}

function PaymentUpdateFormPreview({
  petName,
  planStatus,
  chargesBehavior,
  errorMessage,
  disabled = false,
}: PreviewProps) {
  return (
    <div className="space-y-6 max-w-lg">
      <div className="rounded-lg border border-border bg-white p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Plano do pet
        </p>
        <div className="flex items-center justify-between">
          <span className="font-medium text-foreground">{petName}</span>
          <span className="text-sm text-muted-foreground">
            {STATUS_LABEL[planStatus] ?? planStatus}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {BEHAVIOR_SUBTITLES[chargesBehavior]}
        </p>
      </div>

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
// Stories — one per chargesBehavior + one for the failed-charge inline state
// ---------------------------------------------------------------------------

/** Plano ativo/carência — próximo ciclo */
export const NextCycle: Story = {
  name: 'chargesBehavior: next_cycle (ativo/carência)',
  render: () => (
    <PaymentUpdateFormPreview
      petName="Rex"
      planStatus="ativo"
      chargesBehavior="next_cycle"
    />
  ),
};

/** Plano pendente — primeira cobrança agora */
export const FirstCharge: Story = {
  name: 'chargesBehavior: first_charge (pendente)',
  render: () => (
    <PaymentUpdateFormPreview
      petName="Mia"
      planStatus="pendente"
      chargesBehavior="first_charge"
    />
  ),
};

/** Plano inadimplente — cobrança em atraso agora */
export const OverdueCharge: Story = {
  name: 'chargesBehavior: overdue_charge (inadimplente)',
  render: () => (
    <PaymentUpdateFormPreview
      petName="Thor"
      planStatus="inadimplente"
      chargesBehavior="overdue_charge"
    />
  ),
};

/** outcome: charge_failed — banner inline e formulário ativo (token vivo) */
export const ChargeFailedInline: Story = {
  name: 'outcome: charge_failed (inline retry)',
  render: () => (
    <PaymentUpdateFormPreview
      petName="Thor"
      planStatus="inadimplente"
      chargesBehavior="overdue_charge"
      errorMessage="Cartão recusado. Tente outro cartão."
    />
  ),
};
