import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SettingsForm } from "./settings-form";
import type {
  SystemSettingsDto,
  UpdateSystemSettingsInput,
} from "@/lib/types/system-settings";

const baseValues: SystemSettingsDto = {
  payment_provider: "pagarme",
  subscription_plan_id: "plan_abc123",
  subscription_plan_price_cents: "4990",
  otp_contract_enabled: "false",
};

function makeSaveSuccess() {
  return vi.fn(async (_payload: UpdateSystemSettingsInput) => ({
    success: true as const,
    data: { ...baseValues, otp_contract_enabled: "true" } as SystemSettingsDto,
  }));
}

function makeSaveError(code: string, message = "boom") {
  return vi.fn(async (_payload: UpdateSystemSettingsInput) => ({
    success: false as const,
    error: { code, message },
  }));
}

describe("SettingsForm — OTP contract toggle", () => {
  it("should reflect otp_contract_enabled=false from initialValues when rendered", () => {
    render(
      <SettingsForm
        initialValues={baseValues}
        saveAction={makeSaveSuccess()}
      />,
    );

    const sw = screen.getByRole("switch", {
      name: /ativar otp no aceite do contrato/i,
    });
    expect(sw).toHaveAttribute("aria-checked", "false");
  });

  it("should reflect otp_contract_enabled=true from initialValues when rendered", () => {
    render(
      <SettingsForm
        initialValues={{ ...baseValues, otp_contract_enabled: "true" }}
        saveAction={makeSaveSuccess()}
      />,
    );

    const sw = screen.getByRole("switch", {
      name: /ativar otp no aceite do contrato/i,
    });
    expect(sw).toHaveAttribute("aria-checked", "true");
  });

  it("should toggle the switch state when user clicks it", () => {
    render(
      <SettingsForm
        initialValues={baseValues}
        saveAction={makeSaveSuccess()}
      />,
    );

    const sw = screen.getByRole("switch", {
      name: /ativar otp no aceite do contrato/i,
    });
    expect(sw).toHaveAttribute("aria-checked", "false");

    fireEvent.click(sw);

    expect(sw).toHaveAttribute("aria-checked", "true");
  });

  it("should submit otp_contract_enabled='true' string when toggled on", async () => {
    const saveAction = makeSaveSuccess();
    render(
      <SettingsForm initialValues={baseValues} saveAction={saveAction} />,
    );

    const sw = screen.getByRole("switch", {
      name: /ativar otp no aceite do contrato/i,
    });
    fireEvent.click(sw);

    const submit = screen.getByRole("button", { name: /salvar/i });
    fireEvent.click(submit);

    await waitFor(() => expect(saveAction).toHaveBeenCalledTimes(1));
    const payload = saveAction.mock.calls[0][0];
    expect(payload.otp_contract_enabled).toBe("true");
    expect(typeof payload.otp_contract_enabled).toBe("string");
  });

  it("should submit otp_contract_enabled='false' string when toggled off", async () => {
    const saveAction = makeSaveSuccess();
    render(
      <SettingsForm
        initialValues={{ ...baseValues, otp_contract_enabled: "true" }}
        saveAction={saveAction}
      />,
    );

    const sw = screen.getByRole("switch", {
      name: /ativar otp no aceite do contrato/i,
    });
    fireEvent.click(sw);

    const submit = screen.getByRole("button", { name: /salvar/i });
    fireEvent.click(submit);

    await waitFor(() => expect(saveAction).toHaveBeenCalledTimes(1));
    const payload = saveAction.mock.calls[0][0];
    expect(payload.otp_contract_enabled).toBe("false");
    expect(typeof payload.otp_contract_enabled).toBe("string");
  });

  it("should keep Salvar disabled when no field is dirty", () => {
    render(
      <SettingsForm
        initialValues={baseValues}
        saveAction={makeSaveSuccess()}
      />,
    );

    const submit = screen.getByRole("button", { name: /salvar/i });
    expect(submit).toBeDisabled();
  });

  it("should enable Salvar when only the OTP switch becomes dirty", () => {
    render(
      <SettingsForm
        initialValues={baseValues}
        saveAction={makeSaveSuccess()}
      />,
    );

    const submit = screen.getByRole("button", { name: /salvar/i });
    expect(submit).toBeDisabled();

    const sw = screen.getByRole("switch", {
      name: /ativar otp no aceite do contrato/i,
    });
    fireEvent.click(sw);

    expect(submit).not.toBeDisabled();
  });

  it("should display INVALID_OTP_CONTRACT_ENABLED friendly message when backend rejects", async () => {
    const saveAction = makeSaveError("INVALID_OTP_CONTRACT_ENABLED");
    render(
      <SettingsForm initialValues={baseValues} saveAction={saveAction} />,
    );

    const sw = screen.getByRole("switch", {
      name: /ativar otp no aceite do contrato/i,
    });
    fireEvent.click(sw);
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => expect(saveAction).toHaveBeenCalled());
    await waitFor(() =>
      expect(
        screen.getByText(/valor inválido para o otp do contrato/i),
      ).toBeInTheDocument(),
    );
  });

  it("should NOT include otp_contract_enabled in payload when not dirty", async () => {
    const saveAction = makeSaveSuccess();
    render(
      <SettingsForm initialValues={baseValues} saveAction={saveAction} />,
    );

    // Make some other field dirty to enable submit
    const planIdInput = screen.getByLabelText(/id do plano de assinatura/i);
    fireEvent.change(planIdInput, { target: { value: "plan_new_id" } });

    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => expect(saveAction).toHaveBeenCalledTimes(1));
    const payload = saveAction.mock.calls[0][0];
    expect(payload.otp_contract_enabled).toBeUndefined();
    expect(payload.subscription_plan_id).toBe("plan_new_id");
  });
});
