/**
 * Unit tests for ClientEntity.
 *
 * These tests exercise validation logic in isolation — no network or DB calls.
 */

import { describe, it, expect } from "vitest";
import { ClientEntity } from "./client.entity";
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
    cpf: "529.982.247-25", // valid CPF
    phone: "11987654321",
    email: "maria@example.com",
    address: validAddress,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------

describe("ClientEntity.validate — valid input", () => {
  it("should return a ClientEntity when all fields are valid", () => {
    const entity = ClientEntity.validate(validInput());

    expect(entity).toBeInstanceOf(ClientEntity);
    expect(entity.name).toBe("Maria da Silva");
    expect(entity.email).toBe("maria@example.com");
  });

  it("should normalise CPF to masked canonical form", () => {
    const entity = ClientEntity.validate(validInput({ cpf: "52998224725" }));
    expect(entity.cpf).toBe("529.982.247-25");
  });

  it("should lower-case and trim the email", () => {
    const entity = ClientEntity.validate(validInput({ email: "  MARIA@Example.COM  " }));
    expect(entity.email).toBe("maria@example.com");
  });

  it("should strip non-digit characters from phone", () => {
    const entity = ClientEntity.validate(validInput({ phone: "(11) 98765-4321" }));
    expect(entity.phone).toBe("11987654321");
  });

  it("should strip non-digit characters from CEP in address payload", () => {
    const entity = ClientEntity.validate(validInput());
    expect(entity.address.cep).toBe("01310100");
  });

  it("should include optional complement when provided", () => {
    const entity = ClientEntity.validate(
      validInput({
        address: { ...validAddress, complement: "Apto 42" },
      }),
    );
    expect(entity.address.complement).toBe("Apto 42");
  });

  it("should accept address without neighborhood", () => {
    const entity = ClientEntity.validate(validInput());
    expect(entity.address.neighborhood).toBeUndefined();
  });

  it("should accept address with neighborhood", () => {
    const entity = ClientEntity.validate(
      validInput({
        address: { ...validAddress, neighborhood: "Bela Vista" },
      }),
    );
    expect(entity.address.neighborhood).toBe("Bela Vista");
  });
});

// ---------------------------------------------------------------------------
// Name validation
// ---------------------------------------------------------------------------

describe("ClientEntity.validate — name", () => {
  it("should throw ValidationError with name error when name is empty", () => {
    expect(() => ClientEntity.validate(validInput({ name: "" }))).toThrow(
      ValidationError,
    );
    try {
      ClientEntity.validate(validInput({ name: "" }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["name"]).toBeDefined();
    }
  });

  it("should throw ValidationError with name error when name is only whitespace", () => {
    try {
      ClientEntity.validate(validInput({ name: "   " }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["name"]).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// CPF validation
// ---------------------------------------------------------------------------

describe("ClientEntity.validate — CPF", () => {
  it("should throw ValidationError with cpf error when CPF is invalid", () => {
    try {
      ClientEntity.validate(validInput({ cpf: "111.111.111-11" }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["cpf"]).toBeDefined();
    }
  });

  it("should throw ValidationError with cpf error when CPF has wrong length", () => {
    try {
      ClientEntity.validate(validInput({ cpf: "529.982.247" }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["cpf"]).toBeDefined();
    }
  });

  it("should throw ValidationError with cpf error when CPF has all same digits", () => {
    try {
      ClientEntity.validate(validInput({ cpf: "000.000.000-00" }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["cpf"]).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Email validation
// ---------------------------------------------------------------------------

describe("ClientEntity.validate — email", () => {
  it("should throw ValidationError with email error when email is empty", () => {
    try {
      ClientEntity.validate(validInput({ email: "" }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["email"]).toBeDefined();
    }
  });

  it("should throw ValidationError with email error when email format is invalid", () => {
    try {
      ClientEntity.validate(validInput({ email: "not-an-email" }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["email"]).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Phone validation
// ---------------------------------------------------------------------------

describe("ClientEntity.validate — phone", () => {
  it("should throw ValidationError with phone error when phone is too short", () => {
    try {
      ClientEntity.validate(validInput({ phone: "12345" }));
    } catch (e) {
      expect((e as ValidationError).fieldErrors["phone"]).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Address validation
// ---------------------------------------------------------------------------

describe("ClientEntity.validate — address", () => {
  it("should throw ValidationError when address is missing", () => {
    const input = validInput();
    // Cast to bypass TypeScript so we can simulate missing address at runtime
    (input as unknown as Record<string, unknown>)["address"] = undefined;
    try {
      ClientEntity.validate(input);
    } catch (e) {
      expect((e as ValidationError).fieldErrors["address"]).toBeDefined();
    }
  });

  it("should throw ValidationError with address.cep error when CEP is invalid", () => {
    try {
      ClientEntity.validate(
        validInput({ address: { ...validAddress, cep: "0000" } }),
      );
    } catch (e) {
      expect((e as ValidationError).fieldErrors["address.cep"]).toBeDefined();
    }
  });

  it("should throw ValidationError with address.street error when street is empty", () => {
    try {
      ClientEntity.validate(
        validInput({ address: { ...validAddress, street: "" } }),
      );
    } catch (e) {
      expect((e as ValidationError).fieldErrors["address.street"]).toBeDefined();
    }
  });

  it("should throw ValidationError with address.state error when state is not 2 chars", () => {
    try {
      ClientEntity.validate(
        validInput({ address: { ...validAddress, state: "SPX" } }),
      );
    } catch (e) {
      expect((e as ValidationError).fieldErrors["address.state"]).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// toApiPayload
// ---------------------------------------------------------------------------

describe("ClientEntity.toApiPayload", () => {
  it("should return a payload matching the CreateClientPayload shape", () => {
    const entity = ClientEntity.validate(validInput());
    const payload = entity.toApiPayload();

    expect(payload).toMatchObject({
      name: "Maria da Silva",
      email: "maria@example.com",
    });
    expect(payload.cpf).toBeDefined();
    expect(payload.phone).toBeDefined();
    expect(payload.address).toBeDefined();
  });
});
