import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UncoveredOptionsBannerProps {
  className?: string;
}

const UNCOVERED_OPTIONS = [
  'Esquemas de precificação: volume, escalonado (tiered) e percentual',
  'Incrementos e descontos por item do plano',
  'Boleto com dias específicos de vencimento (billing_days)',
  'Divisão de pagamento (split rules) por plano',
  'Configuração de intervalos por dia exato (exact_day billing)',
  'Múltiplos esquemas de preço por item (price tiers)',
  'Configuração de split em nível de item',
];

/**
 * Informational banner listing Pagar.me plan features
 * not covered by the current form.
 */
export function UncoveredOptionsBanner({ className }: UncoveredOptionsBannerProps) {
  return (
    <div
      role="note"
      aria-label="Funcionalidades não cobertas neste formulário"
      className={cn(
        'rounded-lg border border-amber-200 bg-amber-50 p-4',
        className,
      )}
    >
      <div className="flex gap-3">
        <Info
          className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-amber-800">
            Funcionalidades Pagar.me não cobertas neste formulário
          </p>
          <ul className="space-y-1" aria-label="Lista de funcionalidades não cobertas">
            {UNCOVERED_OPTIONS.map((option) => (
              <li
                key={option}
                className="text-xs text-amber-700 flex items-start gap-1.5"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
                {option}
              </li>
            ))}
          </ul>
          <p className="text-xs text-amber-600">
            Para usar essas opções, configure diretamente no painel da Pagar.me ou via API.
          </p>
        </div>
      </div>
    </div>
  );
}
