/**
 * Utilitários de sessão — lado servidor (Server Components / Route Handlers).
 * O token JWT é armazenado em cookie httpOnly; nunca exposto ao JS do cliente.
 */

export const SESSION_COOKIE = "latemia_session";

export interface SessionUser {
  id: string;
  email: string;
  role: "admin" | "atendente";
}
