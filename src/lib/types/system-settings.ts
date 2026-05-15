export interface SystemSettingsDto {
  payment_provider: string | null;
  subscription_plan_id: string | null;
  /** Preço mensal por pet em centavos (ex.: "4990" = R$49,90). */
  subscription_plan_price_cents: string | null;
  /**
   * Flag de feature do OTP no aceite contratual.
   * Persistida como string literal `'true'` ou `'false'` em `SystemSetting.value`.
   * Conversão para boolean é responsabilidade do consumidor.
   */
  otp_contract_enabled: string | null;
}

export interface UpdateSystemSettingsInput {
  payment_provider?: string;
  subscription_plan_id?: string;
  /** Preço mensal por pet em centavos. Deve ser inteiro positivo. */
  subscription_plan_price_cents?: number;
  /**
   * Flag de feature do OTP no aceite contratual.
   * Aceita exclusivamente as strings literais `'true'` ou `'false'`.
   */
  otp_contract_enabled?: 'true' | 'false';
}
