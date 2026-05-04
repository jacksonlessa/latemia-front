import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StepCadastro } from './step-cadastro';
import type { CepResult } from '@/lib/cep';

// Mock lookupCep so tests never hit real network
vi.mock('@/lib/cep', () => ({
  lookupCep: vi.fn(),
}));

// Mock useTouchpoints so we can drive the bundle returned by the public
// TouchpointProvider deterministically in unit tests (task 7.0).
import type { TouchpointContextValue } from '@/domain/touchpoints/touchpoints.types';
const mockUseTouchpoints = vi.fn<() => TouchpointContextValue>(() => ({
  firstTouch: null,
  lastTouch: null,
}));
vi.mock('@/domain/touchpoints/touchpoint-provider', () => ({
  useTouchpoints: () => mockUseTouchpoints(),
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
    mockUseTouchpoints.mockReturnValue({ firstTouch: null, lastTouch: null });
  });

  it('should populate address fields after successful CEP lookup for a serviced city', async () => {
    const cepResult: CepResult = {
      street: 'Rua das Flores',
      neighborhood: 'Centro',
      city: 'Camboriú',
      state: 'SC',
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
    fireEvent.change(cepInput, { target: { value: '88340000' } });
    fireEvent.blur(cepInput);

    await waitFor(() => {
      expect(onAddressLookup).toHaveBeenCalledWith(cepResult);
    });
  });

  it('should show city-not-serviced error and clear address when CEP returns an out-of-area city', async () => {
    const cepResult: CepResult = {
      street: 'Rua XV de Novembro',
      neighborhood: 'Centro',
      city: 'Florianópolis',
      state: 'SC',
    };
    mockLookupCep.mockResolvedValue(cepResult);

    const onAddressLookup = vi.fn();
    const onChange = vi.fn();
    render(
      <StepCadastro
        data={{ address: { cep: '', street: '', number: '', city: '', state: '' } }}
        errors={{}}
        onChange={onChange}
        onAddressLookup={onAddressLookup}
        onNext={vi.fn()}
      />,
    );

    const cepInput = screen.getByPlaceholderText('00000-000');
    fireEvent.change(cepInput, { target: { value: '88010000' } });
    fireEvent.blur(cepInput);

    await waitFor(() => {
      expect(
        screen.getByText(/No momento atendemos apenas/i),
      ).toBeInTheDocument();
    });

    // Parent lookup should NOT be called with valid data
    expect(onAddressLookup).toHaveBeenCalledWith(null);
    // Address clearing calls should be made
    expect(onChange).toHaveBeenCalledWith('address.city', '');
    expect(onChange).toHaveBeenCalledWith('address.street', '');
  });

  it('should clear the CEP error when user starts typing a new CEP', async () => {
    const cepResult: CepResult = {
      street: 'Rua XV de Novembro',
      neighborhood: 'Centro',
      city: 'Florianópolis',
      state: 'SC',
    };
    mockLookupCep.mockResolvedValue(cepResult);

    render(
      <StepCadastro
        data={{ address: { cep: '', street: '', number: '', city: '', state: '' } }}
        errors={{}}
        onChange={vi.fn()}
        onAddressLookup={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    const cepInput = screen.getByPlaceholderText('00000-000');
    fireEvent.change(cepInput, { target: { value: '88010000' } });
    fireEvent.blur(cepInput);

    await waitFor(() => {
      expect(screen.getByText(/No momento atendemos apenas/i)).toBeInTheDocument();
    });

    // Now user starts typing again — error should clear
    fireEvent.change(cepInput, { target: { value: '88340' } });
    expect(screen.queryByText(/No momento atendemos apenas/i)).not.toBeInTheDocument();
  });

  it('should render the Complemento field between Número and Bairro', () => {
    render(
      <StepCadastro
        data={{}}
        errors={{}}
        onChange={vi.fn()}
        onAddressLookup={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    const complement = screen.getByPlaceholderText(/Apto 205/i);
    expect(complement).toBeInTheDocument();
    expect(complement).toHaveAttribute('maxLength', '60');
  });

  it('should render the Complemento field with value from data', () => {
    render(
      <StepCadastro
        data={{
          address: {
            cep: '88340-000',
            street: 'Rua das Flores',
            number: '10',
            complement: 'Apto 302',
            neighborhood: 'Centro',
            city: 'Camboriú',
            state: 'SC',
          },
        }}
        errors={{}}
        onChange={vi.fn()}
        onAddressLookup={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    const complement = screen.getByPlaceholderText(/Apto 205/i) as HTMLInputElement;
    expect(complement.value).toBe('Apto 302');
  });

  it('should render the Cidade field as readOnly', () => {
    render(
      <StepCadastro
        data={buildData()}
        errors={{}}
        onChange={vi.fn()}
        onAddressLookup={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    const cityInput = screen.getByPlaceholderText(/Preenchida automaticamente/i);
    expect(cityInput).toHaveAttribute('readOnly');
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

  it('should display CEP error from props', () => {
    render(
      <StepCadastro
        data={{}}
        errors={{ 'address.cep': 'CEP é obrigatório.' }}
        onChange={vi.fn()}
        onAddressLookup={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(screen.getByText('CEP é obrigatório.')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Touchpoints integration (task 7.0 — seo-analytics-lgpd-utm)
  // -------------------------------------------------------------------------

  it('should call onTouchpointsResolved with both first and last when useTouchpoints returns both', () => {
    const firstTouch = {
      utmSource: 'instagram',
      utmMedium: 'social',
      utmCampaign: 'first-campaign',
      utmContent: null,
      utmTerm: null,
      gclid: null,
      fbclid: null,
      referrer: null,
      referralCode: null,
      capturedAt: '2026-05-04T10:00:00.000Z',
    };
    const lastTouch = {
      ...firstTouch,
      utmCampaign: 'last-campaign',
      capturedAt: '2026-05-04T11:00:00.000Z',
    };
    mockUseTouchpoints.mockReturnValue({ firstTouch, lastTouch });

    const onTouchpointsResolved = vi.fn();
    const onNext = vi.fn();
    render(
      <StepCadastro
        data={buildData()}
        errors={{}}
        onChange={vi.fn()}
        onAddressLookup={vi.fn()}
        onNext={onNext}
        onTouchpointsResolved={onTouchpointsResolved}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /avançar/i }));

    expect(onTouchpointsResolved).toHaveBeenCalledTimes(1);
    expect(onTouchpointsResolved).toHaveBeenCalledWith({
      first: firstTouch,
      last: lastTouch,
    });
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('should call onTouchpointsResolved with an empty bundle when useTouchpoints returns nulls', () => {
    mockUseTouchpoints.mockReturnValue({ firstTouch: null, lastTouch: null });

    const onTouchpointsResolved = vi.fn();
    const onNext = vi.fn();
    render(
      <StepCadastro
        data={buildData()}
        errors={{}}
        onChange={vi.fn()}
        onAddressLookup={vi.fn()}
        onNext={onNext}
        onTouchpointsResolved={onTouchpointsResolved}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /avançar/i }));

    expect(onTouchpointsResolved).toHaveBeenCalledWith({});
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('should omit `last` (no null) when only firstTouch is captured', () => {
    const firstTouch = {
      utmSource: 'podcast',
      utmMedium: 'audio',
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
      gclid: null,
      fbclid: null,
      referrer: null,
      referralCode: 'podcastXYZ',
      capturedAt: '2026-05-04T10:00:00.000Z',
    };
    mockUseTouchpoints.mockReturnValue({ firstTouch, lastTouch: null });

    const onTouchpointsResolved = vi.fn();
    render(
      <StepCadastro
        data={buildData()}
        errors={{}}
        onChange={vi.fn()}
        onAddressLookup={vi.fn()}
        onNext={vi.fn()}
        onTouchpointsResolved={onTouchpointsResolved}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /avançar/i }));

    const bundle = onTouchpointsResolved.mock.calls[0][0];
    expect(bundle.first).toEqual(firstTouch);
    expect('last' in bundle).toBe(false);
  });

  it('should still call onNext when onTouchpointsResolved is not provided (backwards-compatible)', () => {
    const firstTouch = {
      utmSource: 'instagram',
      utmMedium: 'social',
      utmCampaign: 'x',
      utmContent: null,
      utmTerm: null,
      gclid: null,
      fbclid: null,
      referrer: null,
      referralCode: null,
      capturedAt: '2026-05-04T10:00:00.000Z',
    };
    mockUseTouchpoints.mockReturnValue({ firstTouch, lastTouch: null });

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

  it('should have aria-invalid and aria-describedby on CEP field when there is an error', async () => {
    const cepResult: CepResult = {
      street: 'Rua XV de Novembro',
      neighborhood: 'Centro',
      city: 'Florianópolis',
      state: 'SC',
    };
    mockLookupCep.mockResolvedValue(cepResult);

    render(
      <StepCadastro
        data={{ address: { cep: '', street: '', number: '', city: '', state: '' } }}
        errors={{}}
        onChange={vi.fn()}
        onAddressLookup={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    const cepInput = screen.getByPlaceholderText('00000-000');
    fireEvent.change(cepInput, { target: { value: '88010000' } });
    fireEvent.blur(cepInput);

    await waitFor(() => {
      expect(cepInput).toHaveAttribute('aria-invalid', 'true');
      expect(cepInput).toHaveAttribute('aria-describedby', 'address-cep-error');
    });
  });
});
