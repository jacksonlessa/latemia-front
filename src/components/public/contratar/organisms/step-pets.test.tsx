import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { StepPets } from './step-pets';
import type { RegisterPetInput } from '@/lib/types/pet';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function yearsAgo(years: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d;
}

const rex: RegisterPetInput & { _id: string } = {
  _id: 'pet-1',
  name: 'Rex',
  species: 'canino',
  breed: 'Labrador',
  birthDate: yearsAgo(3),
  sex: 'male',
  weight: 28.5,
  castrated: true,
};

const mia: RegisterPetInput & { _id: string } = {
  _id: 'pet-2',
  name: 'Mia',
  species: 'felino',
  breed: 'SRD',
  birthDate: yearsAgo(1),
  sex: 'female',
  weight: 4,
  castrated: false,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('StepPets', () => {
  it('should render the PetForm (State A) when pets list is empty', () => {
    render(
      <StepPets
        pets={[]}
        onSavePet={vi.fn()}
        onRemovePet={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        pricePerPetCents={2500}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Novo pet' })).toBeInTheDocument();
    // List/summary controls are not rendered while in State A.
    expect(screen.queryByRole('button', { name: 'Avançar' })).not.toBeInTheDocument();
  });

  it('should render the list (State B) when pets list is not empty', () => {
    render(
      <StepPets
        pets={[rex]}
        onSavePet={vi.fn()}
        onRemovePet={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        pricePerPetCents={2500}
      />,
    );

    expect(screen.getByRole('button', { name: 'Avançar' })).toBeInTheDocument();
    expect(screen.getByText('Rex')).toBeInTheDocument();
  });

  it('should call onSavePet without _id and switch to State B after saving a new pet', () => {
    const onSavePet = vi.fn();

    render(
      <StepPets
        pets={[]}
        onSavePet={onSavePet}
        onRemovePet={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        pricePerPetCents={2500}
      />,
    );

    // Fill the minimum valid form.
    fireEvent.click(screen.getByRole('radio', { name: 'Cachorro' }));
    fireEvent.change(screen.getByLabelText('Nome do pet'), { target: { value: 'Late' } });
    fireEvent.change(screen.getByLabelText('Raça'), { target: { value: 'SRD' } });
    fireEvent.change(screen.getByLabelText(/Idade aproximada/i), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('radio', { name: /Macho/i }));
    fireEvent.change(screen.getByLabelText(/Peso \(kg\)/i), { target: { value: '10' } });

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar pet' }));

    expect(onSavePet).toHaveBeenCalledTimes(1);
    const arg = onSavePet.mock.calls[0][0] as RegisterPetInput & { _id?: string };
    expect(arg._id).toBeUndefined();
    expect(arg.name).toBe('Late');
  });

  it('should load PetForm with existing data when Editar is clicked in State B', () => {
    render(
      <StepPets
        pets={[rex, mia]}
        onSavePet={vi.fn()}
        onRemovePet={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        pricePerPetCents={2500}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Editar Rex' }));

    expect(screen.getByRole('heading', { name: 'Editar pet' })).toBeInTheDocument();
    const nameInput = screen.getByLabelText('Nome do pet') as HTMLInputElement;
    expect(nameInput.value).toBe('Rex');
    const breedInput = screen.getByLabelText('Raça') as HTMLInputElement;
    expect(breedInput.value).toBe('Labrador');
  });

  it('should forward _id to onSavePet when saving an edited pet', () => {
    const onSavePet = vi.fn();

    render(
      <StepPets
        pets={[rex, mia]}
        onSavePet={onSavePet}
        onRemovePet={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        pricePerPetCents={2500}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Editar Rex' }));

    // Tweak name then save.
    fireEvent.change(screen.getByLabelText('Nome do pet'), { target: { value: 'Rex II' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(onSavePet).toHaveBeenCalledTimes(1);
    const arg = onSavePet.mock.calls[0][0] as RegisterPetInput & { _id?: string };
    expect(arg._id).toBe('pet-1');
    expect(arg.name).toBe('Rex II');
  });

  it('should invoke onRemovePet with the pet id when Remover is clicked', () => {
    const onRemovePet = vi.fn();

    render(
      <StepPets
        pets={[rex, mia]}
        onSavePet={vi.fn()}
        onRemovePet={onRemovePet}
        onNext={vi.fn()}
        onBack={vi.fn()}
        pricePerPetCents={2500}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Remover Rex' }));

    expect(onRemovePet).toHaveBeenCalledWith('pet-1');
  });

  it('should disable Avançar when there are zero pets (forced State B)', () => {
    render(
      <StepPets
        pets={[]}
        onSavePet={vi.fn()}
        onRemovePet={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        pricePerPetCents={2500}
        initialEditing={null}
      />,
    );

    expect(screen.getByRole('button', { name: 'Avançar' })).toBeDisabled();
  });

  it('should display the pricing summary in pt-BR currency for multiple pets', () => {
    render(
      <StepPets
        pets={[rex, mia]}
        onSavePet={vi.fn()}
        onRemovePet={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        pricePerPetCents={2500}
      />,
    );

    expect(screen.getByText('2 pets cadastrados')).toBeInTheDocument();
    // Total: R$ 50,00. Use a non-strict matcher to tolerate non-breaking spaces.
    const summary = screen.getByText('2 pets cadastrados').closest('div')?.parentElement
      ?.parentElement as HTMLElement;
    expect(within(summary).getByText(/R\$\s*50,00/)).toBeInTheDocument();
  });

  it('should switch to PetForm when "Adicionar outro pet" is clicked', () => {
    render(
      <StepPets
        pets={[rex]}
        onSavePet={vi.fn()}
        onRemovePet={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        pricePerPetCents={2500}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Adicionar outro pet/i }));

    expect(screen.getByRole('heading', { name: 'Novo pet' })).toBeInTheDocument();
  });

  it('should call onBack when Voltar is clicked', () => {
    const onBack = vi.fn();

    render(
      <StepPets
        pets={[rex]}
        onSavePet={vi.fn()}
        onRemovePet={vi.fn()}
        onNext={vi.fn()}
        onBack={onBack}
        pricePerPetCents={2500}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
