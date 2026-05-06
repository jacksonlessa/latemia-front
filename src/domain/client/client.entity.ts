/**
 * Client domain entity.
 *
 * Validates input and normalises data before it reaches the API.
 * Throws ValidationError (with per-field errors) for invalid input.
 * No personal data is included in error messages — only field names
 * and generic format indicators are used.
 */

import type {
  AddressData,
  CreateClientPayload,
  RegisterClientInput,
  Touchpoint,
} from "@/lib/types/client";
import { ValidationError } from "@/lib/validation-error";

// Re-export ValidationError so existing callers importing from this module
// continue to work without changes.
export { ValidationError };

// ---------------------------------------------------------------------------
// Internal helpers — no personal data leaves these functions
// ---------------------------------------------------------------------------

/** Strips all non-digit characters from a string. */
function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Validates CPF check digits.
 * Accepts CPF strings with or without mask ("999.999.999-99" or "99999999999").
 * Returns the canonical masked form on success, or null if invalid.
 */
function validateCpf(raw: string): string | null {
  const digits = digitsOnly(raw);
  if (digits.length !== 11) return null;

  // Reject trivially invalid sequences (all same digit)
  if (/^(\d)\1{10}$/.test(digits)) return null;

  // First check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i], 10) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[9], 10)) return null;

  // Second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i], 10) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[10], 10)) return null;

  // Return canonical masked form
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/** Basic e-mail format check. */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Validates Brazilian phone numbers (10 or 11 digits). */
function isValidPhone(phone: string): boolean {
  const digits = digitsOnly(phone);
  return digits.length === 10 || digits.length === 11;
}

/** Returns digits-only phone string. */
function normalisePhone(phone: string): string {
  return digitsOnly(phone);
}

/** Validates address — all required fields present and CEP has 8 digits. */
function validateAddress(
  address: AddressData,
): Record<string, string> | null {
  const errors: Record<string, string> = {};
  if (!address.cep || digitsOnly(address.cep).length !== 8) {
    errors["address.cep"] = "CEP inválido";
  }
  if (!address.street?.trim()) {
    errors["address.street"] = "Rua é obrigatória";
  }
  if (!address.number?.trim()) {
    errors["address.number"] = "Número é obrigatório";
  }
  if (!address.city?.trim()) {
    errors["address.city"] = "Cidade é obrigatória";
  }
  if (!address.state?.trim() || address.state.trim().length !== 2) {
    errors["address.state"] = "Estado inválido";
  }
  return Object.keys(errors).length > 0 ? errors : null;
}

// ---------------------------------------------------------------------------
// ClientEntity
// ---------------------------------------------------------------------------

export class ClientEntity {
  private constructor(
    /** Full name — trimmed. */
    public readonly name: string,
    /** Canonical masked CPF: "000.000.000-00". */
    public readonly cpf: string,
    /** Digits-only phone (10 or 11 digits). */
    public readonly phone: string,
    /** Lower-cased, trimmed e-mail. */
    public readonly email: string,
    public readonly address: AddressData,
  ) {}

  /**
   * Validates the raw input and returns a ClientEntity on success.
   * Throws ValidationError with per-field errors on failure.
   *
   * @param input - Raw user input from the registration form.
   */
  static validate(input: RegisterClientInput): ClientEntity {
    const errors: Record<string, string> = {};

    // Name
    if (!input.name?.trim()) {
      errors["name"] = "Nome é obrigatório";
    }

    // CPF
    const canonicalCpf = validateCpf(input.cpf ?? "");
    if (!canonicalCpf) {
      errors["cpf"] = "CPF inválido";
    }

    // Phone
    if (!isValidPhone(input.phone ?? "")) {
      errors["phone"] = "Telefone inválido";
    }

    // Email
    if (!input.email?.trim() || !isValidEmail(input.email.trim())) {
      errors["email"] = "E-mail inválido";
    }

    // Address
    if (!input.address) {
      errors["address"] = "Endereço é obrigatório";
    } else {
      const addressErrors = validateAddress(input.address);
      if (addressErrors) {
        Object.assign(errors, addressErrors);
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    return new ClientEntity(
      input.name.trim(),
      // canonicalCpf is guaranteed non-null here (errors would have thrown)
      canonicalCpf!,
      normalisePhone(input.phone),
      input.email.trim().toLowerCase(),
      {
        cep: digitsOnly(input.address.cep),
        street: input.address.street.trim(),
        number: input.address.number.trim(),
        complement: input.address.complement?.trim(),
        neighborhood: input.address.neighborhood?.trim(),
        city: input.address.city.trim(),
        state: input.address.state.trim().toUpperCase(),
      },
    );
  }

  /**
   * Returns the payload to be sent to POST /v1/register/client.
   *
   * The optional `touchpoints` bundle is included only when at least one of
   * `first`/`last` is defined. We never emit `null`/`undefined` values to the
   * wire — backend DTO uses `@IsOptional`, so omitting the field is the safe
   * contract (PRD seo-analytics-lgpd-utm §1.7 — task 7.0).
   */
  toApiPayload(touchpoints?: {
    first?: Touchpoint;
    last?: Touchpoint;
  }): CreateClientPayload {
    const payload: CreateClientPayload = {
      name: this.name,
      cpf: this.cpf,
      phone: this.phone,
      email: this.email,
      address: this.address,
    };

    if (touchpoints?.first || touchpoints?.last) {
      const bundle: { first?: Touchpoint; last?: Touchpoint } = {};
      if (touchpoints.first) bundle.first = touchpoints.first;
      if (touchpoints.last) bundle.last = touchpoints.last;
      payload.touchpoints = bundle;
    }

    return payload;
  }
}
