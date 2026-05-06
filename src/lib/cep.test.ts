/**
 * Unit tests for the lookupCep utility.
 *
 * `fetch` is stubbed globally via vi.stubGlobal so no real network calls
 * are made.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { lookupCep } from "./cep";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFetchResponse(
  ok: boolean,
  body: unknown,
): Response {
  return {
    ok,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("lookupCep", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return address data when ViaCEP returns a valid CEP", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeFetchResponse(true, {
          logradouro: "Avenida Paulista",
          localidade: "São Paulo",
          uf: "SP",
        }),
      ),
    );

    const result = await lookupCep("01310-100");

    expect(result).toEqual({
      street: "Avenida Paulista",
      neighborhood: "",
      city: "São Paulo",
      state: "SP",
    });
  });

  it("should return null when CEP has invalid length (fewer than 8 digits)", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const result = await lookupCep("0131010");

    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("should return null when CEP has invalid length (more than 8 digits)", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const result = await lookupCep("013101000");

    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("should return null when ViaCEP returns data.erro = true (CEP not found)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeFetchResponse(true, { erro: true }),
      ),
    );

    const result = await lookupCep("00000000");

    expect(result).toBeNull();
  });

  it("should return null when ViaCEP returns a non-ok HTTP response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeFetchResponse(false, {}),
      ),
    );

    const result = await lookupCep("01310100");

    expect(result).toBeNull();
  });

  it("should return null when fetch throws (network failure)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );

    const result = await lookupCep("01310100");

    expect(result).toBeNull();
  });

  it("should return neighborhood from ViaCEP response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeFetchResponse(true, {
          logradouro: "Avenida Paulista",
          bairro: "Bela Vista",
          localidade: "São Paulo",
          uf: "SP",
        }),
      ),
    );

    const result = await lookupCep("01310-100");

    expect(result).not.toBeNull();
    expect(result!.neighborhood).toBe("Bela Vista");
  });

  it("should return empty string for neighborhood when bairro is absent", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        makeFetchResponse(true, {
          logradouro: "Rua Sem Bairro",
          localidade: "Cidade",
          uf: "MG",
        }),
      ),
    );

    const result = await lookupCep("30130-010");

    expect(result).not.toBeNull();
    expect(result!.neighborhood).toBe("");
  });

  it("should strip non-digit characters from the CEP before calling ViaCEP", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      makeFetchResponse(true, {
        logradouro: "Rua Teste",
        localidade: "Cidade",
        uf: "MG",
      }),
    );
    vi.stubGlobal("fetch", fetchSpy);

    await lookupCep("01310-100");

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://viacep.com.br/ws/01310100/json/",
    );
  });
});
