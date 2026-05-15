/**
 * Tabela vigente do Clube de Vantagens (Contrato §2.2.2).
 *
 * Source-of-truth da página pública /beneficios — consumido também como
 * referência semântica nos TERMOS (latemia-front/src/content/contrato.ts).
 *
 * O slug público da URL é amigável (/beneficios), porém as constantes
 * exportadas e o termo exibido na página seguem o termo contratual
 * "Clube de Vantagens" da Cláusula §2.2.2.
 *
 * REGRAS DE ALTERAÇÃO:
 *   - Inclusões e aumentos de percentual: publicar livremente (sem aviso
 *     prévio) — entram em vigor imediatamente após o deploy.
 *   - Reduções de percentual ou exclusões: disparam comunicação prévia de
 *     30 dias a todos os clientes ativos (status em {carencia, ativo,
 *     inadimplente}) via /admin/configuracoes/clube-vantagens, conforme
 *     regra assimétrica da Cláusula §2.2.2.
 *
 * PROCESSO DE BUMP (obrigatório a cada alteração):
 *   1. Bumpar CLUBE_VANTAGENS_VERSION (vX.Y → vX.(Y+1) ou v(X+1).0)
 *   2. Atualizar CLUBE_VANTAGENS_EFFECTIVE_DATE para a data de entrada
 *      em vigor (ISO YYYY-MM-DD)
 *   3. Abrir PR + deploy
 *   4. Após deploy, disparar a comunicação no admin (quando a alteração
 *      configurar redução ou exclusão)
 *
 * NOTA SOBRE SINCRONIA: o módulo de uso do benefício (`benefit-usages`)
 * lê percentuais de fonte distinta (system-settings/hardcoded). Esta
 * tabela é apenas a vitrine pública contratual — qualquer alteração aqui
 * deve ser refletida manualmente na fonte interna até que o acoplamento
 * seja entregue em release futura.
 */

/**
 * Versão vigente da tabela do Clube de Vantagens. Exibida ao usuário na
 * página /beneficios em formato "vX.Y — DD/MM/AAAA". NUNCA alterar sem
 * seguir o PROCESSO DE BUMP descrito no topo do arquivo.
 */
export const CLUBE_VANTAGENS_VERSION = 'v1.0';

/**
 * Data de entrada em vigor desta versão da tabela (ISO YYYY-MM-DD).
 */
export const CLUBE_VANTAGENS_EFFECTIVE_DATE = '2026-05-15';

/**
 * Item da tabela vigente do Clube de Vantagens.
 *  - `procedimento`: nome do procedimento conforme texto contratual.
 *  - `percentual`: desconto aplicado, em pontos percentuais (ex.: 30 = 30%).
 */
export interface ClubeVantagensItem {
  procedimento: string;
  percentual: number;
}

/**
 * Lista de procedimentos contemplados pelo Clube de Vantagens na versão
 * vigente. A ordem desta lista é a ordem de exibição na página pública.
 */
export const CLUBE_VANTAGENS_ITENS: ClubeVantagensItem[] = [
  { procedimento: 'Microchipagem', percentual: 30 },
  { procedimento: 'Consultas eletivas e de especialidades', percentual: 30 },
  { procedimento: 'Exames de sangue laboratoriais', percentual: 10 },
  { procedimento: 'Exames de imagem (Raio-X e Ultrassom)', percentual: 5 },
  { procedimento: 'Cirurgias eletivas', percentual: 10 },
];

/**
 * Notas obrigatórias da Cláusula §2.2.2 dos TERMOS. Devem ser exibidas
 * integralmente na página pública, abaixo da tabela.
 */
export const CLUBE_VANTAGENS_NOTAS: string[] = [
  'Não cumulativos com outras promoções da Dr. Cleitinho.',
  'Aplicam-se exclusivamente a serviços prestados pela CLÍNICA.',
  'Não abrangem serviços terceirizados.',
];
