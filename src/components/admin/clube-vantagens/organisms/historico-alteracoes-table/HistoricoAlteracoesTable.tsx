'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  AlteracaoClubeVantagens,
  TipoMudancaClubeVantagens,
} from '@/domain/clube-vantagens/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface HistoricoAlteracoesTableProps {
  items: AlteracaoClubeVantagens[];
  isLoading: boolean;
  /**
   * Mensagem de erro vinda do orchestrator quando a listagem falha. Quando
   * presente substitui o conteúdo padrão da tabela por um banner inline.
   */
  errorMessage?: string | null;
}

// ---------------------------------------------------------------------------
// Helpers de formatação
// ---------------------------------------------------------------------------

const dateOnlyFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
});
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return dateOnlyFormatter.format(d);
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return dateTimeFormatter.format(d);
}

function formatTipo(tipo: TipoMudancaClubeVantagens): string {
  return tipo === 'inclusao_ou_aumento'
    ? 'Inclusão ou aumento'
    : 'Redução ou exclusão';
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

/**
 * Organism — `HistoricoAlteracoesTable`.
 *
 * Renderiza o histórico de alterações da Tabela do Clube de Vantagens
 * ordenado por `dispatchedAt DESC` (mais recente primeiro). A ordenação é
 * garantida pelo backend — este componente não reordena.
 *
 * Estados suportados:
 *  - `loading` — exibe spinner;
 *  - `error` (via `errorMessage`) — exibe banner inline;
 *  - `empty` — mensagem amigável quando ainda não houve alterações;
 *  - `populated` — tabela com colunas: Versão (de → para), Data efetiva,
 *    Tipo, Disparado em, Enviados/Total, Falhas.
 *
 * O componente é puramente apresentacional — a busca e tratamento de erros
 * fica a cargo do orchestrator (page client).
 */
export function HistoricoAlteracoesTable({
  items,
  isLoading,
  errorMessage,
}: HistoricoAlteracoesTableProps) {
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Carregando histórico…
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div
        role="alert"
        className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
      >
        <AlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0"
          aria-hidden="true"
        />
        <span>{errorMessage}</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center text-sm text-muted-foreground">
        Nenhuma alteração registrada ainda. Quando você registrar a primeira,
        ela aparecerá aqui.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-100">
      <Table aria-label="Histórico de alterações do Clube de Vantagens">
        <TableHeader>
          <TableRow>
            <TableHead>Versão</TableHead>
            <TableHead>Data efetiva</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Disparado em</TableHead>
            <TableHead className="text-right">Enviados/Total</TableHead>
            <TableHead className="text-right">Falhas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                <span>{item.versionFrom}</span>
                <span aria-hidden="true" className="mx-1 text-muted-foreground">
                  →
                </span>
                <span>{item.versionTo}</span>
              </TableCell>
              <TableCell>{formatDate(item.effectiveDate)}</TableCell>
              <TableCell>
                <span
                  className={
                    item.tipoMudanca === 'reducao_ou_exclusao'
                      ? 'inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900'
                      : 'inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900'
                  }
                >
                  {formatTipo(item.tipoMudanca)}
                </span>
              </TableCell>
              <TableCell>{formatDateTime(item.dispatchedAt)}</TableCell>
              <TableCell className="text-right tabular-nums">
                {item.notificacoesEnviadas}/{item.totalClientesAlvo}
              </TableCell>
              <TableCell
                className={
                  item.notificacoesFalhas > 0
                    ? 'text-right tabular-nums text-amber-700'
                    : 'text-right tabular-nums text-muted-foreground'
                }
              >
                {item.notificacoesFalhas}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
