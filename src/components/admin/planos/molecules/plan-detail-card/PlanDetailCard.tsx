import type { ReactNode } from 'react';

interface PlanDetailCardProps {
  label: string;
  value: ReactNode;
}

/**
 * PlanDetailCard — Molecule
 *
 * Displays a single label/value pair for composing plan detail sections.
 * Used inside the /admin/planos/[id] detail page.
 */
export function PlanDetailCard({ label, value }: PlanDetailCardProps) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-[#6B6B6E]">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-[#2C2C2E]">{value}</dd>
    </div>
  );
}
