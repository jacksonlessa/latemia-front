import { CrossIcon } from '@/components/public/atoms/cross-icon';

interface ExclusionItemProps {
  label: string;
}

export function ExclusionItem({ label }: ExclusionItemProps) {
  return (
    <li className="flex items-start gap-3 rounded-lg bg-sand/60 p-3">
      <CrossIcon size={22} />
      <span className="leading-relaxed">{label}</span>
    </li>
  );
}
