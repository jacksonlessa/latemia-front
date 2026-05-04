import type { Metadata } from 'next';
import { getSeoMetadata } from '@/config/seo';

export const metadata: Metadata = getSeoMetadata('/termos');

export default function TermosPage() {
  return (
    <main className="px-6 md:px-10 py-16 max-w-3xl mx-auto">
      <h1 className="font-display text-3xl md:text-4xl text-forest mb-8">Termos de Uso</h1>

      <p className="text-sm text-forest/60 mb-8">Última atualização: abril de 2026</p>

      <section className="prose prose-sm max-w-none text-forest/80 space-y-6">
        <p>
          Ao contratar o <strong>Plano Emergência Veterinária</strong> da Late &amp; Mia Clínica Veterinária, o titular declara ter lido e concordado integralmente com os presentes Termos de Uso.
        </p>

        <h2 className="text-xl font-semibold text-forest mt-8">1. O Plano</h2>
        <p>
          O Plano Emergência Veterinária é um serviço de desconto para atendimentos de emergência realizados exclusivamente na <strong>Late &amp; Mia Clínica Veterinária</strong> (Rua Osvaldo Minella, 56, Camboriú - SC). Não se trata de seguro ou plano de saúde animal regulado pela ANS.
        </p>

        <h2 className="text-xl font-semibold text-forest mt-8">2. Benefício</h2>
        <p>
          O titular ativo tem direito a <strong>50% de desconto</strong> sobre o valor dos atendimentos emergenciais realizados na clínica, após o término do período de carência. O desconto é aplicado no ato do atendimento, mediante conferência do cadastro.
        </p>

        <h2 className="text-xl font-semibold text-forest mt-8">3. Carência</h2>
        <p>
          O benefício entra em vigor <strong>6 (seis) meses</strong> após a confirmação do primeiro pagamento. Durante o período de carência o contrato está ativo, mas o desconto não pode ser utilizado.
        </p>

        <h2 className="text-xl font-semibold text-forest mt-8">4. Mensalidade e pagamento</h2>
        <p>
          O valor é de <strong>R$ 25,00 por pet/mês</strong>. O pagamento é realizado mensalmente via cartão de crédito ou boleto bancário. A inadimplência superior a 30 dias suspende os benefícios do plano.
        </p>

        <h2 className="text-xl font-semibold text-forest mt-8">5. Cobertura e exclusões</h2>
        <p>
          O plano cobre situações de emergência que coloquem a vida do animal em risco imediato (intoxicações, convulsões, traumas graves, hemorragias, choque, dificuldade respiratória aguda, dor aguda intensa). Estão excluídos: consultas de rotina, check-ups, vacinas, vermifugação, procedimentos estéticos, castração e internações programadas.
        </p>

        <h2 className="text-xl font-semibold text-forest mt-8">6. Cancelamento</h2>
        <p>
          O titular pode cancelar o plano a qualquer momento pelo WhatsApp <strong>(47) 99707-7953</strong>. O benefício permanece ativo até o fim do período já pago. Não há reembolso proporcional de mensalidades pagas.
        </p>

        <h2 className="text-xl font-semibold text-forest mt-8">7. Responsabilidades</h2>
        <p>
          A Late &amp; Mia Clínica Veterinária reserva-se o direito de alterar os presentes termos com aviso prévio de 30 dias por WhatsApp. A continuidade do uso do plano após o aviso implica aceite das novas condições.
        </p>

        <h2 className="text-xl font-semibold text-forest mt-8">8. Foro</h2>
        <p>
          Fica eleito o foro da Comarca de Camboriú - SC para dirimir quaisquer controvérsias decorrentes deste instrumento.
        </p>
      </section>
    </main>
  );
}
