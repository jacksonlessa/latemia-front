'use client';

import { useState, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FormSection } from '@/components/admin/planos-assinatura/molecules/form-section/FormSection';
import { UncoveredOptionsBanner } from '@/components/admin/planos-assinatura/molecules/uncovered-options-banner/UncoveredOptionsBanner';
import { MoneyInput } from '@/components/admin/planos-assinatura/atoms/money-input/MoneyInput';
import { PaymentMethodToggle } from '@/components/admin/planos-assinatura/atoms/payment-method-toggle/PaymentMethodToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Plan, CreatePlanInput, PaymentMethod, BillingInterval } from '@/lib/billing/types';

interface PlanFormProps {
  initialData?: Plan;
  onSubmit: (data: CreatePlanInput) => void;
  isLoading?: boolean;
  errorMessage?: string;
  className?: string;
}

interface FormState {
  name: string;
  description: string;
  interval: BillingInterval;
  intervalCount: string;
  items: Array<{ name: string; quantity: string; price: number }>;
  minimumPrice: number;
  paymentMethods: PaymentMethod[];
  cycles: string;
  paymentAttempts: string;
  negotiable: boolean;
  metadata: Array<{ key: string; value: string }>;
}

function planToFormState(plan?: Plan): FormState {
  if (!plan) {
    return {
      name: '',
      description: '',
      interval: 'month',
      intervalCount: '1',
      items: [{ name: '', quantity: '1', price: 0 }],
      minimumPrice: 0,
      paymentMethods: ['credit_card'],
      cycles: '',
      paymentAttempts: '',
      negotiable: false,
      metadata: [],
    };
  }
  return {
    name: plan.name,
    description: plan.description ?? '',
    interval: plan.interval,
    intervalCount: String(plan.intervalCount),
    items: plan.items.map((item) => ({
      name: item.name,
      quantity: String(item.quantity),
      price: 0, // price not available in list response; user must re-enter on edit
    })),
    minimumPrice: plan.minimumPrice ?? 0,
    paymentMethods: plan.paymentMethods,
    cycles: plan.cycles ? String(plan.cycles) : '',
    paymentAttempts: plan.paymentAttempts ? String(plan.paymentAttempts) : '',
    negotiable: plan.negotiable ?? false,
    metadata: plan.metadata
      ? Object.entries(plan.metadata).map(([key, value]) => ({ key, value }))
      : [],
  };
}

function formStateToInput(state: FormState): CreatePlanInput {
  const items = state.items
    .filter((item) => item.name.trim() !== '')
    .map((item) => ({
      name: item.name.trim(),
      quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
      pricingScheme: {
        schemeType: 'unit' as const,
        price: item.price,
      },
    }));

  const metadata: Record<string, string> | undefined =
    state.metadata.length > 0
      ? Object.fromEntries(
          state.metadata
            .filter((m) => m.key.trim() !== '')
            .map((m) => [m.key.trim(), m.value]),
        )
      : undefined;

  const cyclesValue = parseInt(state.cycles, 10);
  return {
    name: state.name.trim(),
    description: state.description.trim() || undefined,
    interval: state.interval,
    intervalCount: Math.max(1, parseInt(state.intervalCount, 10) || 1),
    currency: 'BRL',
    billingType: 'prepaid',
    paymentMethods: state.paymentMethods,
    items,
    minimumPrice: state.minimumPrice || undefined,
    // cycles 0 or empty = vitalício (no limit) → omit from payload
    cycles: state.cycles && cyclesValue > 0 ? cyclesValue : undefined,
    paymentAttempts: state.paymentAttempts ? parseInt(state.paymentAttempts, 10) : undefined,
    negotiable: state.negotiable || undefined,
    metadata,
  };
}

/**
 * Full plan create/edit form.
 * Structured in 3 collapsible sections: Básico, Precificação, Avançado.
 * No network calls — submit is delegated to the onSubmit prop.
 */
export function PlanForm({ initialData, onSubmit, isLoading = false, errorMessage, className }: PlanFormProps) {
  const [form, setForm] = useState<FormState>(() => planToFormState(initialData));

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  function addItem() {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: '1', price: 0 }],
    }));
  }

  function removeItem(index: number) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  function updateItem(index: number, field: 'name' | 'quantity' | 'price', value: string | number) {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  }

  function addMetadata() {
    setForm((prev) => ({
      ...prev,
      metadata: [...prev.metadata, { key: '', value: '' }],
    }));
  }

  function removeMetadata(index: number) {
    setForm((prev) => ({
      ...prev,
      metadata: prev.metadata.filter((_, i) => i !== index),
    }));
  }

  function updateMetadata(index: number, field: 'key' | 'value', value: string) {
    setForm((prev) => {
      const metadata = [...prev.metadata];
      metadata[index] = { ...metadata[index], [field]: value };
      return { ...prev, metadata };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(formStateToInput(form));
  }

  const isEdit = Boolean(initialData);
  const hasValidItem = form.items.some((item) => item.name.trim() !== '');

  return (
    <form
      onSubmit={handleSubmit}
      aria-label={isEdit ? 'Editar plano de assinatura' : 'Criar plano de assinatura'}
      className={cn('space-y-3', className)}
    >
      {/* Section 1 — Basic */}
      <FormSection title="Básico" description="Nome, descrição e periodicidade" defaultOpen>
        <div className="space-y-4">
          {isEdit && initialData && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-id">ID do plano</Label>
              <div
                id="plan-id"
                className="flex h-10 items-center rounded-md border border-input bg-muted px-3 font-mono text-sm text-muted-foreground select-all"
                aria-readonly="true"
              >
                {initialData.id}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan-name">
              Nome <span aria-hidden="true" className="text-destructive">*</span>
            </Label>
            <Input
              id="plan-name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Ex.: Plano Mensal"
              required
              disabled={isLoading}
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan-description">Descrição</Label>
            <Input
              id="plan-description"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Descrição opcional do plano"
              disabled={isLoading}
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-interval">
                Intervalo <span aria-hidden="true" className="text-destructive">*</span>
              </Label>
              <Select
                value={form.interval}
                onValueChange={(v) => update('interval', v as BillingInterval)}
                disabled={isLoading}
              >
                <SelectTrigger id="plan-interval" aria-label="Intervalo de cobrança">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Dia</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="year">Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-interval-count">
                Quantidade <span aria-hidden="true" className="text-destructive">*</span>
              </Label>
              <Input
                id="plan-interval-count"
                type="number"
                min={1}
                max={365}
                value={form.intervalCount}
                onChange={(e) => update('intervalCount', e.target.value)}
                required
                disabled={isLoading}
                aria-describedby="interval-count-hint"
              />
              <span id="interval-count-hint" className="sr-only">
                Quantos intervalos por ciclo. Ex.: 1 mês, 3 meses, 1 ano.
              </span>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Section 2 — Pricing */}
      <FormSection title="Precificação" description="Itens, valores e métodos de pagamento" defaultOpen>
        <div className="space-y-4">
          {/* Currency — fixed */}
          <div className="flex flex-col gap-1.5">
            <Label>Moeda</Label>
            <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
              BRL — Real Brasileiro
            </div>
          </div>

          {/* Items */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>
                Itens <span aria-hidden="true" className="text-destructive">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                disabled={isLoading}
                aria-label="Adicionar item ao plano"
              >
                <Plus className="h-3 w-3 mr-1" aria-hidden="true" />
                Adicionar item
              </Button>
            </div>

            {form.items.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum item adicionado.</p>
            )}

            <ul className="space-y-2" aria-label="Itens do plano">
              {form.items.map((item, index) => (
                <li
                  key={index}
                  className="grid grid-cols-[1fr_80px_140px_36px] items-end gap-2 rounded-md border border-border p-3"
                >
                  <div className="flex flex-col gap-1">
                    <Label htmlFor={`item-name-${index}`} className="text-xs">
                      Nome do item
                    </Label>
                    <Input
                      id={`item-name-${index}`}
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      placeholder="Ex.: Assinatura mensal"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor={`item-qty-${index}`} className="text-xs">
                      Qtd.
                    </Label>
                    <Input
                      id={`item-qty-${index}`}
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <MoneyInput
                    id={`item-price-${index}`}
                    label="Preço (R$)"
                    value={item.price}
                    onChange={(cents) => updateItem(index, 'price', cents)}
                    disabled={isLoading}
                    className="flex-col gap-1 [&_label]:text-xs"
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeItem(index)}
                    disabled={isLoading || form.items.length <= 1}
                    aria-label={`Remover item ${index + 1}`}
                    className="self-end mb-0.5 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Minimum price */}
          <MoneyInput
            id="plan-minimum-price"
            label="Preço mínimo (opcional)"
            value={form.minimumPrice}
            onChange={(cents) => update('minimumPrice', cents)}
            disabled={isLoading}
          />

          {/* Payment methods */}
          <div className="flex flex-col gap-1.5">
            <Label>Métodos de pagamento</Label>
            <PaymentMethodToggle
              value={form.paymentMethods}
              onChange={(methods) => update('paymentMethods', methods)}
              disabled={isLoading}
            />
          </div>
        </div>
      </FormSection>

      {/* Section 3 — Advanced */}
      <FormSection title="Avançado" description="Ciclos, tentativas, negociável e metadados" defaultOpen={false}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-cycles">Ciclos (0 = vitalício)</Label>
              <Input
                id="plan-cycles"
                type="number"
                min={0}
                value={form.cycles}
                onChange={(e) => update('cycles', e.target.value)}
                placeholder="Ex.: 12"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-payment-attempts">Tentativas de pagamento</Label>
              <Input
                id="plan-payment-attempts"
                type="number"
                min={1}
                max={10}
                value={form.paymentAttempts}
                onChange={(e) => update('paymentAttempts', e.target.value)}
                placeholder="Ex.: 3"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="plan-negotiable"
              type="checkbox"
              checked={form.negotiable}
              onChange={(e) => update('negotiable', e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-border accent-[#4E8C75]"
            />
            <Label htmlFor="plan-negotiable" className="cursor-pointer">
              Permite negociação de preço
            </Label>
          </div>

          {/* Metadata */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Metadados (pares chave/valor)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMetadata}
                disabled={isLoading}
                aria-label="Adicionar par de metadados"
              >
                <Plus className="h-3 w-3 mr-1" aria-hidden="true" />
                Adicionar
              </Button>
            </div>

            {form.metadata.length > 0 && (
              <ul className="space-y-2" aria-label="Metadados do plano">
                {form.metadata.map((meta, index) => (
                  <li key={index} className="grid grid-cols-[1fr_1fr_36px] items-end gap-2">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor={`meta-key-${index}`} className="text-xs">
                        Chave
                      </Label>
                      <Input
                        id={`meta-key-${index}`}
                        value={meta.key}
                        onChange={(e) => updateMetadata(index, 'key', e.target.value)}
                        placeholder="chave"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor={`meta-value-${index}`} className="text-xs">
                        Valor
                      </Label>
                      <Input
                        id={`meta-value-${index}`}
                        value={meta.value}
                        onChange={(e) => updateMetadata(index, 'value', e.target.value)}
                        placeholder="valor"
                        disabled={isLoading}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeMetadata(index)}
                      disabled={isLoading}
                      aria-label={`Remover metadado ${meta.key || index + 1}`}
                      className="self-end mb-0.5 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </FormSection>

      {/* Uncovered options banner */}
      <UncoveredOptionsBanner />

      {/* Submit error */}
      {errorMessage && (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isLoading || form.name.trim() === '' || !hasValidItem}
          className="bg-[#4E8C75] hover:bg-[#3d7060] text-white"
          aria-live="polite"
        >
          {isLoading ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar plano'}
        </Button>
      </div>
    </form>
  );
}
