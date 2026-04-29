import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QuietHoursForm } from "./quiet-hours-form";
import type { QuietHoursDto } from "@/lib/types/notifications";

const filled: QuietHoursDto = {
  enabled: true,
  start: "22:00",
  end: "07:00",
  timezone: "America/Sao_Paulo",
};

describe("QuietHoursForm", () => {
  it("should show validation error when start is not HH:MM", async () => {
    const action = vi.fn();
    render(<QuietHoursForm initialValues={filled} saveAction={action} />);

    const startInput = screen.getByLabelText(/Início/i) as HTMLInputElement;
    fireEvent.change(startInput, { target: { value: "25:99" } });
    fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));

    await waitFor(() =>
      expect(screen.getByText(/Use o formato HH:MM/i)).toBeInTheDocument(),
    );
    expect(action).not.toHaveBeenCalled();
  });

  it("should call saveAction with valid payload on submit", async () => {
    const action = vi.fn(async (payload: QuietHoursDto) => ({
      success: true as const,
      data: payload,
    }));
    render(<QuietHoursForm initialValues={filled} saveAction={action} />);

    fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    expect(action).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        start: "22:00",
        end: "07:00",
        timezone: "America/Sao_Paulo",
      }),
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Janela de silêncio salva com sucesso/i),
      ).toBeInTheDocument(),
    );
  });

  it("should display server error message when action fails", async () => {
    const action = vi.fn(async () => ({
      success: false as const,
      error: {
        code: "INVALID_QUIET_HOURS_RANGE",
        message: "ranges invalid",
      },
    }));
    render(<QuietHoursForm initialValues={filled} saveAction={action} />);

    fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/Faixa de horários inválida/i),
      ).toBeInTheDocument(),
    );
  });
});
