import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CopyableId } from './CopyableId';

describe('CopyableId', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('should render the value as monospace text when given', () => {
    render(<CopyableId value="sub_abc123" label="ID da assinatura" />);
    expect(screen.getByText('sub_abc123')).toBeInTheDocument();
  });

  it('should expose accessible copy button label when label is provided', () => {
    render(<CopyableId value="sub_abc123" label="ID da assinatura" />);
    expect(
      screen.getByRole('button', { name: /Copiar ID da assinatura/i }),
    ).toBeInTheDocument();
  });

  it('should write value to clipboard when copy button is clicked', async () => {
    render(<CopyableId value="sub_abc123" />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('sub_abc123'),
    );
  });
});
