export interface SystemSettingsDto {
  payment_provider: string | null;
  subscription_plan_id: string | null;
  /** Preço mensal por pet em centavos (ex.: "4990" = R$49,90). */
  subscription_plan_price_cents: string | null;
}

export interface UpdateSystemSettingsInput {
  payment_provider?: string;
  subscription_plan_id?: string;
  /** Preço mensal por pet em centavos. Deve ser inteiro positivo. */
  subscription_plan_price_cents?: number;
}
