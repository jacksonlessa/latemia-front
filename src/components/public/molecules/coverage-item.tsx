import { CheckIcon } from '@/components/public/atoms/check-icon';

interface CoverageItemProps {
  label: string;
}

export function CoverageItem({ label }: CoverageItemProps) {
  return (
    <li className="flex items-start gap-3">
      <CheckIcon size={22} />
      <span className="leading-relaxed">{label}</span>
    </li>
  );
}
