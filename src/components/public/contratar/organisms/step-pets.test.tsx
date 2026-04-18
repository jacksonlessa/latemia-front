import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepPets } from './step-pets';

const basePet = { _id: 'pet-1', name: '', species: 'canino' as const, breed: '', age_years: 0, age_months: 0, weight: 5, castrated: false };

describe('StepPets', () => {
  it('should disable the remove button when only one pet card is present', () => {
    render(
      <StepPets
        pets={[basePet]}
        errors={{}}
        onPetChange={vi.fn()}
        onAddPet={vi.fn()}
        onRemovePet={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        pricePerPetCents={2500}
      />,
    );

    const removeButton = screen.getByRole('button', { name: 'Remover pet 1' });
    expect(removeButton).toBeDisabled();
  });

  it('should enable the remove button for each card when multiple pets are present', () => {
    const pet2 = { ...basePet, _id: 'pet-2' };

    render(
      <StepPets
        pets={[basePet, pet2]}
        errors={{}}
        onPetChange={vi.fn()}
        onAddPet={vi.fn()}
        onRemovePet={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        pricePerPetCents={2500}
      />,
    );

    const removeButtons = screen.getAllByRole('button', { name: /Remover pet/ });
    expect(removeButtons).toHaveLength(2);
    removeButtons.forEach((btn) => expect(btn).not.toBeDisabled());
  });

  it('should display the correct subtotal for one pet', () => {
    render(
      <StepPets
        pets={[basePet]}
        errors={{}}
        onPetChange={vi.fn()}
        onAddPet={vi.fn()}
        onRemovePet={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        pricePerPetCents={2500}
      />,
    );

    // The price-per-pet and total are both R$ 25,00 when there is 1 pet
    const matches = screen.getAllByText(/R\$\s?25,00/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('should not allow advancing with zero pets', () => {
    const onNext = vi.fn();

    render(
      <StepPets
        pets={[]}
        errors={{}}
        onPetChange={vi.fn()}
        onAddPet={vi.fn()}
        onRemovePet={vi.fn()}
        onNext={onNext}
        onBack={vi.fn()}
        pricePerPetCents={2500}
      />,
    );

    const avancarButton = screen.getByRole('button', { name: 'Avançar' });
    expect(avancarButton).toBeDisabled();
  });

  it('should display the correct subtotal for three pets', () => {
    const pets = [
      basePet,
      { ...basePet, _id: 'pet-2' },
      { ...basePet, _id: 'pet-3' },
    ];

    render(
      <StepPets
        pets={pets}
        errors={{}}
        onPetChange={vi.fn()}
        onAddPet={vi.fn()}
        onRemovePet={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        pricePerPetCents={2500}
      />,
    );

    // Subtotal: R$ 25,00 × 3 pets = R$ 75,00
    expect(screen.getByText(/R\$\s?75,00/)).toBeInTheDocument();
  });
});
