import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanStatusBadge } from './PlanStatusBadge';

describe('PlanStatusBadge', () => {
  it('should render "Pendente" label when status is pendente', () => {
    render(<PlanStatusBadge status="pendente" />);
    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });

  it('should render "Carência" label when status is carencia', () => {
    render(<PlanStatusBadge status="carencia" />);
    expect(screen.getByText('Carência')).toBeInTheDocument();
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

  it('should apply slate color class when status is pendente', () => {
    const { container } = render(<PlanStatusBadge status="pendente" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('slate');
  });

  it('should apply amber color class when status is carencia', () => {
    const { container } = render(<PlanStatusBadge status="carencia" />);
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

  it('should render "Estornado" label when status is estornado', () => {
    render(<PlanStatusBadge status="estornado" />);
    expect(screen.getByText('Estornado')).toBeInTheDocument();
  });

  it('should render "Contestado" label when status is contestado', () => {
    render(<PlanStatusBadge status="contestado" />);
    expect(screen.getByText('Contestado')).toBeInTheDocument();
  });

  it('should apply dark slate color class when status is estornado', () => {
    const { container } = render(<PlanStatusBadge status="estornado" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('slate-700');
  });

  it('should apply dark purple color class when status is contestado', () => {
    const { container } = render(<PlanStatusBadge status="contestado" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('purple-950');
  });

  it('should mark terminal status in aria-label when status is estornado', () => {
    render(<PlanStatusBadge status="estornado" />);
    expect(
      screen.getByLabelText('Status: Estornado (estado terminal)'),
    ).toBeInTheDocument();
  });

  it('should render lock icon for terminal statuses when status is contestado', () => {
    render(<PlanStatusBadge status="contestado" />);
    expect(screen.getByTestId('terminal-icon')).toBeInTheDocument();
  });

  it('should not render lock icon for non-terminal statuses when status is ativo', () => {
    render(<PlanStatusBadge status="ativo" />);
    expect(screen.queryByTestId('terminal-icon')).not.toBeInTheDocument();
  });
});
