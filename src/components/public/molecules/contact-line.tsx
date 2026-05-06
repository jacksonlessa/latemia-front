import type { LucideIcon } from 'lucide-react';

interface ContactLineProps {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}

export function ContactLine({ icon: Icon, label, value, href }: ContactLineProps) {
  const content = (
    <>
      <Icon size={20} className="text-forest shrink-0" aria-hidden="true" />
      <span className="sr-only">{label}: </span>
      <span>{value}</span>
    </>
  );

  return (
    <li className="flex items-start gap-3">
      {href ? (
        <a href={href} className="flex items-start gap-3 hover:text-forest-strong">
          {content}
        </a>
      ) : (
        content
      )}
    </li>
  );
}
