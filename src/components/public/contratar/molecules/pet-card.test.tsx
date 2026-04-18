import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PetCard } from './pet-card';

const noopChange = vi.fn();
const noopRemove = vi.fn();

describe('PetCard', () => {
  it('should show error messages when fields are invalid', () => {
    const errors = {
      species: 'Espécie obrigatória',
      name: 'Nome obrigatório',
      breed: 'Raça obrigatória',
      age_years: 'Idade inválida',
      weight: 'Peso obrigatório',
      castrated: 'Campo obrigatório',
    };

    render(
      <PetCard
        index={0}
        data={{}}
        errors={errors}
        onChange={noopChange}
        onRemove={noopRemove}
        canRemove={false}
      />,
    );

    expect(screen.getByText('Espécie obrigatória')).toBeInTheDocument();
    expect(screen.getByText('Nome obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Raça obrigatória')).toBeInTheDocument();
    expect(screen.getByText('Idade inválida')).toBeInTheDocument();
    expect(screen.getByText('Peso obrigatório')).toBeInTheDocument();
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
  });

  it('should mark name input as aria-invalid when name error is present', () => {
    render(
      <PetCard
        index={0}
        data={{}}
        errors={{ name: 'Nome obrigatório' }}
        onChange={noopChange}
        onRemove={noopRemove}
        canRemove={false}
      />,
    );

    const nameInput = screen.getByPlaceholderText('Ex: Rex');
    expect(nameInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('should not set aria-invalid on name input when there is no error', () => {
    render(
      <PetCard
        index={0}
        data={{}}
        errors={{}}
        onChange={noopChange}
        onRemove={noopRemove}
        canRemove={false}
      />,
    );

    const nameInput = screen.getByPlaceholderText('Ex: Rex');
    expect(nameInput).not.toHaveAttribute('aria-invalid');
  });

  it('should disable the remove button when canRemove is false', () => {
    render(
      <PetCard
        index={0}
        data={{}}
        errors={{}}
        onChange={noopChange}
        onRemove={noopRemove}
        canRemove={false}
      />,
    );

    const removeButton = screen.getByRole('button', { name: 'Remover pet 1' });
    expect(removeButton).toBeDisabled();
  });

  it('should enable the remove button when canRemove is true', () => {
    render(
      <PetCard
        index={1}
        data={{}}
        errors={{}}
        onChange={noopChange}
        onRemove={noopRemove}
        canRemove={true}
      />,
    );

    const removeButton = screen.getByRole('button', { name: 'Remover pet 2' });
    expect(removeButton).not.toBeDisabled();
  });
});
