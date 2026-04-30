import { AlertCircle } from "lucide-react";

/**
 * Faixa de aviso indicando que o componente abaixo exibe dados mockados.
 * Acessível via leitor de tela (`role="status"` + `aria-live="polite"`).
 *
 * Paleta amarela coerente com alertas de carência: `bg-[#FEF3C7] text-[#D97706]`.
 */
export function MockDataBanner() {
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="mock-data-banner"
      className="mb-4 flex items-center gap-2 rounded-lg bg-[#FEF3C7] px-3 py-2 text-[#D97706]"
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <p className="text-xs font-medium md:text-sm">
        Dados de exemplo — não usar para decisão operacional
      </p>
    </div>
  );
}
