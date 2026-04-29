"use client";

import { useState } from "react";
import { NotificationEventToggle } from "../molecules/notification-event-toggle";
import type {
  NotificationEventConfigDto,
  NotificationEventType,
} from "@/lib/types/notifications";

type ToggleAction = (
  type: NotificationEventType,
  enabled: boolean,
) => Promise<
  | { success: true; data: NotificationEventConfigDto }
  | { success: false; error: { code: string; message: string } }
>;

interface NotificationEventsListProps {
  events: NotificationEventConfigDto[];
  fetchError?: string | null;
  toggleAction: ToggleAction;
}

export function NotificationEventsList({
  events,
  fetchError,
  toggleAction,
}: NotificationEventsListProps) {
  const [feedback, setFeedback] = useState<
    { kind: "success" | "error"; text: string } | null
  >(null);

  if (fetchError) {
    return (
      <p
        role="alert"
        className="rounded-md bg-red-50 px-4 py-3 text-sm text-destructive"
      >
        {fetchError}
      </p>
    );
  }

  if (events.length === 0) {
    return (
      <p className="text-sm text-[#6B6B6E]">
        Nenhum evento de notificação configurado.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {feedback && (
        <div
          role={feedback.kind === "error" ? "alert" : "status"}
          aria-live="polite"
          className={
            feedback.kind === "success"
              ? "rounded-md bg-green-50 px-4 py-3 text-sm text-green-700"
              : "rounded-md bg-red-50 px-4 py-3 text-sm text-destructive"
          }
        >
          {feedback.text}
        </div>
      )}
      <div className="space-y-2">
        {events.map((event) => (
          <NotificationEventToggle
            key={event.type}
            config={event}
            toggleAction={toggleAction}
            onMessage={(msg) => setFeedback(msg)}
          />
        ))}
      </div>
    </div>
  );
}
