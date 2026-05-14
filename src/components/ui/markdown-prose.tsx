import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownProseProps {
  children: string;
  /** Extra classes appended to the wrapper. */
  className?: string;
}

/**
 * Estilo padronizado de renderização de markdown para textos legais
 * (TERMOS, Política de Privacidade) consumidos a partir de
 * `src/content/*.ts`. Suporta GFM (tabelas, listas, strikethrough).
 *
 * Mantido como componente único para que qualquer ajuste tipográfico
 * (espaçamento, peso de cabeçalho, cor de link) propague para todas as
 * superfícies que renderizam o mesmo conteúdo — página /termos,
 * /privacidade e step 3 do fluxo /contratar.
 */
export function MarkdownProse({ children, className = '' }: MarkdownProseProps) {
  return (
    <div className={`markdown-prose ${className}`.trim()}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
