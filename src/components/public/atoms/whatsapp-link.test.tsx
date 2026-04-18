import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WhatsAppLink } from './whatsapp-link';
import { publicSite } from '@/config/public-site';

describe('WhatsAppLink', () => {
  it('should build wa.me href with encoded default message when no message prop is provided', () => {
    render(<WhatsAppLink>click</WhatsAppLink>);
    const anchor = screen.getByRole('link');
    const expected = `https://wa.me/${publicSite.whatsapp.number}?text=${encodeURIComponent(publicSite.whatsapp.defaultMessage)}`;
    expect(anchor).toHaveAttribute('href', expected);
  });

  it('should use custom message when message prop is provided', () => {
    render(<WhatsAppLink message="hello world">click</WhatsAppLink>);
    const anchor = screen.getByRole('link');
    expect(anchor.getAttribute('href')).toContain(encodeURIComponent('hello world'));
  });

  it('should set rel, target and aria-label attributes when rendered', () => {
    render(<WhatsAppLink label="Abrir WhatsApp">click</WhatsAppLink>);
    const anchor = screen.getByRole('link');
    expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
    expect(anchor).toHaveAttribute('target', '_blank');
    expect(anchor).toHaveAttribute('aria-label', 'Abrir WhatsApp');
  });

  it('should fall back to default aria-label when no label prop is provided', () => {
    render(<WhatsAppLink>click</WhatsAppLink>);
    expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'Falar pelo WhatsApp');
  });
});
