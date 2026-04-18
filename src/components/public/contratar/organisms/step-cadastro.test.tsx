import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StepCadastro } from './step-cadastro';
import type { CepResult } from '@/lib/cep';

// Mock lookupCep so tests never hit real network
vi.mock('@/lib/cep', () => ({
  lookupCep: vi.fn(),
}));

import { lookupCep } from '@/lib/cep';

const mockLookupCep = lookupCep as ReturnType<typeof vi.fn>;

function buildData(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Maria da Silva',
    cpf: '529.982.247-25',
    email: 'maria@example.com',
    phone: '(11) 98765-4321',
    address: {
      cep: '01310-100',
      street: 'Avenida Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    },
    ...overrides,
  };
}

describe('StepCadastro', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should populate address fields after successful CEP lookup', async () => {
    const cepResult: CepResult = {
      street: 'Rua das Flores',
      neighborhood: 'Centro',
      city: 'Curitiba',
      state: 'PR',
    };
    mockLookupCep.mockResolvedValue(cepResult);

    const onAddressLookup = vi.fn();
    render(
      <StepCadastro
        data={{ address: { cep: '', street: '', number: '', city: '', state: '' } }}
        errors={{}}
        onChange={vi.fn()}
        onAddressLookup={onAddressLookup}
        onNext={vi.fn()}
      />,
    );

    const cepInput = screen.getByPlaceholderText('00000-000');
    fireEvent.change(cepInput, { target: { value: '80010110' } });
    fireEvent.blur(cepInput);

    await waitFor(() => {
      expect(onAddressLookup).toHaveBeenCalledWith(cepResult);
    });
  });

  it('should call onNext when the advance button is clicked', () => {
    const onNext = vi.fn();
    render(
      <StepCadastro
        data={buildData()}
        errors={{}}
        onChange={vi.fn()}
        onAddressLookup={vi.fn()}
        onNext={onNext}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /avançar/i }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('should call onChange with cpf field when user types in CPF input', () => {
    const onChange = vi.fn();
    render(
      <StepCadastro
        data={{}}
        errors={{}}
        onChange={onChange}
        onAddressLookup={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    const cpfInput = screen.getByPlaceholderText('000.000.000-00');
    fireEvent.change(cpfInput, { target: { value: '52998224725' } });

    expect(onChange).toHaveBeenCalledWith('cpf', expect.stringContaining('529'));
  });

  it('should call onChange with phone field when user types in phone input', () => {
    const onChange = vi.fn();
    render(
      <StepCadastro
        data={{}}
        errors={{}}
        onChange={onChange}
        onAddressLookup={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    const phoneInput = screen.getByPlaceholderText('(11) 99999-9999');
    fireEvent.change(phoneInput, { target: { value: '11987654321' } });

    expect(onChange).toHaveBeenCalledWith('phone', expect.stringContaining('(11)'));
  });

  it('should call onChange with address.cep when user types in CEP input', () => {
    const onChange = vi.fn();
    mockLookupCep.mockResolvedValue(null);
    render(
      <StepCadastro
        data={{}}
        errors={{}}
        onChange={onChange}
        onAddressLookup={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    const cepInput = screen.getByPlaceholderText('00000-000');
    fireEvent.change(cepInput, { target: { value: '01310100' } });

    expect(onChange).toHaveBeenCalledWith('address.cep', expect.stringContaining('01310'));
  });
});
