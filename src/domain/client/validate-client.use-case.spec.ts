/**
 * Unit tests for validateClientUseCase.
 *
 * Mocks the global fetch to test the use-case in isolation.
 * No personal data is included in assertions or error messages.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { validateClientUseCase } from "./validate-client.use-case";
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
  delete process.env.NEXT_PUBLIC_API_URL;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------

describe("validateClientUseCase — success", () => {
  it("should resolve without throwing when server responds with 200", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeFetchResponse({ ok: true }, 200));

    await expect(validateClientUseCase(validInput())).resolves.toBeUndefined();
  });

  it("should call POST /v1/checkout/validate-client", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({ ok: true }, 200));

    await validateClientUseCase(validInput());

    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toContain("/v1/checkout/validate-client");
    expect((init as RequestInit).method).toBe("POST");
    expect((init as RequestInit).headers).toMatchObject({
      "Content-Type": "application/json",
    });
  });
});

// ---------------------------------------------------------------------------
// API error mapping — same codes as register-client (symmetric guarantee)
// ---------------------------------------------------------------------------

describe("validateClientUseCase — API error mapping", () => {
  it("should throw ValidationError on phone field when API returns INVALID_PHONE", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeFetchResponse({ code: "INVALID_PHONE" }, 400),
    );

    await expect(validateClientUseCase(validInput())).rejects.toThrow(ValidationError);

    vi.mocked(fetch).mockResolvedValueOnce(
      makeFetchResponse({ code: "INVALID_PHONE" }, 400),
    );
    try {
      await validateClientUseCase(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["phone"]).toContain("Telefone inválido");
    }
  });

  it("should throw ValidationError on address.cep with friendly message when API returns INVALID_CITY", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeFetchResponse({ code: "INVALID_CITY" }, 400),
    );
    try {
      await validateClientUseCase(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["address.cep"]).toContain("Camboriú");
      expect((e as ValidationError).fieldErrors["address.city"]).toBeUndefined();
    }
  });

  it("should throw ValidationError on email field when API returns EMAIL_ALREADY_REGISTERED", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeFetchResponse({ code: "EMAIL_ALREADY_REGISTERED" }, 409),
    );
    try {
      await validateClientUseCase(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["email"]).toBe("E-mail já cadastrado");
    }
  });

  it("should throw ValidationError on _form when API returns RATE_LIMIT_EXCEEDED (429)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeFetchResponse({ code: "RATE_LIMIT_EXCEEDED" }, 429),
    );
    try {
      await validateClientUseCase(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["_form"]).toContain("Muitas tentativas");
    }
  });

  it("should throw ValidationError on _form when API returns DUPLICATE_CLIENT", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      makeFetchResponse({ code: "DUPLICATE_CLIENT" }, 409),
    );
    try {
      await validateClientUseCase(validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["_form"]).toContain("cadastro com esses dados");
    }
  });
});

// ---------------------------------------------------------------------------
// Network failure
// ---------------------------------------------------------------------------

describe("validateClientUseCase — network failure", () => {
  it("should throw ValidationError with _form message when fetch throws", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError("Failed to fetch"));

    try {
      await validateClientUseCase(validInput());
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).fieldErrors["_form"]).toContain(
        "Não foi possível validar seus dados",
      );
    }
  });

  it("should not throw when fetch succeeds with 200", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeFetchResponse({ ok: true }, 200));
    await expect(validateClientUseCase(validInput())).resolves.toBeUndefined();
  });
});
