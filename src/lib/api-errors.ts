/**
 * Represents a structured error returned by the LateMia backend API.
 *
 * The backend emits `{ code, message }` in error response bodies.
 * HTTP helpers map those to this class before throwing.
 */
export class ApiError extends Error {
  /** HTTP status code (e.g. 400, 409, 422). */
  readonly status: number;
  /** Machine-readable error code from the backend (e.g. "DUPLICATE_ACTIVE"). */
  readonly code: string;
  /** Per-field validation errors, keyed by field name. */
  readonly fieldErrors?: Record<string, string>;

  constructor(
    status: number,
    code: string,
    message: string,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}
