/**
 * Date formatting utilities for Brazilian locale.
 */

/**
 * Formats an ISO date string as a full date in Brazilian Portuguese.
 *
 * @example
 * formatDateBR('2025-03-15T00:00:00.000Z') // "15 de março de 2025"
 *
 * @param iso - ISO 8601 date string
 * @returns Formatted date string in pt-BR with São Paulo timezone
 */
export function formatDateBR(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  });
}
