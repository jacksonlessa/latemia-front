'use client';

import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { CpfInput } from '../atoms/cpf-input';
import { PhoneInput } from '../atoms/phone-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createInternalUserAction,
  updateInternalUserAction,
} from '@/app/admin/(panel)/usuarios-internos/actions';
import type { ActionResult } from '@/app/admin/(panel)/usuarios-internos/actions';
import type { InternalUserDetail } from '@/lib/types/internal-users';

// ---------------------------------------------------------------------------
// Sub-components — one per mode so each has its own isolated useActionState
// ---------------------------------------------------------------------------

interface FormBodyProps {
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface CreateFormProps extends FormBodyProps {}

function CreateForm({ onOpenChange, onSuccess }: CreateFormProps) {
  const [state, formAction, isPending] = useActionState(
    createInternalUserAction as (
      prev: ActionResult<InternalUserDetail>,
      formData: FormData,
    ) => Promise<ActionResult<InternalUserDetail>>,
    { ok: false, code: '', message: '' } as ActionResult<InternalUserDetail>,
  );

  useEffect(() => {
    if (state.ok) {
      onSuccess();
      onOpenChange(false);
    }
  }, [state, onSuccess, onOpenChange]);

  return (
    <UserFormFields
      state={state}
      formAction={formAction}
      isPending={isPending}
      mode="create"
      user={undefined}
      onCancel={() => onOpenChange(false)}
    />
  );
}

interface EditFormProps extends FormBodyProps {
  user: InternalUserDetail;
}

function EditForm({ user, onOpenChange, onSuccess }: EditFormProps) {
  const boundAction = updateInternalUserAction.bind(null, user.id);

  const [state, formAction, isPending] = useActionState(
    boundAction as (
      prev: ActionResult<InternalUserDetail>,
      formData: FormData,
    ) => Promise<ActionResult<InternalUserDetail>>,
    { ok: false, code: '', message: '' } as ActionResult<InternalUserDetail>,
  );

  useEffect(() => {
    if (state.ok) {
      onSuccess();
      onOpenChange(false);
    }
  }, [state, onSuccess, onOpenChange]);

  return (
    <UserFormFields
      state={state}
      formAction={formAction}
      isPending={isPending}
      mode="edit"
      user={user}
      onCancel={() => onOpenChange(false)}
    />
  );
}

// ---------------------------------------------------------------------------
// Shared form fields component
// ---------------------------------------------------------------------------

interface UserFormFieldsProps {
  state: ActionResult<InternalUserDetail>;
  formAction: (formData: FormData) => void;
  isPending: boolean;
  mode: 'create' | 'edit';
  user?: InternalUserDetail;
  onCancel: () => void;
}

function UserFormFields({
  state,
  formAction,
  isPending,
  mode,
  user,
  onCancel,
}: UserFormFieldsProps) {
  const fieldErrors = !state.ok && state.code ? (state.fieldErrors ?? {}) : {};
  const generalError =
    !state.ok && state.code && Object.keys(fieldErrors).length === 0
      ? state.message
      : null;
  const formError = fieldErrors['form'];

  const [formKey, setFormKey] = useState(0);
  const [savedValues, setSavedValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!state.ok && state.submittedValues) {
      setSavedValues(state.submittedValues);
      setFormKey((k) => k + 1);
    }
  }, [state]);

  const sv = savedValues;

  return (
    <form key={formKey} action={formAction} className="space-y-4" noValidate>
      {/* General / form-level error */}
      {(generalError || formError) && (
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {formError ?? generalError}
        </div>
      )}

      {/* Nome */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={sv.name ?? user?.name ?? ''}
          aria-describedby={fieldErrors['name'] ? 'name-error' : undefined}
          aria-invalid={!!fieldErrors['name']}
          disabled={isPending}
        />
        {fieldErrors['name'] && (
          <p id="name-error" className="text-sm text-destructive">
            {fieldErrors['name']}
          </p>
        )}
      </div>

      {/* E-mail */}
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={sv.email ?? user?.email ?? ''}
          aria-describedby={fieldErrors['email'] ? 'email-error' : undefined}
          aria-invalid={!!fieldErrors['email']}
          disabled={isPending}
        />
        {fieldErrors['email'] && (
          <p id="email-error" className="text-sm text-destructive">
            {fieldErrors['email']}
          </p>
        )}
      </div>

      {/* Telefone */}
      <div className="space-y-1.5">
        <Label htmlFor="phone">Telefone</Label>
        <PhoneInput
          id="phone"
          name="phone"
          required
          defaultValue={sv.phone ?? user?.phone ?? ''}
          aria-describedby={fieldErrors['phone'] ? 'phone-error' : undefined}
          aria-invalid={!!fieldErrors['phone']}
          disabled={isPending}
        />
        {fieldErrors['phone'] && (
          <p id="phone-error" className="text-sm text-destructive">
            {fieldErrors['phone']}
          </p>
        )}
      </div>

      {/* CPF */}
      <div className="space-y-1.5">
        <Label htmlFor="cpf">CPF</Label>
        <CpfInput
          id="cpf"
          name="cpf"
          required
          defaultValue={sv.cpf ?? user?.cpf ?? ''}
          aria-describedby={fieldErrors['cpf'] ? 'cpf-error' : undefined}
          aria-invalid={!!fieldErrors['cpf']}
          disabled={isPending}
        />
        {fieldErrors['cpf'] && (
          <p id="cpf-error" className="text-sm text-destructive">
            {fieldErrors['cpf']}
          </p>
        )}
      </div>

      {/* Papel */}
      <div className="space-y-1.5">
        <Label htmlFor="role">Papel</Label>
        <Select name="role" defaultValue={sv.role ?? user?.role ?? 'atendente'} disabled={isPending}>
          <SelectTrigger
            id="role"
            aria-describedby={fieldErrors['role'] ? 'role-error' : undefined}
            aria-invalid={!!fieldErrors['role']}
          >
            <SelectValue placeholder="Selecione o papel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="atendente">Atendente</SelectItem>
          </SelectContent>
        </Select>
        {fieldErrors['role'] && (
          <p id="role-error" className="text-sm text-destructive">
            {fieldErrors['role']}
          </p>
        )}
      </div>

      {/* Senha */}
      <div className="space-y-1.5">
        <Label htmlFor="password">
          Senha
          {mode === 'edit' && (
            <span className="font-normal text-muted-foreground"> (opcional)</span>
          )}
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required={mode === 'create'}
          placeholder={mode === 'edit' ? 'Deixe em branco para não alterar' : undefined}
          aria-describedby={fieldErrors['password'] ? 'password-error' : undefined}
          aria-invalid={!!fieldErrors['password']}
          disabled={isPending}
        />
        {fieldErrors['password'] && (
          <p id="password-error" className="text-sm text-destructive">
            {fieldErrors['password']}
          </p>
        )}
      </div>

      <DialogFooter className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending} aria-busy={isPending}>
          {isPending
            ? 'Salvando...'
            : mode === 'create'
              ? 'Criar usuário'
              : 'Salvar alterações'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton for while the edit detail is being fetched
// ---------------------------------------------------------------------------

function FormSkeleton({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div key={n} className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" disabled>
          Salvar alterações
        </Button>
      </DialogFooter>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  user?: InternalUserDetail;
  fetchError?: string | null;
  onSuccess: () => void;
}

export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  user,
  fetchError,
  onSuccess,
}: UserFormDialogProps) {
  const title = mode === 'create' ? 'Novo usuário' : 'Editar usuário';
  const description =
    mode === 'create'
      ? 'Preencha os dados para criar um novo usuário interno.'
      : 'Altere os dados do usuário. Deixe a senha em branco para não alterá-la.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {mode === 'create' ? (
          <CreateForm onOpenChange={onOpenChange} onSuccess={onSuccess} />
        ) : fetchError ? (
          <div className="space-y-4">
            <div role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {fetchError}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </div>
        ) : user ? (
          <EditForm user={user} onOpenChange={onOpenChange} onSuccess={onSuccess} />
        ) : (
          <FormSkeleton onCancel={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}
