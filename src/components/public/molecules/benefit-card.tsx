import { BadgeDollarSign, ShieldCheck, Stethoscope, Smile, HeartPulse, Clock, Zap } from 'lucide-react';
import type { BenefitItem, LucideIconName } from '@/content/landing';

const iconMap: Record<LucideIconName, typeof BadgeDollarSign> = {
  BadgeDollarSign,
  ShieldCheck,
  Stethoscope,
  Smile,
  HeartPulse,
  Clock,
  Zap,
};

export function BenefitCard({ title, description, icon }: BenefitItem) {
  const Icon = iconMap[icon];
  return (
    <article className="rounded-2xl bg-white/60 border border-sand p-6 flex flex-col gap-3">
      <Icon size={32} className="text-forest" aria-hidden="true" />
      <h3 className="font-display text-xl text-forest">{title}</h3>
      <p className="text-sm leading-relaxed">{description}</p>
    </article>
  );
}
