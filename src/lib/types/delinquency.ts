/**
 * The 5 fixed message stages of the delinquency billing flow, in days
 * overdue.
 */
export const DELINQUENCY_TEMPLATE_STAGE_DAYS = [1, 2, 5, 10, 14] as const;

export type DelinquencyTemplateStageDays =
  (typeof DELINQUENCY_TEMPLATE_STAGE_DAYS)[number];

/** Response DTO for `DelinquencyMessageTemplate` — GET/PUT `.../templates`. */
export interface DelinquencyTemplateDto {
  stageDays: number;
  title: string;
  body: string;
  updatedById: string | null;
  updatedAt: string;
}

/** Body of `PUT /v1/admin/delinquency/templates/:stageDays`. */
export interface UpdateDelinquencyTemplateInput {
  title: string;
  body: string;
}
