import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade — Late & Mia Clínica Veterinária',
  description: 'Saiba como a Late & Mia Clínica Veterinária coleta, usa e protege seus dados pessoais.',
};

export default function PrivacidadePage() {
  return (
    <main className="px-6 md:px-10 py-16 max-w-3xl mx-auto">
      <h1 className="font-display text-3xl md:text-4xl text-forest mb-8">Política de Privacidade</h1>

      <p className="text-sm text-forest/60 mb-8">Última atualização: abril de 2026</p>

      <section className="prose prose-sm max-w-none text-forest/80 space-y-6">
        <p>
          A <strong>Late &amp; Mia Clínica Veterinária</strong>, pessoa jurídica de direito privado, com sede na Rua Osvaldo Minella, 56 - Lídia Duarte, Camboriú - SC, 88340-000, é responsável pelo tratamento dos dados pessoais coletados por meio do site e do Plano Emergência Veterinária.
        </p>

        <h2 className="text-xl font-semibold text-forest mt-8">1. Dados coletados</h2>
        <p>
          Coletamos os seguintes dados pessoais estritamente necessários para a contratação e execução do plano:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Nome completo do titular</li>
          <li>CPF</li>
          <li>Número de telefone / WhatsApp</li>
          <li>Nome, espécie e porte do(s) pet(s) cadastrado(s)</li>
          <li>Dados de pagamento (processados por gateway externo — não armazenamos dados de cartão)</li>
        </ul>

        <h2 className="text-xl font-semibold text-forest mt-8">2. Finalidade do tratamento</h2>
        <p>Os dados são utilizados exclusivamente para:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Cadastro e gerenciamento do contrato do plano</li>
          <li>Verificação do vínculo na hora do atendimento emergencial</li>
          <li>Comunicação sobre o plano (cobranças, atualizações e suporte)</li>
          <li>Cumprimento de obrigações legais e regulatórias</li>
        </ul>

        <h2 className="text-xl font-semibold text-forest mt-8">3. Base legal (LGPD)</h2>
        <p>
          O tratamento é fundamentado na execução de contrato (art. 7º, V da Lei 13.709/2018) e, quando aplicável, no cumprimento de obrigação legal (art. 7º, II).
        </p>

        <h2 className="text-xl font-semibold text-forest mt-8">4. Compartilhamento de dados</h2>
        <p>
          Não vendemos nem cedemos seus dados a terceiros. O compartilhamento ocorre somente com prestadores de serviço essenciais (gateway de pagamento, plataforma de envio de mensagens) e apenas na medida necessária para a prestação do serviço.
        </p>

        <h2 className="text-xl font-semibold text-forest mt-8">5. Retenção</h2>
        <p>
          Os dados são mantidos pelo prazo contratual e pelo período adicional exigido pela legislação fiscal e contábil aplicável. Após esse prazo, são eliminados de forma segura.
        </p>

        <h2 className="text-xl font-semibold text-forest mt-8">6. Seus direitos</h2>
        <p>
          Você pode, a qualquer momento, solicitar: acesso, correção, portabilidade, anonimização ou eliminação dos seus dados, bem como revogar consentimentos eventualmente concedidos. Entre em contato pelo WhatsApp <strong>(47) 99996-5009</strong>.
        </p>

        <h2 className="text-xl font-semibold text-forest mt-8">7. Contato do encarregado (DPO)</h2>
        <p>
          Para questões relacionadas a esta política, entre em contato pelo WhatsApp <strong>(47) 99996-5009</strong> ou pessoalmente na Rua Osvaldo Minella, 56, Camboriú - SC.
        </p>
      </section>
    </main>
  );
}
