import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AvailabilityBadge } from './availability-badge';

describe('AvailabilityBadge', () => {
  it('should render immediate label when variant is immediate', () => {
    render(<AvailabilityBadge variant="immediate" />);
    expect(screen.getByText('Desde o 1º pagamento')).toBeInTheDocument();
  });

  it('should apply green color classes when variant is immediate', () => {
    const { container } = render(<AvailabilityBadge variant="immediate" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('4E8C75');
    expect(badge.className).toContain('EAF4F0');
  });

  it('should render after-waiting label when variant is after-waiting', () => {
    render(<AvailabilityBadge variant="after-waiting" />);
    expect(screen.getByText('Após 180 dias de carência')).toBeInTheDocument();
  });

  it('should apply amber color classes when variant is after-waiting', () => {
    const { container } = render(<AvailabilityBadge variant="after-waiting" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('amber');
  });
});
