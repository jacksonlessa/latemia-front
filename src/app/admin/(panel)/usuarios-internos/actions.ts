"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import {
  createInternalUser,
  deactivateInternalUser,
  getInternalUser,
  reactivateInternalUser,
  updateInternalUser,
} from "@/lib/api-server";
import { ApiError } from "@/lib/api-errors";
import { SESSION_COOKIE } from "@/lib/session";
import type { InternalUserDetail, Role } from "@/lib/types/internal-users";

// ---------------------------------------------------------------------------
// ActionResult type
// ---------------------------------------------------------------------------

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; code: string; message: string; fieldErrors?: Record<string, string>; submittedValues?: Record<string, string> };

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

function unauthenticated<T = void>(): ActionResult<T> {
  return {
    ok: false,
    code: "UNAUTHENTICATED",
    message: "Sessão expirada",
  };
}

/**
 * Maps backend error codes to field-level error objects so the UI can
 * highlight the problematic input.
 */
function mapApiError<T = void>(err: ApiError): ActionResult<T> {
  // If the backend already sent fieldErrors, forward them directly.
  const base = { ok: false as const, code: err.code, message: err.message };

  switch (err.code) {
    case "INVALID_CPF":
      return { ...base, fieldErrors: { cpf: "CPF inválido." } };
    case "INVALID_PHONE":
      return { ...base, fieldErrors: { phone: "Telefone inválido." } };
    case "INVALID_PASSWORD":
      return { ...base, fieldErrors: { password: "Senha deve ter ao menos 8 caracteres." } };
    case "INVALID_NAME":
      return { ...base, fieldErrors: { name: "Nome inválido." } };
    case "INVALID_ROLE":
      return { ...base, fieldErrors: { role: "Papel inválido." } };
    case "DUPLICATE_ACTIVE":
      // Split into two fields intentionally — better UX than a single combined message.
      return {
        ...base,
        fieldErrors: { email: "E-mail já em uso.", cpf: "CPF já em uso." },
      };
    case "LAST_ADMIN":
      return {
        ...base,
        fieldErrors: { role: "Não é possível remover o último admin." },
      };
    case "SELF_DEACTIVATE":
      return {
        ...base,
        fieldErrors: { form: "Não é possível desativar sua própria conta." },
      };
    case "REACTIVATE_CONFLICT":
      return {
        ...base,
        fieldErrors: { form: "Conflito ao reativar usuário." },
      };
    default:
      return err.fieldErrors ? { ...base, fieldErrors: err.fieldErrors } : base;
  }
}

function handleUnknownError<T = void>(err: unknown): ActionResult<T> {
  if (err instanceof ApiError) return mapApiError(err) as ActionResult<T>;
  return {
    ok: false,
    code: "NETWORK",
    message: "Erro de comunicação com o servidor. Tente novamente.",
  };
}

const VALID_ROLES: Role[] = ["admin", "atendente"];

function isValidRole(value: string): value is Role {
  return (VALID_ROLES as string[]).includes(value);
}

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * Creates a new internal user.
 * Compatible with React's `useActionState` hook (prevState as first arg).
 */
export async function createInternalUserAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult<InternalUserDetail>> {
  const token = await getToken();
  if (!token) return unauthenticated<InternalUserDetail>();

  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const phone = (formData.get("phone") as string | null)?.trim() ?? "";
  const cpf = (formData.get("cpf") as string | null)?.trim() ?? "";
  const rawRole = (formData.get("role") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  const submittedValues = { name, email, phone, cpf, role: rawRole };

  if (!isValidRole(rawRole)) {
    return {
      ok: false,
      code: "INVALID_ROLE",
      message: "Papel inválido",
      fieldErrors: { role: "Papel inválido" },
      submittedValues,
    };
  }

  try {
    const data = await createInternalUser(token, {
      name,
      email,
      phone,
      cpf,
      role: rawRole,
      password,
    });

    revalidatePath("/admin/usuarios-internos");
    return { ok: true, data };
  } catch (err) {
    const result = handleUnknownError<InternalUserDetail>(err);
    return result.ok ? result : { ...result, submittedValues };
  }
}

/**
 * Updates an existing internal user.
 * `id` is bound via `.bind(null, id)` on the call site.
 * Compatible with React's `useActionState` hook.
 */
export async function updateInternalUserAction(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult<InternalUserDetail>> {
  const token = await getToken();
  if (!token) return unauthenticated<InternalUserDetail>();

  const name = (formData.get("name") as string | null)?.trim() || undefined;
  const email = (formData.get("email") as string | null)?.trim() || undefined;
  const phone = (formData.get("phone") as string | null)?.trim() || undefined;
  const cpf = (formData.get("cpf") as string | null)?.trim() || undefined;
  const rawRole = (formData.get("role") as string | null)?.trim() || undefined;
  // Empty password means "do not change" — omit from payload. No trim: preserve user intent.
  const password =
    (formData.get("password") as string | null) || undefined;

  const submittedValues: Record<string, string> = {};
  if (name) submittedValues.name = name;
  if (email) submittedValues.email = email;
  if (phone) submittedValues.phone = phone;
  if (cpf) submittedValues.cpf = cpf;
  if (rawRole) submittedValues.role = rawRole;

  if (rawRole !== undefined && !isValidRole(rawRole)) {
    return {
      ok: false,
      code: "INVALID_ROLE",
      message: "Papel inválido",
      fieldErrors: { role: "Papel inválido" },
      submittedValues,
    };
  }

  try {
    const data = await updateInternalUser(token, id, {
      name,
      email,
      phone,
      cpf,
      role: rawRole as Role | undefined,
      password,
    });

    revalidatePath("/admin/usuarios-internos");
    return { ok: true, data };
  } catch (err) {
    const result = handleUnknownError<InternalUserDetail>(err);
    return result.ok ? result : { ...result, submittedValues };
  }
}

/**
 * Soft-deletes (deactivates) an internal user.
 */
export async function deactivateInternalUserAction(
  id: string,
): Promise<ActionResult> {
  const token = await getToken();
  if (!token) return unauthenticated();

  try {
    await deactivateInternalUser(token, id);
    revalidatePath("/admin/usuarios-internos");
    return { ok: true };
  } catch (err) {
    return handleUnknownError<void>(err);
  }
}

/**
 * Reactivates a previously deactivated internal user.
 * Idempotent: the backend returns HTTP 200 with user detail when the user is
 * already active, so no special-case guard is needed here.
 */
export async function reactivateInternalUserAction(
  id: string,
): Promise<ActionResult<InternalUserDetail>> {
  const token = await getToken();
  if (!token) return unauthenticated<InternalUserDetail>();

  try {
    const data = await reactivateInternalUser(token, id);
    revalidatePath("/admin/usuarios-internos");
    return { ok: true, data };
  } catch (err) {
    return handleUnknownError<InternalUserDetail>(err);
  }
}

/**
 * Fetches the full detail of an internal user by id.
 * Exposed as a Server Action so Client Components can call it without
 * importing the server-only `api-server` module directly.
 */
export async function getInternalUserAction(
  id: string,
): Promise<ActionResult<InternalUserDetail>> {
  const token = await getToken();
  if (!token) return unauthenticated<InternalUserDetail>();

  try {
    const data = await getInternalUser(token, id);
    return { ok: true, data };
  } catch (err) {
    return handleUnknownError<InternalUserDetail>(err);
  }
}
