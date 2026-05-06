/**
 * Billing domain types — mirror of the backend PlanDTO.
 * Values monetary are in cents (integers).
 */

/** Generic paginated response wrapper matching the backend meta envelope. */
export interface Paginated<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export type BillingPlanStatus = 'active' | 'inactive';

export type BillingInterval = 'day' | 'week' | 'month' | 'year';

export type PaymentMethod = 'credit_card' | 'debit_card' | 'boleto' | 'cash';

/** Pricing scheme as returned by the backend in GET responses */
export interface PlanItem {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  pricingScheme: string;
  cycles?: number;
}

/** Pricing scheme as expected by the backend in POST/PATCH requests */
export interface CreatePlanItemInput {
  name: string;
  quantity: number;
  pricingScheme: {
    schemeType: 'unit' | 'package';
    price: number;
  };
  cycles?: number;
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  statementDescriptor?: string;
  status: BillingPlanStatus;
  interval: BillingInterval;
  intervalCount: number;
  billingType: 'prepaid' | 'postpaid' | 'exact_day';
  currency: 'BRL';
  paymentMethods: PaymentMethod[];
  installments: number[];
  items: PlanItem[];
  minimumPrice?: number;
  trialPeriodDays?: number;
  paymentAttempts?: number;
  negotiable?: boolean;
  quantity?: number;
  cycles?: number;
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanInput {
  name: string;
  description?: string;
  /**
   * Texto exibido na fatura do cartão (max 13 chars, alfanumérico).
   * Limite imposto pelas adquirentes brasileiras.
   */
  statementDescriptor?: string;
  interval: BillingInterval;
  intervalCount: number;
  currency: 'BRL';
  billingType: 'prepaid' | 'postpaid' | 'exact_day';
  paymentMethods: PaymentMethod[];
  installments?: number[];
  items: CreatePlanItemInput[];
  minimumPrice?: number;
  trialPeriodDays?: number;
  paymentAttempts?: number;
  negotiable?: boolean;
  cycles?: number;
  metadata?: Record<string, string>;
}

export type UpdatePlanInput = Partial<CreatePlanInput>;
