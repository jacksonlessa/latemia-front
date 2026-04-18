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
// API error mapping
// ---------------------------------------------------------------------------

describe("RegisterClientUseCase.execute — API error mapping", () => {
  it("should throw ValidationError with cpf field error when API returns CPF_EMAIL_MISMATCH", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: "CPF_EMAIL_MISMATCH" }, 409),
    );

    const useCase = new RegisterClientUseCase();

    await expect(useCase.execute(validInput())).rejects.toThrow(ValidationError);

    try {
      mockFetch.mockResolvedValueOnce(
        makeFetchResponse({ code: "CPF_EMAIL_MISMATCH" }, 409),
      );
      await useCase.execute(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["cpf"]).toBe(
        "CPF já cadastrado com outro e-mail",
      );
    }
  });

  it("should throw ValidationError with email field error when API returns EMAIL_ALREADY_REGISTERED", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: "EMAIL_ALREADY_REGISTERED" }, 409),
    );

    const useCase = new RegisterClientUseCase();

    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["email"]).toBe(
        "E-mail já cadastrado",
      );
    }
  });

  it("should throw ValidationError with cpf field error when API returns INVALID_CPF", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: "INVALID_CPF" }, 400),
    );

    const useCase = new RegisterClientUseCase();

    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["cpf"]).toBe("CPF inválido");
    }
  });

  it("should throw ValidationError with _form field error when API returns unknown error code", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: "UNKNOWN_CODE" }, 500),
    );

    const useCase = new RegisterClientUseCase();

    try {
      await useCase.execute(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["_form"]).toBeDefined();
    }
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
