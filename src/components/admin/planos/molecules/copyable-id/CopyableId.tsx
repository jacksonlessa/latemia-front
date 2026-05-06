'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyableIdProps {
  value: string;
  /** Accessible label suffix used in the button, e.g. "ID da assinatura". */
  label?: string;
  className?: string;
}

/**
 * CopyableId — Molecule
 *
 * Renders a monospace identifier next to a copy button. On click, the value
 * is copied to the clipboard and the button shows a transient confirmation.
 *
 * Defensive: gracefully degrades when `navigator.clipboard` is unavailable
 * (older browsers, insecure contexts).
 */
export function CopyableId({ value, label, className }: CopyableIdProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      // Clipboard not available — silently no-op; UX falls back to manual selection.
    }
  }

  const buttonLabel = copied
    ? 'Copiado!'
    : label
      ? `Copiar ${label}`
      : 'Copiar';

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="font-mono text-xs break-all">{value}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex h-6 w-6 items-center justify-center rounded text-[#6B6B6E] hover:bg-gray-100 hover:text-[#4E8C75] transition-colors"
        aria-label={buttonLabel}
        title={buttonLabel}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>
    </span>
  );
}
