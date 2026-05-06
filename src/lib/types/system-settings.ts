export interface SystemSettingsDto {
  payment_provider: string | null;
  subscription_plan_id: string | null;
}

export interface UpdateSystemSettingsInput {
  payment_provider?: string;
  subscription_plan_id?: string;
}
