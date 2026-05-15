import type { Metadata } from 'next';
import {
  CLUBE_VANTAGENS_VERSION,
  CLUBE_VANTAGENS_EFFECTIVE_DATE,
  CLUBE_VANTAGENS_ITENS,
  CLUBE_VANTAGENS_NOTAS,
} from '@/content/beneficios';

// NOTE(tabela-clube-vantagens-publica:3): metadata será migrada para
// `getSeoMetadata('/beneficios')` na tarefa 3.0, que adiciona a rota ao
// union `SeoRoutePath` em `src/config/seo.ts`. Mantemos a metadata inline
// aqui para evitar quebra de typecheck antes daquela tarefa.
export const metadata: Metadata = {
  title: 'Clube de Vantagens — Dr. Cleitinho Clínica Veterinária',
  description:
    'Tabela vigente do Clube de Vantagens: descontos em procedimentos eletivos prestados pela Dr. Cleitinho aos clientes do Plano Emergência Veterinária.',
};

const SAC_EMAIL = 'sac@drcleitinho.com.br';

export default function BeneficiosPage() {
  const effectiveDateFormatted = new Date(
    CLUBE_VANTAGENS_EFFECTIVE_DATE,
  ).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

  return (
    <main className="px-6 md:px-10 py-16 max-w-3xl mx-auto">
      <p className="text-xs uppercase tracking-wide text-forest/60 font-medium mb-2">
        Versão {CLUBE_VANTAGENS_VERSION} — em vigor desde{' '}
        {effectiveDateFormatted}
      </p>

      <h1 className="font-display text-3xl md:text-4xl font-semibold text-forest-strong leading-tight mb-6">
        Clube de Vantagens
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-forest-pale">
            <tr>
              <th
                scope="col"
                className="border border-forest-soft px-3 py-2 text-left font-semibold text-forest-deep"
              >
                Procedimento
              </th>
              <th
                scope="col"
                className="border border-forest-soft px-3 py-2 text-left font-semibold text-forest-deep w-32"
              >
                Desconto
              </th>
            </tr>
          </thead>
          <tbody>
            {CLUBE_VANTAGENS_ITENS.map((item) => (
              <tr key={item.procedimento}>
                <td className="border border-forest-soft px-3 py-2 align-top text-forest">
                  {item.procedimento}
                </td>
                <td className="border border-forest-soft px-3 py-2 align-top text-forest font-medium tabular-nums">
                  {item.percentual}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-6 list-disc pl-6 space-y-1 text-sm text-forest">
        {CLUBE_VANTAGENS_NOTAS.map((nota) => (
          <li key={nota}>{nota}</li>
        ))}
      </ul>

      <p className="mt-8 text-sm text-forest">
        Para consultar versões anteriores desta tabela, entre em contato com
        nosso SAC:{' '}
        <a
          href={`mailto:${SAC_EMAIL}`}
          className="text-forest-strong underline underline-offset-2 hover:text-forest-deep break-words"
        >
          {SAC_EMAIL}
        </a>
        .
      </p>
    </main>
  );
}
