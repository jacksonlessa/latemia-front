"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  ListNotificationBufferQuery,
  NotificationBufferEntryDto,
  NotificationBufferListResponse,
  NotificationBufferReason,
  NotificationBufferStatus,
  NotificationEventType,
} from "@/lib/types/notifications";

type ListAction = (
  query: ListNotificationBufferQuery,
) => Promise<
  | { success: true; data: NotificationBufferListResponse }
  | { success: false; error: { code: string; message: string } }
>;

interface NotificationBufferTableProps {
  initialData: NotificationBufferListResponse | null;
  initialError?: string | null;
  listAction: ListAction;
}

const STATUS_LABEL: Record<NotificationBufferStatus, string> = {
  pending: "Pendente",
  sent: "Enviado",
  discarded: "Descartado",
};

const REASON_LABEL: Record<NotificationBufferReason, string> = {
  quiet_hours: "Janela de silêncio",
  provider_failure: "Falha no provider",
};

const EVENT_LABEL: Record<NotificationEventType, string> = {
  "plan.created": "Plano criado",
  "plan.statusChanged": "Status alterado",
  "plan.paymentFailed": "Falha no pagamento",
  "plan.renewed": "Plano renovado",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  } catch {
    return value;
  }
}

export function NotificationBufferTable({
  initialData,
  initialError,
  listAction,
}: NotificationBufferTableProps) {
  const [items, setItems] = useState<NotificationBufferEntryDto[]>(
    initialData?.items ?? [],
  );
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialData?.nextCursor ?? null,
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialError ?? null,
  );
  const [isPending, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogEntry, setDialogEntry] =
    useState<NotificationBufferEntryDto | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  function buildQuery(cursor?: string | null): ListNotificationBufferQuery {
    const q: ListNotificationBufferQuery = { limit: 20 };
    if (statusFilter !== "all")
      q.status = statusFilter as NotificationBufferStatus;
    if (reasonFilter !== "all")
      q.reason = reasonFilter as NotificationBufferReason;
    if (cursor) q.cursor = cursor;
    return q;
  }

  // Refetch when filters change.
  useEffect(() => {
    startTransition(async () => {
      setErrorMessage(null);
      const result = await listAction(buildQuery());
      if (result.success) {
        setItems(result.data.items);
        setNextCursor(result.data.nextCursor);
      } else {
        setErrorMessage(
          result.error.message || "Erro ao carregar buffer de notificações.",
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, reasonFilter]);

  function loadMore() {
    if (!nextCursor) return;
    startTransition(async () => {
      const result = await listAction(buildQuery(nextCursor));
      if (result.success) {
        setItems((prev) => [...prev, ...result.data.items]);
        setNextCursor(result.data.nextCursor);
      } else {
        setErrorMessage(
          result.error.message || "Erro ao carregar mais entradas.",
        );
      }
    });
  }

  async function openMessage(entry: NotificationBufferEntryDto) {
    setDialogOpen(true);
    setDialogError(null);

    if (entry.text !== undefined) {
      setDialogEntry(entry);
      return;
    }

    setDialogLoading(true);
    setDialogEntry(entry);
    const result = await listAction({
      includeText: true,
      limit: 50,
      status:
        statusFilter !== "all"
          ? (statusFilter as NotificationBufferStatus)
          : undefined,
      reason:
        reasonFilter !== "all"
          ? (reasonFilter as NotificationBufferReason)
          : undefined,
    });
    setDialogLoading(false);
    if (result.success) {
      const found = result.data.items.find((i) => i.id === entry.id);
      if (found) {
        setDialogEntry(found);
      } else {
        setDialogError(
          "Mensagem não encontrada no buffer atual (pode ter sido enviada).",
        );
      }
    } else {
      setDialogError(
        result.error.message || "Não foi possível carregar a mensagem.",
      );
    }
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
        <div className="flex-1 space-y-1">
          <label
            htmlFor="buffer-status"
            className="text-xs font-medium text-[#6B6B6E]"
          >
            Status
          </label>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
            disabled={isPending}
          >
            <SelectTrigger id="buffer-status" aria-label="Filtrar por status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="sent">Enviado</SelectItem>
              <SelectItem value="discarded">Descartado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-1">
          <label
            htmlFor="buffer-reason"
            className="text-xs font-medium text-[#6B6B6E]"
          >
            Motivo
          </label>
          <Select
            value={reasonFilter}
            onValueChange={setReasonFilter}
            disabled={isPending}
          >
            <SelectTrigger id="buffer-reason" aria-label="Filtrar por motivo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="quiet_hours">Janela de silêncio</SelectItem>
              <SelectItem value="provider_failure">
                Falha no provider
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-md bg-red-50 px-4 py-3 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-gray-100">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Enviado em</TableHead>
              <TableHead>Tentativas</TableHead>
              <TableHead aria-label="Ações"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && !isPending && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-sm text-[#6B6B6E]"
                >
                  Nenhuma entrada encontrada.
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{EVENT_LABEL[item.type] ?? item.type}</TableCell>
                <TableCell>{STATUS_LABEL[item.status]}</TableCell>
                <TableCell>{REASON_LABEL[item.reason]}</TableCell>
                <TableCell>{formatDate(item.createdAt)}</TableCell>
                <TableCell>{formatDate(item.sentAt)}</TableCell>
                <TableCell>{item.attempts}</TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openMessage(item)}
                  >
                    Ver mensagem
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-[#6B6B6E]" aria-live="polite">
          {isPending ? "Carregando..." : `${items.length} entradas listadas`}
        </span>
        {nextCursor && (
          <Button
            type="button"
            variant="outline"
            onClick={loadMore}
            disabled={isPending}
          >
            Carregar mais
          </Button>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mensagem da notificação</DialogTitle>
            <DialogDescription>
              {dialogEntry
                ? `${EVENT_LABEL[dialogEntry.type] ?? dialogEntry.type} • ${formatDate(dialogEntry.createdAt)}`
                : "Detalhes da notificação"}
            </DialogDescription>
          </DialogHeader>
          {dialogLoading && (
            <p className="text-sm text-[#6B6B6E]" role="status">
              Carregando mensagem...
            </p>
          )}
          {dialogError && (
            <p className="text-sm text-destructive" role="alert">
              {dialogError}
            </p>
          )}
          {!dialogLoading && !dialogError && dialogEntry?.text && (
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-xs text-[#2C2C2E]">
              {dialogEntry.text}
            </pre>
          )}
          {!dialogLoading && !dialogError && dialogEntry && !dialogEntry.text && (
            <p className="text-sm text-[#6B6B6E]">
              Texto não disponível para esta entrada.
            </p>
          )}
          {dialogEntry?.lastError && (
            <div className="rounded-md bg-red-50 p-3 text-xs text-destructive">
              <strong>Último erro:</strong> {dialogEntry.lastError}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
