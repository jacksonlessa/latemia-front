import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { StepContrato } from './step-contrato';

// ---------------------------------------------------------------------------
// Module mocks — keep the OTP use-cases out of the unit under test so
// step-contrato.test.tsx focuses on the bifurcation and state machine.
// ---------------------------------------------------------------------------

const mockRequestExecute = vi.fn();
const mockVerifyExecute = vi.fn();
const mockResendExecute = vi.fn();

vi.mock('@/domain/contract/request-contract-otp.use-case', () => ({
  RequestContractOtpUseCase: class {
    execute = (input: unknown) => mockRequestExecute(input);
  },
}));

vi.mock('@/domain/contract/verify-contract-otp.use-case', () => ({
  VerifyContractOtpUseCase: class {
    execute = (input: unknown) => mockVerifyExecute(input);
  },
}));

vi.mock('@/domain/contract/resend-contract-otp.use-case', () => ({
  ResendContractOtpUseCase: class {
    execute = (input: unknown) => mockResendExecute(input);
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('crypto', {
    randomUUID: vi.fn().mockReturnValue('attempt-uuid-1'),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('StepContrato — legacy flow (otpEnabled=false)', () => {
  const baseProps = {
    accepted: false,
    onAcceptedChange: vi.fn(),
    onNext: vi.fn(),
    onBack: vi.fn(),
  };

  it('should disable Avançar button when contract not accepted', () => {
    render(<StepContrato {...baseProps} accepted={false} />);
    const avancarButton = screen.getByRole('button', { name: 'Avançar' });
    expect(avancarButton).toBeDisabled();
  });

  it('should enable Avançar button when contract is accepted', () => {
    render(<StepContrato {...baseProps} accepted={true} />);
    const avancarButton = screen.getByRole('button', { name: 'Avançar' });
    expect(avancarButton).not.toBeDisabled();
  });

  it('should call onAcceptedChange with true when checkbox is checked', () => {
    const onAcceptedChange = vi.fn();
    render(
      <StepContrato
        {...baseProps}
        accepted={false}
        onAcceptedChange={onAcceptedChange}
      />,
    );
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(onAcceptedChange).toHaveBeenCalledWith(true);
  });

  it('should call onNext directly when Avançar is clicked and OTP is disabled', () => {
    const onNext = vi.fn();
    render(<StepContrato {...baseProps} accepted={true} onNext={onNext} />);
    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(onNext).toHaveBeenCalledOnce();
    expect(mockRequestExecute).not.toHaveBeenCalled();
  });

  it('should call onBack when Voltar button is clicked', () => {
    const onBack = vi.fn();
    render(<StepContrato {...baseProps} onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('should render unchanged when otpEnabled is omitted (default false)', () => {
    render(<StepContrato {...baseProps} accepted={true} />);
    expect(screen.getByRole('button', { name: 'Avançar' })).not.toBeDisabled();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(
      screen.queryByLabelText('Código de 6 dígitos'),
    ).not.toBeInTheDocument();
  });
});

describe('StepContrato — OTP flow (otpEnabled=true)', () => {
  const baseProps = {
    accepted: true,
    onAcceptedChange: vi.fn(),
    onNext: vi.fn(),
    onBack: vi.fn(),
    otpEnabled: true,
    phone: '+5511987654321',
    contractAttemptId: null as string | null,
    onContractAttemptIdAssigned: vi.fn(),
    onVerified: vi.fn(),
  };

  it('should request OTP and render the panel after clicking Avançar', async () => {
    mockRequestExecute.mockResolvedValueOnce({
      phoneMasked: '(11) 9****-4321',
      expiresInSeconds: 600,
      cooldownSeconds: 60,
    });

    const onContractAttemptIdAssigned = vi.fn();
    render(
      <StepContrato
        {...baseProps}
        onContractAttemptIdAssigned={onContractAttemptIdAssigned}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    });

    await waitFor(() => {
      expect(mockRequestExecute).toHaveBeenCalledOnce();
    });
    expect(mockRequestExecute).toHaveBeenCalledWith({
      contractAttemptId: 'attempt-uuid-1',
      phone: '+5511987654321',
    });
    expect(onContractAttemptIdAssigned).toHaveBeenCalledWith('attempt-uuid-1');
    expect(screen.getByLabelText('Código de 6 dígitos')).toBeInTheDocument();
    expect(screen.getByText('(11) 9****-4321')).toBeInTheDocument();
  });

  it('should NOT call onNext immediately when OTP is enabled', async () => {
    mockRequestExecute.mockResolvedValueOnce({
      phoneMasked: '(11) 9****-4321',
      expiresInSeconds: 600,
      cooldownSeconds: 60,
    });
    const onNext = vi.fn();

    render(<StepContrato {...baseProps} onNext={onNext} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    });

    await waitFor(() => {
      expect(mockRequestExecute).toHaveBeenCalledOnce();
    });
    expect(onNext).not.toHaveBeenCalled();
  });

  it('should call onVerified and onNext after a successful verify', async () => {
    mockRequestExecute.mockResolvedValueOnce({
      phoneMasked: '(11) 9****-4321',
      expiresInSeconds: 600,
      cooldownSeconds: 60,
    });
    mockVerifyExecute.mockResolvedValueOnce({
      verificationToken: 'tok_xyz',
      expiresInSeconds: 300,
    });

    const onVerified = vi.fn();
    const onNext = vi.fn();
    const onContractAttemptIdAssigned = vi.fn();

    render(
      <StepContrato
        {...baseProps}
        onVerified={onVerified}
        onNext={onNext}
        onContractAttemptIdAssigned={onContractAttemptIdAssigned}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    });

    const input = await screen.findByLabelText('Código de 6 dígitos');

    await act(async () => {
      fireEvent.change(input, { target: { value: '123456' } });
    });

    await waitFor(() => {
      expect(mockVerifyExecute).toHaveBeenCalledWith({
        contractAttemptId: 'attempt-uuid-1',
        code: '123456',
      });
    });
    await waitFor(() => {
      expect(onVerified).toHaveBeenCalledWith('tok_xyz');
    });
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('should surface the user-facing error message when verify fails', async () => {
    const { ValidationError } = await import('@/lib/validation-error');
    mockRequestExecute.mockResolvedValueOnce({
      phoneMasked: '(11) 9****-4321',
      expiresInSeconds: 600,
      cooldownSeconds: 60,
    });
    mockVerifyExecute.mockRejectedValueOnce(
      new ValidationError({
        _form: 'Código incorreto. Verifique e tente novamente.',
        _code: 'OTP_INVALID',
      }),
    );

    render(<StepContrato {...baseProps} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    });

    const input = await screen.findByLabelText('Código de 6 dígitos');

    await act(async () => {
      fireEvent.change(input, { target: { value: '111111' } });
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Código incorreto');
    });
  });

  it('should silently fall back to onNext when OTP_FEATURE_DISABLED is thrown', async () => {
    const { FeatureDisabledError } = await import(
      '@/lib/feature-disabled-error'
    );
    mockRequestExecute.mockRejectedValueOnce(
      new FeatureDisabledError('OTP_FEATURE_DISABLED'),
    );
    const onNext = vi.fn();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<StepContrato {...baseProps} onNext={onNext} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    });

    await waitFor(() => {
      expect(onNext).toHaveBeenCalledOnce();
    });
    expect(
      screen.queryByLabelText('Código de 6 dígitos'),
    ).not.toBeInTheDocument();
    warnSpy.mockRestore();
  });

  it('should fall back to legacy onNext when phone is missing (defensive)', () => {
    const onNext = vi.fn();
    render(
      <StepContrato {...baseProps} phone={undefined} onNext={onNext} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(onNext).toHaveBeenCalledOnce();
    expect(mockRequestExecute).not.toHaveBeenCalled();
  });
});
