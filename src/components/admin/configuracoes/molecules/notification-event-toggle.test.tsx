import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NotificationEventToggle } from "./notification-event-toggle";
import type {
  NotificationEventConfigDto,
  NotificationEventType,
} from "@/lib/types/notifications";

const baseConfig: NotificationEventConfigDto = {
  type: "plan.created" as NotificationEventType,
  enabled: false,
  updatedAt: new Date().toISOString(),
};

describe("NotificationEventToggle", () => {
  it("should call toggleAction with new value when switch toggled", async () => {
    const action = vi.fn(async (type: NotificationEventType, enabled: boolean) => ({
      success: true as const,
      data: { ...baseConfig, type, enabled },
    }));
    const onMessage = vi.fn();

    render(
      <NotificationEventToggle
        config={baseConfig}
        toggleAction={action}
        onMessage={onMessage}
      />,
    );

    const sw = screen.getByRole("switch");
    fireEvent.click(sw);

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    expect(action).toHaveBeenCalledWith("plan.created", true);
    await waitFor(() =>
      expect(onMessage).toHaveBeenCalledWith(
        expect.objectContaining({ kind: "success" }),
      ),
    );
  });

  it("should revert state and emit error message when action fails", async () => {
    const action = vi.fn(async () => ({
      success: false as const,
      error: { code: "UNKNOWN_EVENT_TYPE", message: "boom" },
    }));
    const onMessage = vi.fn();

    render(
      <NotificationEventToggle
        config={{ ...baseConfig, enabled: true }}
        toggleAction={action}
        onMessage={onMessage}
      />,
    );

    const sw = screen.getByRole("switch");
    expect(sw).toHaveAttribute("aria-checked", "true");
    fireEvent.click(sw);

    await waitFor(() =>
      expect(onMessage).toHaveBeenCalledWith(
        expect.objectContaining({ kind: "error" }),
      ),
    );
    // reverted back to checked=true
    expect(sw).toHaveAttribute("aria-checked", "true");
  });
});
