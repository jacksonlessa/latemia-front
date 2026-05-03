'use client';

/**
 * EditClientDrawer — Organism
 *
 * Sheet-based form for editing a client's personal data and primary address.
 * CPF is read-only. Submit calls the internal PATCH /api/admin/clients/:id
 * Route Handler (which forwards to the backend with the session token).
 *
 * Error handling:
 * - 409 CLIENT_EMAIL_TAKEN → inline error on the email field; drawer stays open.
 * - 400 with details[]    → per-field inline errors.
 * - Other errors          → generic error banner; drawer stays open.
 *
 * UX:
 * - Esc closes; overlay click shows confirmation when the form is dirty.
 * - "Salvar" button shows loading state during submit.
 * - On success: calls onSaved(updated) and closes the drawer.
 *
 * LGPD: request body contains personal data; it is forwarded server-side only
 * and never logged here.
 */

import { useEffect, useRef, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ClientDetail, AddressDetail } from '@/lib/types/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EditClientDrawerProps {
  client: ClientDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (updated: ClientDetail) => void;
}

interface FormValues {
  name: string;
  phone: string;
  email: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
}

interface FieldErrors {
  name?: string;
  phone?: string;
  email?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
  _form?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clientToFormValues(client: ClientDetail): FormValues {
  const addr: Partial<AddressDetail> = client.addresses[0] ?? {};
  return {
    name: client.name,
    phone: client.phone,
    email: client.email,
    street: addr.street ?? '',
    number: addr.number ?? '',
    complement: addr.complement ?? '',
    neighborhood: addr.neighborhood ?? '',
    city: addr.city ?? '',
    state: addr.state ?? '',
    cep: addr.cep ?? '',
  };
}

function formatCpf(cpf: string): string {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function valuesChanged(a: FormValues, b: FormValues): boolean {
  return (Object.keys(a) as (keyof FormValues)[]).some((k) => a[k] !== b[k]);
}

function validateForm(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) errors.name = 'Nome é obrigatório.';

  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Formato de e-mail inválido.';
  }

  if (values.state && values.state.replace(/\D/g, '').length === 0) {
    // allow letters only
    if (!/^[A-Za-z]{2}$/.test(values.state.trim())) {
      errors.state = 'UF deve ter 2 letras.';
    }
  } else if (values.state && !/^[A-Za-z]{2}$/.test(values.state.trim())) {
    errors.state = 'UF deve ter 2 letras.';
  }

  if (values.cep && !/^\d{8}$/.test(values.cep.replace(/\D/g, ''))) {
    errors.cep = 'CEP deve ter 8 dígitos.';
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EditClientDrawer({
  client,
  open,
  onOpenChange,
  onSaved,
}: EditClientDrawerProps) {
  const initialValues = useRef<FormValues>(clientToFormValues(client));
  const [values, setValues] = useState<FormValues>(clientToFormValues(client));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [genericError, setGenericError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when the drawer opens or client prop changes
  useEffect(() => {
    if (open) {
      const fresh = clientToFormValues(client);
      initialValues.current = fresh;
      setValues(fresh);
      setFieldErrors({});
      setGenericError(null);
      setIsSubmitting(false);
    }
  }, [open, client]);

  function isDirty(): boolean {
    return valuesChanged(values, initialValues.current);
  }

  function handleChange(field: keyof FormValues, value: string): void {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear the error for the field being edited
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function requestClose(): void {
    if (isSubmitting) return;
    if (isDirty()) {
      const confirmed = window.confirm(
        'Há alterações não salvas. Deseja descartar?',
      );
      if (!confirmed) return;
    }
    onOpenChange(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();

    const validationErrors = validateForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setGenericError(null);

    try {
      const primaryAddress = client.addresses[0];
      const addressPayload: Record<string, string> = {
        street: values.street,
        number: values.number,
        complement: values.complement,
        neighborhood: values.neighborhood,
        city: values.city,
        state: values.state.toUpperCase(),
        cep: values.cep.replace(/\D/g, ''),
      };
      if (primaryAddress?.id) {
        addressPayload.id = primaryAddress.id;
      }

      const payload = {
        name: values.name,
        phone: values.phone,
        email: values.email,
        address: addressPayload,
      };

      const res = await fetch(`/api/admin/clients/${encodeURIComponent(client.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = (await res.json()) as ClientDetail;
        onSaved(updated);
        onOpenChange(false);
        return;
      }

      let body: { code?: string; message?: string; fieldErrors?: Record<string, string> } = {};
      try {
        body = (await res.json()) as typeof body;
      } catch {
        // non-JSON body
      }

      const code = body.code ?? 'UNKNOWN_ERROR';

      if (res.status === 409 && code === 'CLIENT_EMAIL_TAKEN') {
        setFieldErrors({ email: 'Este e-mail já está em uso por outro cliente.' });
        return;
      }

      if (res.status === 400) {
        if (body.fieldErrors && Object.keys(body.fieldErrors).length > 0) {
          setFieldErrors(body.fieldErrors);
        } else {
          setFieldErrors({ _form: body.message ?? 'Verifique os dados informados.' });
        }
        return;
      }

      setGenericError(body.message ?? 'Ocorreu um erro inesperado. Tente novamente.');
    } catch {
      setGenericError('Erro de conexão. Verifique sua rede e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(next) => {
      if (!next) {
        requestClose();
      } else {
        onOpenChange(true);
      }
    }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto"
        aria-modal="true"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            requestClose();
          }
        }}
      >
        <SheetHeader>
          <SheetTitle>Editar cliente</SheetTitle>
          <SheetDescription>
            Atualize os dados do cliente. CPF não pode ser alterado.
          </SheetDescription>
        </SheetHeader>

        {/* Generic error banner */}
        {genericError && (
          <p
            role="alert"
            className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-2 text-sm text-destructive"
          >
            {genericError}
          </p>
        )}

        {/* Form-level error */}
        {fieldErrors._form && (
          <p
            role="alert"
            className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-2 text-sm text-destructive"
          >
            {fieldErrors._form}
          </p>
        )}

        <form
          id="edit-client-form"
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 space-y-5"
        >
          {/* CPF — read-only */}
          <div className="space-y-1.5">
            <label
              htmlFor="cpf"
              className="text-sm font-medium text-foreground"
            >
              CPF
            </label>
            <Input
              id="cpf"
              value={formatCpf(client.cpf)}
              readOnly
              disabled
              aria-readonly="true"
              className="bg-muted text-muted-foreground"
            />
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Nome <span aria-hidden="true" className="text-destructive">*</span>
            </label>
            <Input
              id="name"
              value={values.name}
              onChange={(e) => handleChange('name', e.target.value)}
              aria-required="true"
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? 'name-error' : undefined}
              disabled={isSubmitting}
              autoComplete="name"
            />
            {fieldErrors.name && (
              <p id="name-error" role="alert" className="text-xs text-destructive">
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-foreground">
              Telefone
            </label>
            <Input
              id="phone"
              type="tel"
              value={values.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              aria-invalid={!!fieldErrors.phone}
              aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
              disabled={isSubmitting}
              autoComplete="tel"
            />
            {fieldErrors.phone && (
              <p id="phone-error" role="alert" className="text-xs text-destructive">
                {fieldErrors.phone}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              disabled={isSubmitting}
              autoComplete="email"
            />
            {fieldErrors.email && (
              <p id="email-error" role="alert" className="text-xs text-destructive">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Address section */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-medium text-foreground">
              Endereço principal
            </legend>

            {/* Street */}
            <div className="space-y-1.5">
              <label htmlFor="street" className="text-sm text-foreground">
                Logradouro
              </label>
              <Input
                id="street"
                value={values.street}
                onChange={(e) => handleChange('street', e.target.value)}
                aria-invalid={!!fieldErrors.street}
                disabled={isSubmitting}
                autoComplete="street-address"
              />
              {fieldErrors.street && (
                <p role="alert" className="text-xs text-destructive">{fieldErrors.street}</p>
              )}
            </div>

            {/* Number + Complement */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="number" className="text-sm text-foreground">
                  Número
                </label>
                <Input
                  id="number"
                  value={values.number}
                  onChange={(e) => handleChange('number', e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="address-line2"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="complement" className="text-sm text-foreground">
                  Complemento
                </label>
                <Input
                  id="complement"
                  value={values.complement}
                  onChange={(e) => handleChange('complement', e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="address-line3"
                />
              </div>
            </div>

            {/* Neighborhood */}
            <div className="space-y-1.5">
              <label htmlFor="neighborhood" className="text-sm text-foreground">
                Bairro
              </label>
              <Input
                id="neighborhood"
                value={values.neighborhood}
                onChange={(e) => handleChange('neighborhood', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* City + State */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <label htmlFor="city" className="text-sm text-foreground">
                  Cidade
                </label>
                <Input
                  id="city"
                  value={values.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="address-level2"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="state" className="text-sm text-foreground">
                  UF
                </label>
                <Input
                  id="state"
                  value={values.state}
                  onChange={(e) => handleChange('state', e.target.value.toUpperCase().slice(0, 2))}
                  maxLength={2}
                  aria-invalid={!!fieldErrors.state}
                  aria-describedby={fieldErrors.state ? 'state-error' : undefined}
                  disabled={isSubmitting}
                  autoComplete="address-level1"
                />
                {fieldErrors.state && (
                  <p id="state-error" role="alert" className="text-xs text-destructive">{fieldErrors.state}</p>
                )}
              </div>
            </div>

            {/* CEP */}
            <div className="space-y-1.5">
              <label htmlFor="cep" className="text-sm text-foreground">
                CEP
              </label>
              <Input
                id="cep"
                value={values.cep}
                onChange={(e) => handleChange('cep', e.target.value)}
                aria-invalid={!!fieldErrors.cep}
                aria-describedby={fieldErrors.cep ? 'cep-error' : undefined}
                disabled={isSubmitting}
                autoComplete="postal-code"
                maxLength={9}
              />
              {fieldErrors.cep && (
                <p id="cep-error" role="alert" className="text-xs text-destructive">{fieldErrors.cep}</p>
              )}
            </div>
          </fieldset>
        </form>

        <SheetFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={requestClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="edit-client-form"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Salvando…' : 'Salvar'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
