/**
 * ValidationError is thrown by domain entities and use-cases when input
 * fails validation. Each field with an error has an entry in `fieldErrors`.
 *
 * No personal data should appear in the error messages — only field names
 * and generic format indicators.
 */
export class ValidationError extends Error {
  readonly fieldErrors: Record<string, string>;

  constructor(fieldErrors: Record<string, string>) {
    super("Validation failed");
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }
}
