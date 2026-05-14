/**
 * Cidades atualmente atendidas pela Dr. Cleitinho.
 *
 * A lista é mantida em forma canônica normalizada (sem acentos, em lowercase)
 * para comparações simétricas com a entrada do usuário.
 *
 * IMPORTANTE: esta lista é espelho do backend em
 * `latemia-back/src/clients/serviced-cities.ts`.
 * Qualquer alteração aqui DEVE ser refletida lá. Veja PRD `ajustes-passo-a`,
 * decisão de manter cidades hardcoded em ambos os lados.
 */
export const SERVICED_CITIES = [
  'camboriu',
  'balneario camboriu',
  'itapema',
  'itajai',
] as const;

/**
 * Normaliza um nome de cidade para a forma canônica utilizada na comparação:
 * remove diacríticos (NFD), aplica lowercase, descarta espaços nas bordas e
 * colapsa espaços internos múltiplos.
 */
export function normalizeCityName(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Retorna `true` se o nome informado corresponde a uma cidade atendida pela
 * Dr. Cleitinho. Aceita variações de caixa, acentuação e espaços extras nas
 * bordas. Entradas vazias, `null` ou `undefined` retornam `false`.
 */
export function isServicedCity(input: string | null | undefined): boolean {
  if (!input) return false;
  return (SERVICED_CITIES as readonly string[]).includes(
    normalizeCityName(input),
  );
}
