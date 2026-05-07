export type NotificationEventType =
  | "plan.created"
  | "plan.statusChanged"
  | "plan.paymentFailed"
  | "plan.renewed"
  | "plan.paymentMethodUpdated";

export interface NotificationEventConfigDto {
  type: NotificationEventType;
  enabled: boolean;
  updatedAt: string;
}

export interface QuietHoursDto {
  enabled: boolean;
  start: string; // 'HH:MM'
  end: string; // 'HH:MM'
  timezone: string;
}

export type NotificationBufferStatus = "pending" | "sent" | "discarded";
export type NotificationBufferReason = "quiet_hours" | "provider_failure";

export interface NotificationBufferEntryDto {
  id: string;
  type: NotificationEventType;
  provider: string;
  status: NotificationBufferStatus;
  reason: NotificationBufferReason;
  occurredAt: string;
  createdAt: string;
  sentAt: string | null;
  attempts: number;
  lastError: string | null;
  text?: string;
}

export interface NotificationBufferListResponse {
  items: NotificationBufferEntryDto[];
  nextCursor: string | null;
}

export interface ListNotificationBufferQuery {
  status?: NotificationBufferStatus;
  reason?: NotificationBufferReason;
  limit?: number;
  cursor?: string;
  includeText?: boolean;
}
