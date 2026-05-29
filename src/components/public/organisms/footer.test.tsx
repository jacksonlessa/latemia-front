import type React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConsentProvider } from '@/components/public/consent/consent-provider';
import { Footer } from './footer';

vi.mock('next/image', () => ({
  default: (props: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt} src={props.src} />
  ),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function renderFooter() {
  return render(
    <ConsentProvider>
      <Footer />
    </ConsentProvider>,
  );
}

describe('Footer', () => {
  it('should render footer with links for all 3 groups', () => {
    renderFooter();

    expect(screen.getByRole('link', { name: /clube de vantagens/i })).toHaveAttribute(
      'href',
      '/clube-de-vantagens',
    );
    expect(screen.getByRole('link', { name: /proteção emergencial/i })).toHaveAttribute(
      'href',
      '/emergencia',
    );
    expect(screen.getByRole('link', { name: /contratar plano/i })).toHaveAttribute(
      'href',
      '/contratar',
    );
    expect(screen.getByRole('link', { name: /tabela de benefícios/i })).toHaveAttribute(
      'href',
      '/beneficios',
    );
    expect(screen.getByRole('link', { name: /sobre a clínica/i })).toHaveAttribute(
      'href',
      '/sobre-a-clinica',
    );
  });

  it('should include WhatsApp link with wa.me', () => {
    renderFooter();
    const whatsapp = screen.getByRole('link', { name: /whatsapp/i });
    expect(whatsapp.getAttribute('href')).toContain('wa.me/');
  });

  it('should include SAC mailto link', () => {
    renderFooter();
    const sac = screen.getByRole('link', { name: /^sac$/i });
    expect(sac.getAttribute('href')).toMatch(/mailto:sac@/);
  });
});
