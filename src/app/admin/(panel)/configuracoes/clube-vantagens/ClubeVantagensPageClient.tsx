'use client';

import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { HistoricoAlteracoesTable } from '@/components/admin/clube-vantagens/organisms/historico-alteracoes-table/HistoricoAlteracoesTable';
import { RegistrarAlteracaoForm } from '@/components/admin/clube-vantagens/organisms/registrar-alteracao-form/RegistrarAlteracaoForm';
import { listarAlteracoesClubeVantagensUseCase } from '@/domain/clube-vantagens/listar-alteracoes.use-case';
import type { AlteracaoClubeVantagens } from '@/domain/clube-vantagens/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ClubeVantagensPageClientProps {
  /** Versão vigente lida de `CLUBE_VANTAGENS_VERSION` no Server Component. */
  currentVersion: string;
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

/**
 * Orchestrator client component da página `/admin/configuracoes/clube-vantagens`.
 *
 * Responsabilidades:
 *  - Compor o `RegistrarAlteracaoForm` e o `HistoricoAlteracoesTable`.
 *  - Manter o estado da listagem (loading, erro, dados) e atualizá-la após
 *    cada registro bem-sucedido.
 *  - Oferecer botão manual de refresh quando o admin quiser re-sincronizar.
 *
 * Não contém lógica de negócio — apenas orquestra eventos UI e delega
 * para os use-cases.
 */
export function ClubeVantagensPageClient({
  currentVersion,
}: ClubeVantagensPageClientProps) {
  const [historico, setHistorico] = useState<AlteracaoClubeVantagens[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchHistorico = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const items = await listarAlteracoesClubeVantagensUseCase();
      setHistorico(items);
    } catch {
      setErrorMessage(
        'Não foi possível carregar o histórico de alterações. Tente novamente.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Busca inicial do histórico ao montar.
  useEffect(() => {
    fetchHistorico();
  }, [fetchHistorico]);

  function handleAlteracaoRegistered(newItem: AlteracaoClubeVantagens) {
    // Atualização otimista: insere o novo item no topo enquanto refresca.
    setHistorico((prev) => [newItem, ...prev]);
    fetchHistorico();
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="mb-2 text-xl font-semibold text-[#2C2C2E] md:text-2xl">
              Clube de Vantagens
            </h1>
            <p className="text-sm text-[#6B6B6E] md:text-base">
              Registre alterações da tabela do Clube de Vantagens (Cláusula
              §2.2.2 do contrato) e dispare a comunicação prévia aos clientes
              ativos. A edição dos percentuais em si segue por PR + deploy
              (arquivo <code className="font-mono">content/beneficios.ts</code>).
            </p>
          </div>
          <a
            href="/beneficios"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-md border border-gray-200 px-3 py-1.5 text-sm text-[#4E8C75] transition-colors hover:bg-[#EAF4F0]"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Ver tabela pública
          </a>
        </div>
        <p className="mt-3 text-xs text-[#6B6B6E]">
          Versão vigente:{' '}
          <strong className="text-[#2C2C2E]">{currentVersion}</strong>
        </p>
      </div>

      {/* Form */}
      <section
        aria-labelledby="cv-form-heading"
        className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6"
      >
        <h2
          id="cv-form-heading"
          className="mb-1 text-lg font-semibold text-[#2C2C2E]"
        >
          Registrar nova alteração
        </h2>
        <p className="mb-4 text-sm text-[#6B6B6E]">
          Após o deploy de uma nova versão da tabela, use este formulário para
          registrar oficialmente a alteração e enviar o e-mail de comunicação
          prévia aos clientes ativos.
        </p>
        <RegistrarAlteracaoForm
          defaultVersionFrom={currentVersion}
          onSuccess={handleAlteracaoRegistered}
        />
      </section>

      {/* Histórico */}
      <section
        aria-labelledby="cv-historico-heading"
        className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2
              id="cv-historico-heading"
              className="text-lg font-semibold text-[#2C2C2E]"
            >
              Histórico de alterações
            </h2>
            <p className="text-sm text-[#6B6B6E]">
              Ordenado por data de disparo (mais recente primeiro).
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHistorico}
            disabled={isLoading}
            aria-label="Atualizar histórico"
          >
            <RefreshCw
              className={
                isLoading
                  ? 'h-4 w-4 animate-spin'
                  : 'h-4 w-4'
              }
              aria-hidden="true"
            />
            Atualizar
          </Button>
        </div>
        <HistoricoAlteracoesTable
          items={historico}
          isLoading={isLoading}
          errorMessage={errorMessage}
        />
      </section>
    </div>
  );
}
