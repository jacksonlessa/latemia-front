'use client';

/**
 * EditPetDrawer — Organism
 *
 * Sheet-based form for editing a pet's data.
 * Fields: name, species, breed, weight, birthDate, castrated, sex.
 *
 * Submit calls the internal PATCH /api/admin/clients/:clientId/pets/:petId
 * Route Handler (which forwards to the backend with the session token).
 *
 * Error handling:
 * - 400 with fieldErrors → per-field inline errors.
 * - 404                  → generic error banner.
 * - Other errors         → generic error banner.
 *
 * UX:
 * - Esc closes; overlay click shows confirmation when the form is dirty.
 * - "Salvar" button shows loading state during submit.
 * - On success: calls onSaved(updated) and closes the drawer.
 *
 * LGPD: request body contains pet data; forwarded server-side only.
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { PetDetail, PetSpecies, PetSex } from '@/lib/types/pet';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EditPetDrawerProps {
  pet: PetDetail;
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (updated: PetDetail) => void;
}

interface FormValues {
  name: string;
  species: PetSpecies;
  breed: string;
  weight: string; // string to allow controlled input; converted on submit
  birthDate: string; // YYYY-MM-DD for <input type="date">
  castrated: boolean;
  sex: PetSex;
}

interface FieldErrors {
  name?: string;
  species?: string;
  breed?: string;
  weight?: string;
  birthDate?: string;
  sex?: string;
  _form?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert ISO timestamp (or date string) to YYYY-MM-DD for <input type="date">. */
function toDateInputValue(iso: string): string {
  if (!iso) return '';
  // Accept "2022-03-15" or "2022-03-15T00:00:00.000Z"
  return iso.slice(0, 10);
}

function petToFormValues(pet: PetDetail): FormValues {
  return {
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    weight: String(pet.weight),
    birthDate: toDateInputValue(pet.birthDate),
    castrated: pet.castrated,
    sex: pet.sex,
  };
}

function valuesChanged(a: FormValues, b: FormValues): boolean {
  return (Object.keys(a) as (keyof FormValues)[]).some((k) => a[k] !== b[k]);
}

function validateForm(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Nome é obrigatório.';
  }

  const weightNum = parseFloat(values.weight);
  if (values.weight === '' || isNaN(weightNum) || weightNum < 0.1 || weightNum > 100) {
    errors.weight = 'Peso deve estar entre 0,1 e 100 kg.';
  }

  if (values.birthDate) {
    const parsed = new Date(values.birthDate);
    if (isNaN(parsed.getTime())) {
      errors.birthDate = 'Data inválida.';
    } else if (parsed >= new Date()) {
      errors.birthDate = 'A data de nascimento deve estar no passado.';
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EditPetDrawer({
  pet,
  clientId,
  open,
  onOpenChange,
  onSaved,
}: EditPetDrawerProps) {
  const initialValues = useRef<FormValues>(petToFormValues(pet));
  const [values, setValues] = useState<FormValues>(petToFormValues(pet));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [genericError, setGenericError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when the drawer opens or pet prop changes
  useEffect(() => {
    if (open) {
      const fresh = petToFormValues(pet);
      initialValues.current = fresh;
      setValues(fresh);
      setFieldErrors({});
      setGenericError(null);
      setIsSubmitting(false);
    }
  }, [open, pet]);

  function isDirty(): boolean {
    return valuesChanged(values, initialValues.current);
  }

  function handleChange(field: keyof FormValues, value: string | boolean): void {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (typeof value === 'string' && fieldErrors[field as keyof FieldErrors]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof FieldErrors];
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
      const payload = {
        name: values.name,
        species: values.species,
        breed: values.breed,
        weight: parseFloat(values.weight),
        // Send as full ISO string; YYYY-MM-DD at UTC midnight
        birthDate: values.birthDate
          ? new Date(values.birthDate).toISOString()
          : undefined,
        castrated: values.castrated,
        sex: values.sex,
      };

      const res = await fetch(
        `/api/admin/clients/${encodeURIComponent(clientId)}/pets/${encodeURIComponent(pet.id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        const updated = (await res.json()) as PetDetail;
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

      if (res.status === 400) {
        if (body.fieldErrors && Object.keys(body.fieldErrors).length > 0) {
          setFieldErrors(body.fieldErrors);
        } else {
          setFieldErrors({ _form: body.message ?? 'Verifique os dados informados.' });
        }
        return;
      }

      if (res.status === 404) {
        setGenericError('Pet não encontrado. Recarregue a página e tente novamente.');
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
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          requestClose();
        } else {
          onOpenChange(true);
        }
      }}
    >
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
          <SheetTitle>Editar pet</SheetTitle>
          <SheetDescription>
            Atualize os dados do pet <strong>{pet.name}</strong>.
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
          id="edit-pet-form"
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 space-y-5"
        >
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="pet-name" className="text-sm font-medium text-foreground">
              Nome <span aria-hidden="true" className="text-destructive">*</span>
            </label>
            <Input
              id="pet-name"
              value={values.name}
              onChange={(e) => handleChange('name', e.target.value)}
              aria-required="true"
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? 'pet-name-error' : undefined}
              disabled={isSubmitting}
              autoComplete="off"
            />
            {fieldErrors.name && (
              <p id="pet-name-error" role="alert" className="text-xs text-destructive">
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Species */}
          <div className="space-y-1.5">
            <label htmlFor="pet-species" className="text-sm font-medium text-foreground">
              Espécie
            </label>
            <Select
              value={values.species}
              onValueChange={(v) => handleChange('species', v)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="pet-species" aria-label="Espécie do pet">
                <SelectValue placeholder="Selecione a espécie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="canino">Canino</SelectItem>
                <SelectItem value="felino">Felino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Breed */}
          <div className="space-y-1.5">
            <label htmlFor="pet-breed" className="text-sm font-medium text-foreground">
              Raça
            </label>
            <Input
              id="pet-breed"
              value={values.breed}
              onChange={(e) => handleChange('breed', e.target.value)}
              disabled={isSubmitting}
              autoComplete="off"
            />
          </div>

          {/* Weight */}
          <div className="space-y-1.5">
            <label htmlFor="pet-weight" className="text-sm font-medium text-foreground">
              Peso (kg) <span aria-hidden="true" className="text-destructive">*</span>
            </label>
            <Input
              id="pet-weight"
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              value={values.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              aria-invalid={!!fieldErrors.weight}
              aria-describedby={fieldErrors.weight ? 'pet-weight-error' : undefined}
              disabled={isSubmitting}
            />
            {fieldErrors.weight && (
              <p id="pet-weight-error" role="alert" className="text-xs text-destructive">
                {fieldErrors.weight}
              </p>
            )}
          </div>

          {/* Birth date */}
          <div className="space-y-1.5">
            <label htmlFor="pet-birthDate" className="text-sm font-medium text-foreground">
              Data de nascimento
            </label>
            <Input
              id="pet-birthDate"
              type="date"
              value={values.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
              aria-invalid={!!fieldErrors.birthDate}
              aria-describedby={fieldErrors.birthDate ? 'pet-birthDate-error' : undefined}
              disabled={isSubmitting}
              max={new Date().toISOString().slice(0, 10)}
            />
            {fieldErrors.birthDate && (
              <p id="pet-birthDate-error" role="alert" className="text-xs text-destructive">
                {fieldErrors.birthDate}
              </p>
            )}
          </div>

          {/* Sex */}
          <div className="space-y-1.5">
            <label htmlFor="pet-sex" className="text-sm font-medium text-foreground">
              Sexo
            </label>
            <Select
              value={values.sex}
              onValueChange={(v) => handleChange('sex', v)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="pet-sex" aria-label="Sexo do pet">
                <SelectValue placeholder="Selecione o sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Macho</SelectItem>
                <SelectItem value="female">Fêmea</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Castrated */}
          <div className="flex items-center gap-3">
            <Switch
              id="pet-castrated"
              checked={values.castrated}
              onCheckedChange={(checked) => handleChange('castrated', checked)}
              disabled={isSubmitting}
              aria-label="Castrado"
            />
            <label
              htmlFor="pet-castrated"
              className="text-sm font-medium text-foreground cursor-pointer select-none"
            >
              Castrado
            </label>
          </div>
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
            form="edit-pet-form"
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
