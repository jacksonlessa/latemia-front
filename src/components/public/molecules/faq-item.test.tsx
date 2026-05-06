import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FaqItem } from './faq-item';

describe('FaqItem', () => {
  it('should render with aria-expanded=false when initially closed', () => {
    render(<FaqItem question="Q?" answer="A." />);
    const summary = screen.getByText('Q?').closest('summary');
    expect(summary).toHaveAttribute('aria-expanded', 'false');
  });

  it('should render answer text regardless of open state', () => {
    render(<FaqItem question="Q?" answer="A-answer" />);
    expect(screen.getByText('A-answer')).toBeInTheDocument();
  });

  it('should toggle aria-expanded to true when details is opened', () => {
    render(<FaqItem question="Q?" answer="A." />);
    const details = screen.getByText('Q?').closest('details') as HTMLDetailsElement;
    const summary = details.querySelector('summary') as HTMLElement;

    expect(summary).toHaveAttribute('aria-expanded', 'false');

    details.open = true;
    fireEvent(details, new Event('toggle'));

    expect(summary).toHaveAttribute('aria-expanded', 'true');
  });
});
