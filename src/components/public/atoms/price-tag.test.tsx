import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceTag } from './price-tag';

describe('PriceTag', () => {
  it('should format 2500 cents as R$ 25,00 when rendered in pt-BR locale', () => {
    render(<PriceTag cents={2500} />);
    expect(screen.getByText(/R\$\s?25,00/)).toBeInTheDocument();
  });

  it('should format 10000 cents as R$ 100,00 when rendered', () => {
    render(<PriceTag cents={10000} />);
    expect(screen.getByText(/R\$\s?100,00/)).toBeInTheDocument();
  });
});
