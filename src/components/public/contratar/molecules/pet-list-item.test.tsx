import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PetListItem } from './pet-list-item';
import type { RegisterPetInput } from '@/lib/types/pet';

function dateYearsAgo(years: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d;
}

const basePet: RegisterPetInput & { _id: string } = {
  _id: 'pet-1',
  name: 'Late',
  species: 'canino',
  breed: 'Golden Retriever',
  birthDate: dateYearsAgo(3),
  sex: 'male',
  weight: 28.5,
  castrated: false,
};

describe('PetListItem', () => {
  it('should render pet name and a description with breed, age, sex', () => {
    render(
      <PetListItem
        pet={basePet}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        canRemove
      />,
    );

    expect(screen.getByText('Late')).toBeInTheDocument();
    expect(screen.getByText(/Golden Retriever/)).toBeInTheDocument();
    expect(screen.getByText(/3 anos/)).toBeInTheDocument();
    expect(screen.getByText(/♂/)).toBeInTheDocument();
  });

  it('should show "castrado" suffix for male castrated pet', () => {
    render(
      <PetListItem
        pet={{ ...basePet, castrated: true }}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        canRemove
      />,
    );
    expect(screen.getByText(/castrado/)).toBeInTheDocument();
  });

  it('should show "castrada" suffix for female castrated pet', () => {
    render(
      <PetListItem
        pet={{ ...basePet, sex: 'female', castrated: true }}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        canRemove
      />,
    );
    expect(screen.getByText(/castrada/)).toBeInTheDocument();
  });

  it('should call onEdit when the edit button is clicked', () => {
    const onEdit = vi.fn();
    render(
      <PetListItem pet={basePet} onEdit={onEdit} onRemove={vi.fn()} canRemove />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Editar Late' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('should call onRemove when the remove button is clicked', () => {
    const onRemove = vi.fn();
    render(
      <PetListItem pet={basePet} onEdit={vi.fn()} onRemove={onRemove} canRemove />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Remover Late' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('should disable the remove button when canRemove is false', () => {
    render(
      <PetListItem
        pet={basePet}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        canRemove={false}
      />,
    );
    expect(screen.getByRole('button', { name: 'Remover Late' })).toBeDisabled();
  });
});
