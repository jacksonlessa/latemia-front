/**
 * Unit tests for the root Error boundary component.
 *
 * Verifies: renders without throwing, shows requestId in a <code> element,
 * copy button is present and calls navigator.clipboard.writeText, and the
 * "Tentar novamente" button invokes reset().
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Error from './error';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/lib/observability/client-error-reporter', () => ({
  reportClientError: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/observability/request-id', () => ({
  getOrCreateAttemptId: vi.fn().mockReturnValue('test-request-id-1234'),
}));

vi.mock('@/lib/observability/stack-hash', () => ({
  hashStack: vi.fn().mockResolvedValue('abc123def456abcd'),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeError(message: string): globalThis.Error & { digest?: string } {
  const e = new globalThis.Error(message);
  return e;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Error boundary (app/error.tsx)', () => {
  const writeTextMock = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render without throwing when given a basic error', () => {
    expect(() =>
      render(<Error error={makeError('Test error')} reset={() => {}} />),
    ).not.toThrow();
  });

  it('should display the requestId inside a <code> element', () => {
    render(<Error error={makeError('Some error')} reset={() => {}} />);

    const code = screen.getByText('test-request-id-1234');
    expect(code.tagName).toBe('CODE');
  });

  it('should have a "Copiar" button that calls navigator.clipboard.writeText with requestId', async () => {
    render(<Error error={makeError('Some error')} reset={() => {}} />);

    const copyButton = screen.getByRole('button', { name: /copiar/i });
    expect(copyButton).toBeInTheDocument();

    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith('test-request-id-1234');
    });
  });

  it('should call reset() when "Tentar novamente" button is clicked', () => {
    const resetMock = vi.fn();
    render(<Error error={makeError('Some error')} reset={resetMock} />);

    const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
    fireEvent.click(retryButton);

    expect(resetMock).toHaveBeenCalledOnce();
  });

  it('should call reportClientError via useEffect after render', async () => {
    const { reportClientError } = await import(
      '@/lib/observability/client-error-reporter'
    );

    render(<Error error={makeError('Async error')} reset={() => {}} />);

    await waitFor(() => {
      expect(reportClientError).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'test-request-id-1234',
          stage: 'render',
          message: 'Async error',
        }),
      );
    });
  });

  it('should render a heading with "Algo deu errado"', () => {
    render(<Error error={makeError('oops')} reset={() => {}} />);
    expect(
      screen.getByRole('heading', { name: /algo deu errado/i }),
    ).toBeInTheDocument();
  });
});
