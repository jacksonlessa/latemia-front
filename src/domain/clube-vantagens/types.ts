/**
 * Tipos compartilhados pelos use-cases do módulo Clube de Vantagens (admin).
 *
 * Espelham as interfaces expostas pelo backend em
 * `latemia-back/src/clube-vantagens/interfaces/clube-vantagens.interfaces.ts`,
 * porém são declarados localmente para evitar acoplamento de build entre os
 * dois repositórios.
 *
 * Convenções de nomenclatura seguem o termo contratual "Clube de Vantagens"
 * (Cláusula §2.2.2). O slug público da URL (`/beneficios`) NÃO é refletido
 * nestes tipos — eles modelam a API administrativa.
 */

/**
 * Tipos de mudança suportados na Tabela do Clube de Vantagens.
 *
 *  - `inclusao_ou_aumento` — novo item ou aumento de percentual (publicação
 *    imediata; comunicação opcional, decisão operacional do admin).
 *  - `reducao_ou_exclusao` — redução de percentual ou exclusão de item
 *    (exige aviso prévio de 30 dias por força contratual).
 *
 * A validação de janela D+30 é uniforme no backend — independente do tipo,
 * o admin não deve registrar alteração com janela menor que 30 dias para
 * preservar trilha de auditoria consistente.
 */
export type TipoMudancaClubeVantagens =
  | 'inclusao_ou_aumento'
  | 'reducao_ou_exclusao';

/**
 * Payload de submissão do formulário admin "Registrar alteração".
 *
 * `effectiveDate` é uma string ISO (YYYY-MM-DD); a validação de janela
 * acontece tanto client-side (UX rápida) quanto server-side (regra de
 * negócio autoritativa).
 */
export interface RegistrarAlteracaoInput {
  versionFrom: string;
  versionTo: string;
  effectiveDate: string;
  resumoAlteracoes: string;
  tipoMudanca: TipoMudancaClubeVantagens;
}

/**
 * Registro retornado pela API após o disparo (POST) e por item na listagem
 * (GET). Todos os campos vêm como string ISO/UTC do backend — a formatação
 * para pt-BR fica a cargo dos componentes de apresentação.
 */
export interface AlteracaoClubeVantagens {
  id: string;
  versionFrom: string;
  versionTo: string;
  effectiveDate: string;
  tipoMudanca: TipoMudancaClubeVantagens;
  resumoAlteracoes: string;
  dispatchedBy: string;
  dispatchedAt: string;
  totalClientesAlvo: number;
  notificacoesEnviadas: number;
  notificacoesFalhas: number;
}
