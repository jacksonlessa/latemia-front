/** Role of an internal user in the admin panel. */
export type Role = "admin" | "atendente";

/**
 * Lightweight row representation returned by the list endpoint.
 * CPF and phone are pre-masked by the backend.
 */
export interface InternalUserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  phoneMasked: string;
  cpfMasked: string;
  createdAt: string;
  /** ISO 8601 timestamp or null if the user has never logged in. */
  lastLoginAt: string | null;
  /** ISO 8601 timestamp or null if the user is active (soft-delete field). */
  deletedAt: string | null;
}

/**
 * Full detail object returned by GET /v1/users/:id.
 * Contains raw (unmasked) CPF and phone for use in edit forms.
 */
export interface InternalUserDetail {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  cpf: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  deletedAt: string | null;
}

/** Paginated response wrapper for the users list endpoint. */
export interface PaginatedInternalUsers {
  data: InternalUserRow[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Payload for POST /v1/users. */
export interface CreateInternalUserInput {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  role: Role;
  password: string;
}

/** Payload for PATCH /v1/users/:id. All fields optional. */
export interface UpdateInternalUserInput {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  role?: Role;
  /** Provide only when the user explicitly wants to change the password. */
  password?: string;
}

/** Query parameters accepted by listUsers. */
export interface ListInternalUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive";
  role?: Role;
}
