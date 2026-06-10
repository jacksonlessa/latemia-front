import type { Metadata } from 'next';
import {
  CLUBE_VANTAGENS_VERSION,
  CLUBE_VANTAGENS_EFFECTIVE_DATE,
  CLUBE_VANTAGENS_ITENS,
  CLUBE_VANTAGENS_NOTAS,
} from '@/content/beneficios';
import { getSeoMetadata } from '@/config/seo';

export const metadata: Metadata = getSeoMetadata('/beneficios');

const SAC_EMAIL = 'sac@drcleitinho.com.br';

function formatEffectiveDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export default function BeneficiosPage() {
  const effectiveDateFormatted = formatEffectiveDate(
    CLUBE_VANTAGENS_EFFECTIVE_DATE,
  );

  return (
    <main className="px-6 md:px-10 py-16 max-w-3xl mx-auto">
      <header className="mb-8 border-b border-forest-soft pb-6">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-forest-strong leading-tight">
          Clube de Vantagens
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-forest/75">
          Tabela oficial de descontos em procedimentos eletivos prestados pela
          Late&amp;Mia Clínica Veterinária aos clientes do Plano Emergencial Pet
          Dr. Cleitinho, conforme os Termos de Uso vigentes.
        </p>
      </header>

      <section aria-labelledby="tabela-beneficios-heading" className="mb-8">
        <h2
          id="tabela-beneficios-heading"
          className="text-base font-semibold text-forest-deep mb-3"
        >
          Procedimentos e descontos
        </h2>

        <div className="overflow-x-auto rounded-lg border border-forest-soft bg-white shadow-sm">
          <table className="w-full min-w-[280px] border-collapse text-sm">
            <caption className="sr-only">
              Tabela vigente do Clube de Vantagens — procedimentos e percentuais
              de desconto
            </caption>
            <thead>
              <tr className="bg-forest-pale">
                <th
                  scope="col"
                  className="border-b border-forest-soft px-4 py-3 text-left font-semibold text-forest-deep"
                >
                  Procedimento
                </th>
                <th
                  scope="col"
                  className="border-b border-forest-soft px-4 py-3 text-right font-semibold text-forest-deep w-28 md:w-32"
                >
                  Desconto
                </th>
              </tr>
            </thead>
            <tbody>
              {CLUBE_VANTAGENS_ITENS.map((item, index) => (
                <tr
                  key={item.procedimento}
                  className={
                    index % 2 === 1 ? 'bg-forest-pale/40' : 'bg-white'
                  }
                >
                  <td className="border-b border-forest-soft/80 px-4 py-3 align-top text-forest">
                    {item.procedimento}
                  </td>
                  <td className="border-b border-forest-soft/80 px-4 py-3 align-top text-right font-medium tabular-nums text-forest-deep">
                    {item.percentual}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-forest/40">
          {CLUBE_VANTAGENS_VERSION} — última atualização em{' '}
          {effectiveDateFormatted}
        </p>
      </section>

      <section aria-labelledby="regras-uso-heading">
        <h2
          id="regras-uso-heading"
          className="text-base font-semibold text-forest-deep mb-3"
        >
          Regras de uso
        </h2>

        <ul className="list-disc space-y-2 pl-6 text-sm leading-relaxed text-forest">
          {CLUBE_VANTAGENS_NOTAS.map((nota) => (
            <li key={nota}>{nota}</li>
          ))}
        </ul>
      </section>

      <aside
        aria-labelledby="sac-historico-heading"
        className="mt-10 rounded-lg border border-forest-soft bg-forest-pale/50 px-4 py-4"
      >
        <h2
          id="sac-historico-heading"
          className="text-sm font-semibold text-forest-deep"
        >
          Versões anteriores
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-forest">
          Para consultar versões anteriores desta tabela, entre em contato com
          o SAC:{' '}
          <a
            href={`mailto:${SAC_EMAIL}`}
            className="font-medium text-forest-strong underline underline-offset-2 hover:text-forest-deep break-words"
          >
            {SAC_EMAIL}
          </a>
          .
        </p>
      </aside>
    </main>
  );
}
