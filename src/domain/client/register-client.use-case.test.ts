/**
 * Unit tests for RegisterClientUseCase.
 *
 * Mocks the global fetch and getApiUrl to test the use-case in isolation.
 * No personal data is included in assertions or error messages.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RegisterClientUseCase } from "./register-client.use-case";
import { ValidationError } from "@/lib/validation-error";
import type { RegisterClientInput } from "@/lib/types/client";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const validAddress = {
  cep: "01310-100",
  street: "Avenida Paulista",
  number: "1000",
  city: "São Paulo",
  state: "SP",
};

function validInput(overrides: Partial<RegisterClientInput> = {}): RegisterClientInput {
  return {
    name: "Maria da Silva",
    cpf: "529.982.247-25",
    phone: "11987654321",
    email: "maria@example.com",
    address: validAddress,
    ...overrides,
  };
}

const successResponse = {
  id: "client-uuid-1",
  name: "Maria da Silva",
  cpf: "529.982.247-25",
  phone: "11987654321",
  email: "maria@example.com",
  addresses: [],
  pets: [],
  createdAt: "2026-04-18T12:00:00.000Z",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFetchResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  // Ensure NEXT_PUBLIC_API_URL is not set so getApiUrl falls back to localhost
  delete process.env.NEXT_PUBLIC_API_URL;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------

describe("RegisterClientUseCase.execute — success", () => {
  it("should call POST /v1/register/client with the correct URL", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const useCase = new RegisterClientUseCase();
    await useCase.execute(validInput());

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).toContain("/v1/register/client");
    expect(String(url)).not.toContain("/v1/clients");
  });

  it("should call POST with Content-Type application/json", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const useCase = new RegisterClientUseCase();
    await useCase.execute(validInput());

    const [, init] = mockFetch.mock.calls[0];
    expect((init as RequestInit).method).toBe("POST");
    expect((init as RequestInit).headers).toMatchObject({
      "Content-Type": "application/json",
    });
  });

  it("should return the client detail when API responds with 201", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const useCase = new RegisterClientUseCase();
    const result = await useCase.execute(validInput());

    expect(result.id).toBe("client-uuid-1");
  });

  it("should return the client detail when API responds with 200 (idempotency)", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 200));

    const useCase = new RegisterClientUseCase();
    const result = await useCase.execute(validInput());

    expect(result.id).toBe("client-uuid-1");
  });
});

// ---------------------------------------------------------------------------
// Domain validation errors (before HTTP call)
// ---------------------------------------------------------------------------

describe("RegisterClientUseCase.execute — domain validation", () => {
  it("should throw ValidationError with cpf field error when CPF is invalid", async () => {
    const useCase = new RegisterClientUseCase();

    await expect(
      useCase.execute(validInput({ cpf: "000.000.000-00" })),
    ).rejects.toThrow(ValidationError);

    try {
      await useCase.execute(validInput({ cpf: "000.000.000-00" }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["cpf"]).toBeDefined();
    }
  });

  it("should not call fetch when domain validation fails", async () => {
    const mockFetch = vi.mocked(fetch);
    const useCase = new RegisterClientUseCase();

    try {
      await useCase.execute(validInput({ name: "" }));
    } catch {
      // expected
    }

    expect(mockFetch).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// API error mapping — complete catalogue (task 6.0)
// ---------------------------------------------------------------------------

describe("RegisterClientUseCase.execute — API error mapping", () => {
  it("should throw ValidationError with name field error when API returns INVALID_NAME", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({ code: "INVALID_NAME" }, 400));
    const useCase = new RegisterClientUseCase();
    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["name"]).toBe("Informe seu nome completo");
    }
  });

  it("should throw ValidationError with cpf field error when API returns INVALID_CPF", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({ code: "INVALID_CPF" }, 400));
    const useCase = new RegisterClientUseCase();
    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["cpf"]).toBe("CPF inválido");
    }
  });

  it("should throw ValidationError with phone field error when API returns INVALID_PHONE", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({ code: "INVALID_PHONE" }, 400));
    const useCase = new RegisterClientUseCase();
    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["phone"]).toContain("Telefone inválido");
    }
  });

  it("should throw ValidationError with email field error when API returns INVALID_EMAIL", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({ code: "INVALID_EMAIL" }, 400));
    const useCase = new RegisterClientUseCase();
    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["email"]).toBe("E-mail inválido");
    }
  });

  it("should throw ValidationError with address.cep field error when API returns INVALID_CEP", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({ code: "INVALID_CEP" }, 400));
    const useCase = new RegisterClientUseCase();
    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["address.cep"]).toBe("CEP inválido");
    }
  });

  it("should throw ValidationError with address.street field error when API returns INVALID_STREET", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({ code: "INVALID_STREET" }, 400));
    const useCase = new RegisterClientUseCase();
    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["address.street"]).toBe("Informe a rua");
    }
  });

  it("should throw ValidationError with address.number field error when API returns INVALID_NUMBER", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({ code: "INVALID_NUMBER" }, 400));
    const useCase = new RegisterClientUseCase();
    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["address.number"]).toBe("Informe o número");
    }
  });

  it("should throw ValidationError with address.complement field error when API returns INVALID_COMPLEMENT", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({ code: "INVALID_COMPLEMENT" }, 400));
    const useCase = new RegisterClientUseCase();
    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["address.complement"]).toContain("Complemento muito longo");
    }
  });

  it("should throw ValidationError with address.cep field error and friendly message when API returns INVALID_CITY", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({ code: "INVALID_CITY" }, 400));
    const useCase = new RegisterClientUseCase();
    try {
      await useCase.execute(validInput());
    } catch (e) {
      // INVALID_CITY maps to address.cep per PRD F2.4
      expect((e as ValidationError).fieldErrors["address.cep"]).toContain("Camboriú");
      expect((e as ValidationError).fieldErrors["address.city"]).toBeUndefined();
    }
  });

  it("should throw ValidationError with address.state field error when API returns INVALID_STATE", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({ code: "INVALID_STATE" }, 400));
    const useCase = new RegisterClientUseCase();
    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["address.state"]).toBe("UF inválida");
    }
  });

  it("should throw ValidationError with email field error when API returns EMAIL_ALREADY_REGISTERED", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({ code: "EMAIL_ALREADY_REGISTERED" }, 409));
    const useCase = new RegisterClientUseCase();
    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["email"]).toBe("E-mail já cadastrado");
    }
  });

  it("should throw ValidationError with cpf field error when API returns CPF_EMAIL_MISMATCH", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({ code: "CPF_EMAIL_MISMATCH" }, 409));
    const useCase = new RegisterClientUseCase();
    await expect(useCase.execute(validInput())).rejects.toThrow(ValidationError);

    try {
      mockFetch.mockResolvedValueOnce(makeFetchResponse({ code: "CPF_EMAIL_MISMATCH" }, 409));
      await useCase.execute(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["cpf"]).toBe("CPF já cadastrado com outro e-mail");
    }
  });

  it("should throw ValidationError with _form field error when API returns DUPLICATE_CLIENT", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({ code: "DUPLICATE_CLIENT" }, 409));
    const useCase = new RegisterClientUseCase();
    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["_form"]).toContain("cadastro com esses dados");
    }
  });

  it("should throw ValidationError with _form field error when API returns RATE_LIMIT_EXCEEDED", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({ code: "RATE_LIMIT_EXCEEDED" }, 429));
    const useCase = new RegisterClientUseCase();
    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["_form"]).toContain("Muitas tentativas");
    }
  });

  it("should throw ValidationError with _form field error when API returns INVALID_INPUT", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({ code: "INVALID_INPUT" }, 400));
    const useCase = new RegisterClientUseCase();
    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["_form"]).toContain("Verifique os dados informados");
    }
  });

  it("should throw ValidationError with _form field error and warn when API returns unknown error code", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({ code: "UNKNOWN_CODE" }, 500));
    const useCase = new RegisterClientUseCase();
    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["_form"]).toBeDefined();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("unmapped error code"),
        "UNKNOWN_CODE",
      );
    }
    warnSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Touchpoints propagation (task 7.0 — seo-analytics-lgpd-utm)
// ---------------------------------------------------------------------------

describe("RegisterClientUseCase.execute — touchpoints", () => {
  const baseTouchpoint = {
    utmSource: "instagram",
    utmMedium: "social",
    utmCampaign: "lancamento",
    utmContent: null,
    utmTerm: null,
    gclid: null,
    fbclid: null,
    referrer: null,
    referralCode: null,
    capturedAt: "2026-05-04T10:00:00.000Z",
  };

  it("should not include `touchpoints` in the request body when no opts are passed", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const useCase = new RegisterClientUseCase();
    await useCase.execute(validInput());

    const [, init] = mockFetch.mock.calls[0];
    const sent = JSON.parse(String((init as RequestInit).body)) as Record<
      string,
      unknown
    >;
    expect(sent).not.toHaveProperty("touchpoints");
  });

  it("should not include `touchpoints` when opts.touchpoints is empty", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const useCase = new RegisterClientUseCase();
    await useCase.execute(validInput(), { touchpoints: {} });

    const [, init] = mockFetch.mock.calls[0];
    const sent = JSON.parse(String((init as RequestInit).body)) as Record<
      string,
      unknown
    >;
    expect(sent).not.toHaveProperty("touchpoints");
  });

  it("should include `touchpoints.first` only when only first is provided", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const useCase = new RegisterClientUseCase();
    await useCase.execute(validInput(), {
      touchpoints: { first: { ...baseTouchpoint } },
    });

    const [, init] = mockFetch.mock.calls[0];
    const sent = JSON.parse(String((init as RequestInit).body)) as {
      touchpoints?: { first?: unknown; last?: unknown };
    };
    expect(sent.touchpoints?.first).toBeDefined();
    expect(sent.touchpoints?.last).toBeUndefined();
    // never `null` on the wire
    expect("last" in (sent.touchpoints ?? {})).toBe(false);
  });

  it("should include both `first` and `last` when both are provided", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const useCase = new RegisterClientUseCase();
    await useCase.execute(validInput(), {
      touchpoints: {
        first: { ...baseTouchpoint, utmCampaign: "first-campaign" },
        last: { ...baseTouchpoint, utmCampaign: "last-campaign" },
      },
    });

    const [, init] = mockFetch.mock.calls[0];
    const sent = JSON.parse(String((init as RequestInit).body)) as {
      touchpoints: {
        first: { utmCampaign: string };
        last: { utmCampaign: string };
      };
    };
    expect(sent.touchpoints.first.utmCampaign).toBe("first-campaign");
    expect(sent.touchpoints.last.utmCampaign).toBe("last-campaign");
  });
});

// ---------------------------------------------------------------------------
// Network failure
// ---------------------------------------------------------------------------

describe("RegisterClientUseCase.execute — network failure", () => {
  it("should throw ValidationError with _form field error when fetch throws", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const useCase = new RegisterClientUseCase();

    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).fieldErrors["_form"]).toContain(
        "Erro de conexão",
      );
    }
  });
});
