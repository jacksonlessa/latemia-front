import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanStatusBadge } from './PlanStatusBadge';

describe('PlanStatusBadge', () => {
  it('should render "Pendente" label when status is pendente', () => {
    render(<PlanStatusBadge status="pendente" />);
    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });

  it('should render "Ativo" label when status is ativo', () => {
    render(<PlanStatusBadge status="ativo" />);
    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('should render "Inadimplente" label when status is inadimplente', () => {
    render(<PlanStatusBadge status="inadimplente" />);
    expect(screen.getByText('Inadimplente')).toBeInTheDocument();
  });

  it('should render "Cancelado" label when status is cancelado', () => {
    render(<PlanStatusBadge status="cancelado" />);
    expect(screen.getByText('Cancelado')).toBeInTheDocument();
  });

  it('should include accessible aria-label with status name when rendered', () => {
    render(<PlanStatusBadge status="ativo" />);
    expect(screen.getByLabelText('Status: Ativo')).toBeInTheDocument();
  });

  it('should apply amber color class when status is pendente', () => {
    const { container } = render(<PlanStatusBadge status="pendente" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('amber');
  });

  it('should apply red color class when status is inadimplente', () => {
    const { container } = render(<PlanStatusBadge status="inadimplente" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('red');
  });

  it('should apply green color class when status is ativo', () => {
    const { container } = render(<PlanStatusBadge status="ativo" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('4E8C75');
  });

  it('should apply gray color class when status is cancelado', () => {
    const { container } = render(<PlanStatusBadge status="cancelado" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('gray');
  });
});
