import { publicSite } from '@/config/public-site';

interface WhatsAppLinkProps {
  message?: string;
  label?: string;
  className?: string;
  children: React.ReactNode;
}

export function WhatsAppLink({
  message,
  label,
  className,
  children,
}: WhatsAppLinkProps) {
  const text = message ?? publicSite.whatsapp.defaultMessage;
  const href = `https://wa.me/${publicSite.whatsapp.number}?text=${encodeURIComponent(text)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label ?? 'Falar pelo WhatsApp'}
      className={className}
    >
      {children}
    </a>
  );
}
