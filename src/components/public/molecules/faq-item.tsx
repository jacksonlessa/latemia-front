'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FaqEntry } from '@/content/landing';

export function FaqItem({ question, answer }: FaqEntry) {
  const [open, setOpen] = useState(false);

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="rounded-lg border border-sand bg-white/60 overflow-hidden group"
    >
      <summary
        aria-expanded={open}
        className="flex items-center justify-between cursor-pointer p-4 font-semibold text-forest list-none"
      >
        <span>{question}</span>
        <ChevronDown
          size={20}
          className={`transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </summary>
      <div className="px-4 pb-4 leading-relaxed">{answer}</div>
    </details>
  );
}
