'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Check, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DuplicateAlteracaoError,
  EffectiveDateTooEarlyError,
  ForbiddenAlteracaoError,
  registrarAlteracaoClubeVantagensUseCase,
} from '@/domain/clube-vantagens/registrar-alteracao.use-case';
import type {
  AlteracaoClubeVantagens,
  TipoMudancaClubeVantagens,
} from '@/domain/clube-vantagens/types';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const VERSION_REGEX = /^v\d+\.\d+$/;
const RESUMO_MIN = 20;
const RESUMO_MAX = 1000;
const DIAS_MINIMOS_ANTECEDENCIA = 30;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface RegistrarAlteracaoFormProps {
  /** Chamado após registro bem-sucedido para refrescar o histórico. */
  onSuccess: (result: AlteracaoClubeVantagens) => void;
  /**
   * Versão "from" pré-preenchida (normalmente a versão vigente lida de
   * `CLUBE_VANTAGENS_VERSION`). Editável pelo admin.
   */
  defaultVersionFrom?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Formata o offset de D+30 em ISO YYYY-MM-DD para uso como `min` no
 * `<input type="date">`. Usa a data local do usuário (sem fuso) por ser o
 * comportamento esperado de date pickers em formulários administrativos.
 */
function minimumEffectiveDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + DIAS_MINIMOS_ANTECEDENCIA);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Converte uma string ISO YYYY-MM-DD em Date local 00:00. */
function parseLocalDate(iso: string): Date | null {
  const [y, m, d] = iso.split('-').map((p) => Number(p));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/**
 * Retorna `true` se `effectiveDate` (ISO YYYY-MM-DD) é ≥ hoje + 30 dias
 * em horário local. Usado apenas como gate de UX — a regra autoritativa
 * é validada no backend.
 */
function isEffectiveDateValid(effectiveDate: string): boolean {
  const target = parseLocalDate(effectiveDate);
  if (!target) return false;
  const min = parseLocalDate(minimumEffectiveDate());
  if (!min) return false;
  return target.getTime() >= min.getTime();
}

function mapErrorMessage(err: unknown): string {
  if (err instanceof EffectiveDateTooEarlyError) {
    return 'A data efetiva deve ser pelo menos 30 dias no futuro.';
  }
  if (err instanceof DuplicateAlteracaoError) {
    return 'Já existe alteração registrada para essa versão e data.';
  }
  if (err instanceof ForbiddenAlteracaoError) {
    return 'Apenas administradores podem registrar alterações da tabela.';
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return 'Ocorreu um erro inesperado. Tente novamente.';
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

/**
 * Organism — `RegistrarAlteracaoForm`.
 *
 * Formulário admin para registrar uma alteração da Tabela do Clube de
 * Vantagens. Aplica validações client-side (regex de versão, janela D+30,
 * tamanho do resumo) e exige confirmação dupla via checkbox antes de
 * habilitar o botão de submit.
 *
 * Fluxo de submit:
 *   1. Valida client-side e habilita o botão "Registrar e disparar
 *      comunicação".
 *   2. Em submit, gera um `Idempotency-Key` (UUID v4) reutilizado em retries.
 *   3. Em sucesso, limpa o formulário, exibe um banner de sumário e chama
 *      `onSuccess` para que o orchestrator atualize a listagem.
 *   4. Em erro, exibe mensagem inline tipada (400/409/403/genérico) sem
 *      limpar os campos para que o admin possa corrigir e tentar de novo.
 *
 * LGPD: nenhum campo PII é coletado; `resumoAlteracoes` é texto
 * editorial. O envio é fire-and-forget para o backend, que se encarrega
 * do fan-out por e-mail.
 */
export function RegistrarAlteracaoForm({
  onSuccess,
  defaultVersionFrom = '',
}: RegistrarAlteracaoFormProps) {
  const [versionFrom, setVersionFrom] = useState(defaultVersionFrom);
  const [versionTo, setVersionTo] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [tipoMudanca, setTipoMudanca] = useState<TipoMudancaClubeVantagens>(
    'inclusao_ou_aumento',
  );
  const [resumo, setResumo] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successSummary, setSuccessSummary] = useState<{
    versionTo: string;
    enviadas: number;
    total: number;
    falhas: number;
  } | null>(null);

  /**
   * Idempotency key gerada uma vez por sessão de formulário e reusada
   * em retries (preserva idempotência do backend).
   */
  const idempotencyKeyRef = useRef<string>('');
  useEffect(() => {
    idempotencyKeyRef.current = crypto.randomUUID();
  }, []);

  const minDate = useMemo(() => minimumEffectiveDate(), []);

  // ---------------------------------------------------------------------------
  // Validações de UX
  // ---------------------------------------------------------------------------

  const versionFromValid = VERSION_REGEX.test(versionFrom);
  const versionToValid = VERSION_REGEX.test(versionTo);
  const versionsDistinct = versionFrom !== versionTo;
  const dateValid = effectiveDate !== '' && isEffectiveDateValid(effectiveDate);
  const resumoLength = resumo.length;
  const resumoValid = resumoLength >= RESUMO_MIN && resumoLength <= RESUMO_MAX;

  const canSubmit =
    !submitting &&
    versionFromValid &&
    versionToValid &&
    versionsDistinct &&
    dateValid &&
    resumoValid &&
    acknowledged;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessSummary(null);

    try {
      const result = await registrarAlteracaoClubeVantagensUseCase({
        versionFrom,
        versionTo,
        effectiveDate,
        tipoMudanca,
        resumoAlteracoes: resumo,
        idempotencyKey: idempotencyKeyRef.current,
      });

      setSuccessSummary({
        versionTo: result.versionTo,
        enviadas: result.notificacoesEnviadas,
        total: result.totalClientesAlvo,
        falhas: result.notificacoesFalhas,
      });

      // Reseta o formulário para que um próximo registro seja seguro.
      setVersionTo('');
      setEffectiveDate('');
      setResumo('');
      setAcknowledged(false);
      // Gera nova chave de idempotência para a próxima alteração.
      idempotencyKeyRef.current = crypto.randomUUID();

      onSuccess(result);
    } catch (err) {
      setErrorMessage(mapErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      aria-label="Registrar alteração da Tabela do Clube de Vantagens"
      noValidate
    >
      {/* Aviso de impacto */}
      <div
        role="note"
        className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
      >
        <AlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
          aria-hidden="true"
        />
        <span>
          Esta ação envia e-mail a <strong>todos os clientes ativos</strong>{' '}
          (status <em>carência</em>, <em>ativo</em> ou <em>inadimplente</em>).
          A data efetiva precisa estar pelo menos 30 dias no futuro.
        </span>
      </div>

      {/* Versão de / para */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cv-version-from">
            Versão atual{' '}
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
          </Label>
          <Input
            id="cv-version-from"
            placeholder="v1.0"
            value={versionFrom}
            onChange={(e) => setVersionFrom(e.target.value.trim())}
            disabled={submitting}
            aria-invalid={versionFrom !== '' && !versionFromValid}
            aria-describedby="cv-version-from-hint"
            autoComplete="off"
          />
          <p
            id="cv-version-from-hint"
            className="text-xs text-muted-foreground"
          >
            Formato vMAJOR.MINOR (ex.: v1.0)
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cv-version-to">
            Nova versão{' '}
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
          </Label>
          <Input
            id="cv-version-to"
            placeholder="v1.1"
            value={versionTo}
            onChange={(e) => setVersionTo(e.target.value.trim())}
            disabled={submitting}
            aria-invalid={versionTo !== '' && !versionToValid}
            aria-describedby="cv-version-to-hint"
            autoComplete="off"
          />
          <p id="cv-version-to-hint" className="text-xs text-muted-foreground">
            Formato vMAJOR.MINOR (ex.: v1.1)
          </p>
        </div>
      </div>

      {versionFromValid &&
        versionToValid &&
        !versionsDistinct &&
        versionFrom !== '' && (
          <p
            role="alert"
            className="text-xs text-destructive"
            data-testid="cv-versions-equal-error"
          >
            A nova versão deve ser diferente da versão atual.
          </p>
        )}

      {/* Data efetiva + tipo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cv-effective-date">
            Data efetiva{' '}
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
          </Label>
          <Input
            id="cv-effective-date"
            type="date"
            min={minDate}
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            disabled={submitting}
            aria-invalid={effectiveDate !== '' && !dateValid}
            aria-describedby="cv-effective-date-hint"
          />
          <p
            id="cv-effective-date-hint"
            className="text-xs text-muted-foreground"
          >
            Mínimo: {minDate} (D+30)
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cv-tipo-mudanca">
            Tipo de mudança{' '}
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
          </Label>
          <Select
            value={tipoMudanca}
            onValueChange={(value) =>
              setTipoMudanca(value as TipoMudancaClubeVantagens)
            }
            disabled={submitting}
          >
            <SelectTrigger id="cv-tipo-mudanca">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inclusao_ou_aumento">
                Inclusão ou aumento
              </SelectItem>
              <SelectItem value="reducao_ou_exclusao">
                Redução ou exclusão
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resumo */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cv-resumo">
          Resumo das alterações (vai no e-mail){' '}
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        </Label>
        <textarea
          id="cv-resumo"
          value={resumo}
          onChange={(e) => setResumo(e.target.value)}
          maxLength={RESUMO_MAX}
          rows={5}
          disabled={submitting}
          aria-required="true"
          aria-describedby="cv-resumo-hint"
          placeholder={`Descreva as mudanças (mínimo ${RESUMO_MIN} caracteres): procedimento afetado, percentual anterior → novo, data de vigência.`}
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#4E8C75] disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p
          id="cv-resumo-hint"
          className="text-right text-xs text-muted-foreground"
          aria-live="polite"
        >
          {resumoLength}/{RESUMO_MAX}
          {resumoLength > 0 && resumoLength < RESUMO_MIN
            ? ` — mínimo ${RESUMO_MIN} caracteres`
            : ''}
        </p>
      </div>

      {/* Confirmação dupla */}
      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-amber-300/60 bg-amber-50/60 p-3">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
          disabled={submitting}
          aria-label="Estou ciente de que esta ação enviará e-mail a todos os clientes ativos"
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-amber-600 disabled:cursor-not-allowed"
        />
        <span className="text-sm text-foreground">
          Estou ciente de que esta ação{' '}
          <strong>enviará e-mail a todos os clientes ativos</strong> e ficará
          registrada no histórico de auditoria.
        </span>
      </label>

      {/* Erro inline */}
      {errorMessage ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-2 text-sm text-destructive"
          data-testid="cv-submit-error"
        >
          {errorMessage}
        </p>
      ) : null}

      {/* Sumário de sucesso */}
      {successSummary ? (
        <p
          role="status"
          className="flex items-start gap-2 rounded-md border border-emerald-300/60 bg-emerald-50 px-4 py-2 text-sm text-emerald-800"
          data-testid="cv-submit-success"
        >
          <Check
            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
            aria-hidden="true"
          />
          <span>
            Alteração para <strong>{successSummary.versionTo}</strong>{' '}
            registrada — <strong>{successSummary.enviadas}</strong>/
            {successSummary.total} e-mails enviados
            {successSummary.falhas > 0 ? (
              <>
                {' '}
                ({successSummary.falhas} falha
                {successSummary.falhas === 1 ? '' : 's'})
              </>
            ) : null}
            .
          </span>
        </p>
      ) : null}

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={!canSubmit}>
          {submitting ? (
            <>
              <Loader2
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
              Registrando…
            </>
          ) : (
            'Registrar e disparar comunicação'
          )}
        </Button>
      </div>
    </form>
  );
}
