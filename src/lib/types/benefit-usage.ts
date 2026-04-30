/**
 * Shared types for the BenefitUsage domain.
 * These mirror the backend API interfaces defined in the TechSpec
 * (tasks/prd-uso-beneficio/techspec.md).
 */

import type { PlanStatus } from '@/lib/types/plan';

/** Reuse plan status to drive UI gating in the uso-beneficio flow. */
export type { PlanStatus };

/** Reference to the user that created/updated a usage record. */
export interface BenefitUsageActor {
  id: string;
  name: string;
}

/**
 * Single benefit-usage record returned by the API.
 * Decimal monetary values arrive serialized as strings (e.g. "1234.56")
 * to preserve precision across the wire.
 */
export interface BenefitUsage {
  id: string;
  planId: string;
  attendedAt: string;
  procedureDescription: string;
  isEmergency: boolean;
  totalValue: string;
  discountApplied: string;
  createdAt: string;
  updatedAt: string;
  creator: BenefitUsageActor;
  updater?: BenefitUsageActor | null;
}
