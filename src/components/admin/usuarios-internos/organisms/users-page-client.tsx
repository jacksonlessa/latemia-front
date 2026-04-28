'use client';

import { useState, useTransition, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserFilterBar } from '@/components/admin/usuarios-internos/molecules/user-filter-bar';
import { ConfirmDialog } from '@/components/admin/usuarios-internos/molecules/confirm-dialog';
import { DevelopmentDialog } from '@/components/admin/usuarios-internos/molecules/development-dialog';
import { UsersTable } from './users-table';
import { UserFormDialog } from './user-form-dialog';
import {
  deactivateInternalUserAction,
  reactivateInternalUserAction,
  getInternalUserAction,
} from '@/app/admin/(panel)/usuarios-internos/actions';
import type { InternalUserDetail, PaginatedInternalUsers } from '@/lib/types/users';

type ModalKind = 'none' | 'create' | 'edit' | 'deactivate' | 'reactivate' | 'reset';

interface UsersPageClientProps {
  initialData: PaginatedInternalUsers;
  page: number;
  currentUserId: string;
}

export function UsersPageClient({
  initialData,
  page,
  currentUserId,
}: UsersPageClientProps) {
  const [modal, setModal] = useState<ModalKind>('none');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<InternalUserDetail | null>(null);
  const [editFetchError, setEditFetchError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Transition for async operations (fetch detail, confirm actions)
  const [isPending, startTransition] = useTransition();

  // ---------------------------------------------------------------------------
  // Open handlers
  // ---------------------------------------------------------------------------

  function handleOpenCreate() {
    setSelectedId(null);
    setSelectedDetail(null);
    setModal('create');
  }

  function handleOpenEdit(id: string) {
    setSelectedId(id);
    setSelectedDetail(null);
    setEditFetchError(null);
    setModal('edit');

    startTransition(async () => {
      const result = await getInternalUserAction(id);
      if (result.ok && result.data) {
        setSelectedDetail(result.data);
      } else if (!result.ok) {
        setEditFetchError(result.message ?? 'Não foi possível carregar os dados do usuário.');
      }
    });
  }

  function handleOpenDeactivate(id: string) {
    setSelectedId(id);
    setConfirmError(null);
    setModal('deactivate');
  }

  function handleOpenReactivate(id: string) {
    setSelectedId(id);
    setConfirmError(null);
    setModal('reactivate');
  }

  function handleOpenReset(id: string) {
    setSelectedId(id);
    setModal('reset');
  }

  // ---------------------------------------------------------------------------
  // Confirm handlers
  // ---------------------------------------------------------------------------

  function handleDeactivateConfirm() {
    if (!selectedId) return;
    startTransition(async () => {
      const result = await deactivateInternalUserAction(selectedId);
      if (result.ok) {
        setModal('none');
        setSelectedId(null);
        setConfirmError(null);
      } else {
        setConfirmError(result.message);
      }
    });
  }

  function handleReactivateConfirm() {
    if (!selectedId) return;
    startTransition(async () => {
      const result = await reactivateInternalUserAction(selectedId);
      if (result.ok) {
        setModal('none');
        setSelectedId(null);
        setConfirmError(null);
      } else {
        setConfirmError(result.message);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Success / close handlers
  // ---------------------------------------------------------------------------

  const handleFormSuccess = useCallback(() => {
    setSelectedId(null);
    setSelectedDetail(null);
  }, []);

  function handleCloseModal(open: boolean) {
    if (!open) {
      setModal('none');
      setSelectedId(null);
      setSelectedDetail(null);
      setEditFetchError(null);
      setConfirmError(null);
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const { data, meta } = initialData;

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Filter bar + create button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <UserFilterBar />
        </div>
        <Button onClick={handleOpenCreate} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Novo usuário
        </Button>
      </div>

      {/* Data table */}
      <UsersTable
        data={data}
        total={meta.total}
        page={page}
        limit={meta.limit}
        currentUserId={currentUserId}
        onEdit={handleOpenEdit}
        onDeactivate={handleOpenDeactivate}
        onReactivate={handleOpenReactivate}
        onResetPassword={handleOpenReset}
      />

      {/* Create / Edit dialog */}
      {(modal === 'create' || modal === 'edit') && (
        <UserFormDialog
          open={modal === 'create' || modal === 'edit'}
          onOpenChange={handleCloseModal}
          mode={modal === 'create' ? 'create' : 'edit'}
          user={modal === 'edit' ? (selectedDetail ?? undefined) : undefined}
          fetchError={modal === 'edit' ? editFetchError : null}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Deactivate confirm dialog */}
      <ConfirmDialog
        open={modal === 'deactivate'}
        onOpenChange={handleCloseModal}
        title="Desativar usuário"
        description={
          confirmError
            ? confirmError
            : 'Tem certeza que deseja desativar este usuário? Ele perderá o acesso ao sistema.'
        }
        confirmLabel="Desativar"
        variant="destructive"
        onConfirm={handleDeactivateConfirm}
        isPending={isPending}
      />

      {/* Reactivate confirm dialog */}
      <ConfirmDialog
        open={modal === 'reactivate'}
        onOpenChange={handleCloseModal}
        title="Reativar usuário"
        description={
          confirmError
            ? confirmError
            : 'Tem certeza que deseja reativar este usuário? Ele voltará a ter acesso ao sistema.'
        }
        confirmLabel="Reativar"
        variant="default"
        onConfirm={handleReactivateConfirm}
        isPending={isPending}
      />

      {/* Reset password dialog (placeholder) */}
      <DevelopmentDialog
        open={modal === 'reset'}
        onOpenChange={handleCloseModal}
      />
    </div>
  );
}
