import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PetForm, parseWeight, formatWeight } from './pet-form';
import type { RegisterPetInput } from '@/lib/types/pet';

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

describe('parseWeight', () => {
  it('should parse a comma-separated weight (pt-BR)', () => {
    expect(parseWeight('5,2')).toBe(5.2);
  });

  it('should parse a dot-separated weight', () => {
    expect(parseWeight('5.2')).toBe(5.2);
  });

  it('should return undefined when input is empty', () => {
    expect(parseWeight('')).toBeUndefined();
    expect(parseWeight('   ')).toBeUndefined();
  });

  it('should return undefined when input is not a finite number', () => {
    expect(parseWeight('abc')).toBeUndefined();
  });
});

describe('formatWeight', () => {
  it('should format a number with comma separator', () => {
    expect(formatWeight(5.2)).toBe('5,2');
  });

  it('should return empty string for undefined', () => {
    expect(formatWeight(undefined)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Component behavior
// ---------------------------------------------------------------------------

function dateYearsAgo(years: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d;
}

const validInitial: Partial<RegisterPetInput> = {
  name: 'Late',
  species: 'canino',
  breed: 'Golden',
  birthDate: dateYearsAgo(3),
  sex: 'male',
  weight: 28.5,
  castrated: true,
};

describe('PetForm', () => {
  it('should render "Novo pet" title when no initial is provided', () => {
    render(<PetForm onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Novo pet' })).toBeInTheDocument();
  });

  it('should render "Editar pet" title when initial is provided', () => {
    render(<PetForm initial={validInitial} onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Editar pet' })).toBeInTheDocument();
  });

  it('should call onCancel when Cancelar is clicked', () => {
    const onCancel = vi.fn();
    render(<PetForm onSave={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onSave with valid data when submitting a pre-populated form', () => {
    const onSave = vi.fn();
    render(<PetForm initial={validInitial} onSave={onSave} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const saved = onSave.mock.calls[0][0] as RegisterPetInput;
    expect(saved.name).toBe('Late');
    expect(saved.species).toBe('canino');
    expect(saved.breed).toBe('Golden');
    expect(saved.sex).toBe('male');
    expect(saved.weight).toBe(28.5);
    expect(saved.castrated).toBe(true);
    expect(saved.birthDate).toBeInstanceOf(Date);
  });

  it('should display per-field errors and not call onSave on invalid submission', () => {
    const onSave = vi.fn();
    render(<PetForm onSave={onSave} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar pet' }));

    expect(onSave).not.toHaveBeenCalled();
    // Some field-level errors must show up.
    expect(screen.getByText(/Nome é obrigatório/i)).toBeInTheDocument();
    expect(screen.getByText(/Raça é obrigatória/i)).toBeInTheDocument();
    expect(screen.getByText(/Selecione o sexo do pet/i)).toBeInTheDocument();
  });

  it('should accept comma-formatted weight and convert it to a number on save', () => {
    const onSave = vi.fn();
    render(
      <PetForm
        initial={{ ...validInitial, weight: undefined }}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );

    const weightInput = screen.getByLabelText(/Peso \(kg\)/i) as HTMLInputElement;
    fireEvent.change(weightInput, { target: { value: '5,2' } });

    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const saved = onSave.mock.calls[0][0] as RegisterPetInput;
    expect(saved.weight).toBe(5.2);
  });
});
