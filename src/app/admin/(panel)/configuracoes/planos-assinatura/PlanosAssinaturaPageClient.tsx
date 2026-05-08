'use client';

import { useState, useEffect, useCallback, useRef, useTransition } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlansTable } from '@/components/admin/planos-assinatura/organisms/plans-table/PlansTable';
import { PlanFiltersBar } from '@/components/admin/planos-assinatura/organisms/plan-filters-bar/PlanFiltersBar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { listPlansAction, archivePlanAction, createPlanAction, getPlanAction, updatePlanAction } from './actions';
import { PlanDialog } from '@/components/admin/planos-assinatura/organisms/plan-dialog/PlanDialog';
import type { Plan, Paginated } from '@/lib/billing/types';

const PAGE_SIZE = 25;
const DEBOUNCE_MS = 300;

export function PlanosAssinaturaPageClient() {
  const [nameFilter, setNameFilter] = useState('');
  const [debouncedName, setDebouncedName] = useState('');
  const [page, setPage] = useState(1);

  const [plansData, setPlansData] = useState<Paginated<Plan> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Plan dialog (create/edit)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editPlanId, setEditPlanId] = useState<string | undefined>(undefined);

  // Archive confirm dialog state
  const [planToArchive, setPlanToArchive] = useState<Plan | null>(null);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [isArchiving, startArchiveTransition] = useTransition();

  // Debounce name filter
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedName(nameFilter);
      setPage(1);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [nameFilter]);

  // Fetch plans
  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await listPlansAction({
      page,
      pageSize: PAGE_SIZE,
      name: debouncedName || undefined,
    });
    if (result.ok) {
      setPlansData(result.data);
    } else {
      setError(result.message);
      setPlansData(null);
    }
    setIsLoading(false);
  }, [page, debouncedName]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Pagination helpers
  const meta = plansData?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const firstItem = meta ? (meta.page - 1) * meta.pageSize + 1 : 0;
  const lastItem = meta ? Math.min(meta.page * meta.pageSize, meta.total) : 0;

  // Archive handlers
  function handleArchiveRequest(plan: Plan) {
    setArchiveError(null);
    setPlanToArchive(plan);
  }

  function handleArchiveDialogClose(open: boolean) {
    if (!open && !isArchiving) {
      setPlanToArchive(null);
      setArchiveError(null);
    }
  }

  function handleArchiveConfirm() {
    if (!planToArchive) return;
    startArchiveTransition(async () => {
      const result = await archivePlanAction(planToArchive.id);
      if (result.ok) {
        setPlanToArchive(null);
        setArchiveError(null);
        // Refresh the list to reflect the updated status
        fetchPlans();
      } else {
        setArchiveError(result.message);
      }
    });
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Inactive module banner */}
      <div
        role="status"
        className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
      >
        <span className="mt-0.5 shrink-0 text-base leading-none" aria-hidden="true">⚠️</span>
        <span>
          <strong>Módulo inativo.</strong> A gestão de planos na Pagar.me não é mais utilizada pelo fluxo de contratação. O preço mensal por pet é configurado em{' '}
          <a href="/admin/configuracoes" className="underline underline-offset-2 hover:opacity-80">
            Configurações Gerais
          </a>
          .
        </span>
      </div>

      {/* Page header */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <h1 className="mb-2 text-xl font-semibold text-[#2C2C2E] md:text-2xl">
          Planos de Assinatura
        </h1>
        <p className="text-sm text-[#6B6B6E] md:text-base">
          Gerencie os planos disponíveis para contratação
        </p>
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="space-y-4 p-4 md:p-6">
          {/* Filters + New Plan button */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <PlanFiltersBar
                nameFilter={nameFilter}
                onNameFilterChange={setNameFilter}
                disabled={isLoading}
              />
            </div>
            <Button
              className="shrink-0"
              onClick={() => { setDialogMode('create'); setEditPlanId(undefined); setDialogOpen(true); }}
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Novo plano
            </Button>
          </div>

          {/* Table */}
          <PlansTable
            plans={plansData?.data ?? []}
            isLoading={isLoading}
            isEmpty={!isLoading && !error && (plansData?.data.length ?? 0) === 0}
            error={error ?? undefined}
            onEdit={(plan) => { setDialogMode('edit'); setEditPlanId(plan.id); setDialogOpen(true); }}
            onArchive={handleArchiveRequest}
          />

          {/* Error state with retry */}
          {error && !isLoading && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" size="sm" onClick={fetchPlans}>
                Tentar novamente
              </Button>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !error && plansData && meta && meta.total > 0 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-[#6B6B6E]">
                {firstItem}–{lastItem} de {meta.total}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit dialog */}
      <PlanDialog
        mode={dialogMode}
        planId={editPlanId}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => { setDialogOpen(false); fetchPlans(); }}
        onFetchPlan={getPlanAction}
        onCreatePlan={createPlanAction}
        onUpdatePlan={updatePlanAction}
      />

      {/* Archive confirmation dialog */}
      <Dialog
        open={planToArchive !== null}
        onOpenChange={handleArchiveDialogClose}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arquivar plano</DialogTitle>
            <DialogDescription>
              {archiveError
                ? archiveError
                : `Tem certeza que deseja arquivar o plano "${planToArchive?.name}"? Ele ficará inativo e não poderá ser contratado.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleArchiveDialogClose(false)}
              type="button"
              disabled={isArchiving}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleArchiveConfirm}
              disabled={isArchiving}
              type="button"
              aria-busy={isArchiving}
            >
              {isArchiving ? 'Arquivando...' : 'Arquivar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
