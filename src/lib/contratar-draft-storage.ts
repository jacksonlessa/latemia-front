/**
 * Utilitário para persistência do rascunho do wizard de contratação em sessionStorage.
 *
 * LGPD: este módulo apenas grava localmente na sessão do navegador; nenhum dado
 * pessoal é logado ou transmitido para serviços externos.
 *
 * SSR-safe: todas as funções verificam `typeof window === 'undefined'` antes de
 * acessar o sessionStorage, garantindo compatibilidade com o runtime do servidor
 * (Next.js).
 */

import type { RegisterClientInput } from '@/lib/types/client';
import type { RegisterPetInput } from '@/lib/types/pet';

const KEY = 'latemia:contratar:draft:v1';

/** Subconjunto persistível do ContratarState (exclui fieldErrors, summary e isSubmitting). */
export interface ContratarDraft {
  step: 0 | 1 | 2 | 3;
  client: Partial<RegisterClientInput>;
  pets: Array<Partial<RegisterPetInput> & { _id: string }>;
  contractAccepted: boolean;
  contractAcceptedAt: string | null;
}

/**
 * Lê o rascunho do sessionStorage.
 * Retorna `null` em ambiente SSR, se a chave não existir ou se o JSON for inválido.
 */
export function loadDraft(): ContratarDraft | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ContratarDraft;
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
  sessionStorage.setItem(KEY, JSON.stringify(draft));
}

/**
 * Remove o rascunho do sessionStorage.
 * Silencia em ambiente SSR.
 */
export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(KEY);
}
