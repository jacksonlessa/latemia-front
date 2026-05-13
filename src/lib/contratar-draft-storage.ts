/**
 * Utilitário para persistência do rascunho do wizard de contratação em sessionStorage.
 *
 * LGPD: este módulo apenas grava localmente na sessão do navegador; nenhum dado
 * pessoal é logado ou transmitido para serviços externos. Os dois campos OTP
 * (`contractAttemptId` e `otpVerificationToken`) são opacos — não carregam PII
 * — então a sua persistência em sessionStorage não amplia o escopo de coleta.
 *
 * SSR-safe: todas as funções verificam `typeof window === 'undefined'` antes de
 * acessar o sessionStorage, garantindo compatibilidade com o runtime do servidor
 * (Next.js).
 *
 * Versionamento: o draft persistido carrega `version: 2`. Drafts em formato
 * antigo (v1) são descartados silenciosamente em `loadDraft`. A serialização
 * converte `birthDate` (Date) em string ISO; a desserialização rehidrata para
 * `Date`. Os campos `contractAttemptId` e `otpVerificationToken` são opcionais
 * — drafts gravados antes da Task 10.0 simplesmente não os trazem e são
 * tratados como `null`/`undefined` pelos consumidores.
 */

import type { RegisterClientInput } from '@/lib/types/client';
import type { RegisterPetInput } from '@/lib/types/pet';

const KEY = 'latemia:contratar:draft:v1';
const DRAFT_VERSION = 2;

/** Subconjunto persistível do ContratarState (exclui fieldErrors, summary e isSubmitting). */
export interface ContratarDraft {
  step: 0 | 1 | 2 | 3;
  client: Partial<RegisterClientInput>;
  pets: Array<RegisterPetInput & { _id: string }>;
  contractAccepted: boolean;
  contractAcceptedAt: string | null;
  /**
   * UUID v4 de correlação gerado pelo FE no clique de "Avançar" do passo 2
   * (quando `otp_contract_enabled === true`). Permite retomar o ciclo OTP
   * caso o usuário recarregue a página antes de completar a verificação.
   * Opaco (não-PII).
   */
  contractAttemptId?: string;
  /**
   * Token opaco emitido por `POST /v1/otp/contract/verify` após o cliente
   * digitar o código correto. Vive 5 min server-side; é consumido por
   * `POST /v1/register/contract`. Não-PII.
   */
  otpVerificationToken?: string;
}

/** Forma serializada (em sessionStorage). `birthDate` é string ISO. */
interface SerializedPet extends Omit<RegisterPetInput, 'birthDate'> {
  _id: string;
  birthDate: string;
}

interface SerializedDraft {
  version: number;
  step: 0 | 1 | 2 | 3;
  client: Partial<RegisterClientInput>;
  pets: SerializedPet[];
  contractAccepted: boolean;
  contractAcceptedAt: string | null;
  /** Opcional para tolerar drafts legados (gravados antes da Task 10.0). */
  contractAttemptId?: string;
  /** Opcional para tolerar drafts legados (gravados antes da Task 10.0). */
  otpVerificationToken?: string;
}

/**
 * Lê o rascunho do sessionStorage.
 * Retorna `null` em ambiente SSR, se a chave não existir, se o JSON for inválido
 * ou se a versão for diferente da atual (descarte silencioso de drafts v1).
 *
 * Os campos `contractAttemptId` / `otpVerificationToken` retornam `undefined`
 * quando ausentes — comportamento idêntico ao do draft legado.
 */
export function loadDraft(): ContratarDraft | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SerializedDraft;
    if (parsed.version !== DRAFT_VERSION) return null;
    return {
      step: parsed.step,
      client: parsed.client,
      pets: parsed.pets.map((p) => ({
        ...p,
        birthDate: new Date(p.birthDate),
      })),
      contractAccepted: parsed.contractAccepted,
      contractAcceptedAt: parsed.contractAcceptedAt,
      contractAttemptId: parsed.contractAttemptId,
      otpVerificationToken: parsed.otpVerificationToken,
    };
  } catch {
    return null;
  }
}

/**
 * Serializa e salva o rascunho no sessionStorage.
 * Silencia em ambiente SSR.
 */
export function saveDraft(draft: ContratarDraft): void {
  if (typeof window === 'undefined') return;
  const serialized: SerializedDraft = {
    version: DRAFT_VERSION,
    step: draft.step,
    client: draft.client,
    pets: draft.pets.map((p) => ({
      ...p,
      birthDate: p.birthDate.toISOString(),
    })),
    contractAccepted: draft.contractAccepted,
    contractAcceptedAt: draft.contractAcceptedAt,
    contractAttemptId: draft.contractAttemptId,
    otpVerificationToken: draft.otpVerificationToken,
  };
  sessionStorage.setItem(KEY, JSON.stringify(serialized));
}

/**
 * Remove o rascunho do sessionStorage.
 * Silencia em ambiente SSR.
 */
export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(KEY);
}
