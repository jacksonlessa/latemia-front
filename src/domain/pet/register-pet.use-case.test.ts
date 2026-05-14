/**
 * Unit tests for RegisterPetUseCase.
 *
 * Mocks the global fetch to test the use-case in isolation.
 * No personal data is included in assertions or error messages.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RegisterPetUseCase } from "./register-pet.use-case";
import { ValidationError } from "@/lib/validation-error";
import type { RegisterPetInput } from "@/lib/types/pet";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CLIENT_ID = "client-uuid-1";

function buildBirthDate(yearsAgo: number, monthsAgo = 0): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsAgo);
  d.setMonth(d.getMonth() - monthsAgo);
  return d;
}

function validInput(overrides: Partial<RegisterPetInput> = {}): RegisterPetInput {
  return {
    name: "Rex",
    species: "canino",
    breed: "Labrador",
    birthDate: buildBirthDate(3, 6),
    sex: "male",
    weight: 28.5,
    castrated: true,
    ...overrides,
  };
}

const successResponse = {
  id: "pet-uuid-1",
  clientId: CLIENT_ID,
  name: "Rex",
  species: "canino",
  breed: "Labrador",
  birthDate: "2023-04-18T00:00:00.000Z",
  sex: "male",
  weight: 28.5,
  castrated: true,
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
  delete process.env.NEXT_PUBLIC_API_URL;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------

describe("RegisterPetUseCase.execute — success", () => {
  it("should call POST /v1/register/pet with the correct URL", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const useCase = new RegisterPetUseCase();
    await useCase.execute(CLIENT_ID, validInput());

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url] = mockFetch.mock.calls[0];
    expect(String(url)).toContain("/v1/register/pet");
    expect(String(url)).not.toContain("/v1/clients");
  });

  it("should include clientId in the request body (not the URL)", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const useCase = new RegisterPetUseCase();
    await useCase.execute(CLIENT_ID, validInput());

    const [url, init] = mockFetch.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);

    // clientId must be in the body
    expect(body.clientId).toBe(CLIENT_ID);
    // URL must not contain the clientId as a path segment
    expect(String(url)).not.toContain(CLIENT_ID);
  });

  it("should include pet fields alongside clientId in the request body", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const birthDate = buildBirthDate(2, 3);
    const useCase = new RegisterPetUseCase();
    await useCase.execute(CLIENT_ID, validInput({ birthDate }));

    const [, init] = mockFetch.mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);

    expect(body).toMatchObject({
      clientId: CLIENT_ID,
      name: "Rex",
      species: "canino",
      breed: "Labrador",
      sex: "male",
      weight: 28.5,
      castrated: true,
    });
    expect(body.birthDate).toBe(birthDate.toISOString());
    expect(body.age_years).toBeUndefined();
    expect(body.age_months).toBeUndefined();
  });

  it("should call POST with Content-Type application/json", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const useCase = new RegisterPetUseCase();
    await useCase.execute(CLIENT_ID, validInput());

    const [, init] = mockFetch.mock.calls[0];
    const headers = (init as RequestInit).headers as Headers;
    expect((init as RequestInit).method).toBe("POST");
    // httpFetch wraps headers in a Headers instance — assert via .get()
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("should return the pet detail when API responds with 201", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(successResponse, 201));

    const useCase = new RegisterPetUseCase();
    const result = await useCase.execute(CLIENT_ID, validInput());

    expect(result.id).toBe("pet-uuid-1");
    expect(result.clientId).toBe(CLIENT_ID);
    expect(result.sex).toBe("male");
  });
});

// ---------------------------------------------------------------------------
// Domain validation errors (before HTTP call)
// ---------------------------------------------------------------------------

describe("RegisterPetUseCase.execute — domain validation", () => {
  it("should throw ValidationError with name field error when name is empty", async () => {
    const useCase = new RegisterPetUseCase();

    await expect(
      useCase.execute(CLIENT_ID, validInput({ name: "" })),
    ).rejects.toThrow(ValidationError);

    try {
      await useCase.execute(CLIENT_ID, validInput({ name: "" }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["name"]).toBeDefined();
    }
  });

  it("should not call fetch when domain validation fails", async () => {
    const mockFetch = vi.mocked(fetch);
    const useCase = new RegisterPetUseCase();

    try {
      await useCase.execute(CLIENT_ID, validInput({ weight: -1 }));
    } catch {
      // expected
    }

    expect(mockFetch).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// API error mapping
// ---------------------------------------------------------------------------

describe("RegisterPetUseCase.execute — API error mapping", () => {
  it("should throw ValidationError with _form field error when API returns CLIENT_NOT_FOUND", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: "CLIENT_NOT_FOUND" }, 404),
    );

    const useCase = new RegisterPetUseCase();

    try {
      await useCase.execute(CLIENT_ID, validInput());
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).fieldErrors["_form"]).toContain(
        "Cliente não encontrado",
      );
    }
  });

  it("should throw ValidationError with birthDate field error when API returns INVALID_BIRTHDATE", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: "INVALID_BIRTHDATE" }, 400),
    );

    const useCase = new RegisterPetUseCase();

    try {
      await useCase.execute(CLIENT_ID, validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["birthDate"]).toBeDefined();
    }
  });

  it("should throw ValidationError with sex field error when API returns INVALID_SEX", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: "INVALID_SEX" }, 400),
    );

    const useCase = new RegisterPetUseCase();

    try {
      await useCase.execute(CLIENT_ID, validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["sex"]).toBeDefined();
    }
  });

  it("should throw ValidationError with weight field error when API returns INVALID_WEIGHT", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: "INVALID_WEIGHT" }, 400),
    );

    const useCase = new RegisterPetUseCase();

    try {
      await useCase.execute(CLIENT_ID, validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["weight"]).toBeDefined();
    }
  });

  it("should throw ValidationError with _form field error when API returns unknown error code", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: "UNEXPECTED_ERROR" }, 500),
    );

    const useCase = new RegisterPetUseCase();

    try {
      await useCase.execute(CLIENT_ID, validInput());
    } catch (e) {
      expect((e as ValidationError).fieldErrors["_form"]).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Network failure
// ---------------------------------------------------------------------------

describe("RegisterPetUseCase.execute — network failure", () => {
  it("should throw ValidationError with _form field error when fetch throws", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const useCase = new RegisterPetUseCase();

    try {
      await useCase.execute(CLIENT_ID, validInput());
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).fieldErrors["_form"]).toContain(
        "Erro de conexão",
      );
    }
  });
});
