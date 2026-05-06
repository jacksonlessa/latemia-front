import type { Metadata } from 'next';
import { getSeoMetadata } from '@/config/seo';

export const metadata: Metadata = getSeoMetadata('/privacidade');

export default function PrivacidadePage() {
  return (
    <main className="px-6 md:px-10 py-16 max-w-3xl mx-auto">
      <h1 className="font-display text-3xl md:text-4xl text-forest mb-8">Política de Privacidade</h1>

      <p className="text-sm text-forest/60 mb-8">Última atualização: abril de 2026</p>

      <section className="prose prose-sm max-w-none text-forest/80 space-y-6">
        <p>
          A <strong>Late &amp; Mia Clínica Veterinária</strong>, pessoa jurídica de direito privado, com sede na Rua Osvaldo Minella, 56 - Lídia Duarte, Camboriú - SC, 88340-000, é responsável pelo tratamento dos dados pessoais coletados por meio do site e do Plano Emergência Veterinária.
        </p>

        <p className="text-xs text-forest/60 italic">
          Este texto é uma versão base preparada pela equipe de produto e está
          sujeito a revisão pelo departamento jurídico antes da versão definitiva.
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
          <li>
            Dados de origem de tráfego (parâmetros UTM e identificadores de
            campanha) — descritos no item 8 desta política
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-forest mt-8">2. Finalidade do tratamento</h2>
        <p>Os dados são utilizados exclusivamente para:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Cadastro e gerenciamento do contrato do plano</li>
          <li>Verificação do vínculo na hora do atendimento emergencial</li>
          <li>Comunicação sobre o plano (cobranças, atualizações e suporte)</li>
          <li>Cumprimento de obrigações legais e regulatórias</li>
          <li>
            Atribuição de canal e mensuração da efetividade de campanhas de
            marketing
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-forest mt-8">3. Base legal (LGPD)</h2>
        <p>
          O tratamento é fundamentado na execução de contrato (art. 7º, V da
          Lei 13.709/2018), no cumprimento de obrigação legal (art. 7º, II), no
          legítimo interesse do controlador para fins de mensuração de
          campanhas (art. 7º, IX) e no consentimento do titular para
          tratamentos não essenciais (art. 7º, I), notadamente para cookies de
          analytics e marketing.
        </p>

        <h2 className="text-xl font-semibold text-forest mt-8">4. Compartilhamento de dados</h2>
        <p>
          Não vendemos nem cedemos seus dados a terceiros. O compartilhamento ocorre somente com prestadores de serviço essenciais (gateway de pagamento, plataforma de envio de mensagens) e apenas na medida necessária para a prestação do serviço.
        </p>
        <p>
          Mediante o seu consentimento, dados de navegação anonimizados ou
          pseudonimizados podem ser compartilhados com{' '}
          <strong>Google (Google Analytics 4 e Google Ads)</strong> e{' '}
          <strong>Meta (Meta Pixel, Facebook e Instagram)</strong> para fins de
          mensuração de audiência e atribuição de campanhas publicitárias. O
          detalhamento desse compartilhamento está no item 9.
        </p>

        <h2 className="text-xl font-semibold text-forest mt-8">5. Retenção</h2>
        <p>
          Os dados são mantidos pelo prazo contratual e pelo período adicional
          exigido pela legislação fiscal e contábil aplicável. Após esse prazo,
          são eliminados de forma segura. Dados de origem de tráfego (UTMs e
          identificadores de campanha) são mantidos enquanto o cadastro do
          cliente estiver ativo, para fins de análise de canal.
        </p>

        <h2 className="text-xl font-semibold text-forest mt-8">6. Seus direitos</h2>
        <p>
          Você pode, a qualquer momento, solicitar: acesso, correção,
          portabilidade, anonimização ou eliminação dos seus dados, bem como
          revogar consentimentos eventualmente concedidos. Para exercer esses
          direitos, consulte a página{' '}
          <a
            href="/lgpd"
            className="underline-offset-2 hover:underline font-medium"
          >
            Direitos do Titular (LGPD)
          </a>
          {' '}ou entre em contato pelo WhatsApp{' '}
          <strong>(47) 99707-7953</strong>.
        </p>

        <h2 className="text-xl font-semibold text-forest mt-8">7. Cookies por categoria</h2>
        <p>
          Utilizamos cookies e tecnologias similares organizados em três
          categorias. Você pode revisar a sua escolha a qualquer momento pelo
          link "Preferências de cookies" no rodapé do site.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Essenciais:</strong> indispensáveis ao funcionamento do
            site e do fluxo de contratação. Incluem cookies de sessão,
            autenticação e preservação da sua escolha de consentimento. Não
            podem ser desativados e não dependem de consentimento prévio
            (art. 5º, IX, da LGPD — interesse legítimo essencial).
          </li>
          <li>
            <strong>Analytics:</strong> medem o uso anônimo do site para
            ajudar a melhorar a experiência. Ferramenta utilizada:{' '}
            <strong>Google Analytics 4 (GA4)</strong>. Finalidade: análise
            estatística de tráfego, tempo de permanência, páginas mais
            visitadas e fluxo de conversão. Disparados apenas após o seu
            consentimento explícito.
          </li>
          <li>
            <strong>Marketing:</strong> permitem mensurar campanhas
            publicitárias e exibir anúncios relevantes. Ferramentas
            utilizadas: <strong>Meta Pixel</strong> (Facebook e Instagram) e
            sinais publicitários do <strong>Google Ads</strong>. Finalidade:
            atribuição de campanhas, otimização de anúncios e remarketing.
            Disparados apenas após o seu consentimento explícito.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-forest mt-8">
          8. Rastreamento de origem (UTMs e identificadores de campanha)
        </h2>
        <p>
          Quando você acessa o site através de um link de campanha (por
          exemplo, anúncios em redes sociais, e-mail, podcast ou indicação),
          podemos coletar parâmetros presentes na URL:{' '}
          <code className="text-xs">utm_source</code>,{' '}
          <code className="text-xs">utm_medium</code>,{' '}
          <code className="text-xs">utm_campaign</code>,{' '}
          <code className="text-xs">utm_content</code>,{' '}
          <code className="text-xs">utm_term</code>,{' '}
          <code className="text-xs">gclid</code> (Google Ads),{' '}
          <code className="text-xs">fbclid</code> (Meta Ads) e o parâmetro{' '}
          <code className="text-xs">ref</code> (códigos de indicação ou
          parceiros).
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Classificação:</strong> esses parâmetros, quando
            associados a um cadastro, são tratados como{' '}
            <em>dado pessoal indireto</em>, pois permitem inferir o canal pelo
            qual você nos conheceu.
          </li>
          <li>
            <strong>Finalidade:</strong> atribuição de canal, mensuração de
            efetividade de campanhas e cálculo de retorno sobre investimento
            (ROI) das ações de marketing.
          </li>
          <li>
            <strong>Base legal:</strong> execução de contrato (art. 7º, V) e
            legítimo interesse do controlador (art. 7º, IX) para fins de
            análise de canal, sempre balanceados com os direitos e expectativas
            do titular.
          </li>
          <li>
            <strong>Retenção:</strong> persistidos junto ao cadastro do cliente
            enquanto o vínculo contratual estiver ativo e durante o prazo de
            guarda legal aplicável.
          </li>
          <li>
            <strong>Não-uso:</strong> esses parâmetros não são utilizados para
            decisões automatizadas sobre você, nem para perfilamento que afete
            o atendimento ou as condições do plano.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-forest mt-8">
          9. Compartilhamento com Google e Meta
        </h2>
        <p>
          Mediante o seu consentimento explícito (categorias <em>analytics</em>{' '}
          e <em>marketing</em>), determinados dados de navegação podem ser
          enviados às seguintes plataformas:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Google LLC (Google Analytics 4 e Google Ads):</strong>{' '}
            recebe identificadores de cliente, eventos de página e de
            conversão e parâmetros de campanha. O tratamento é regido pelos
            termos da Google e pode envolver transferência internacional de
            dados, com salvaguardas declaradas pela própria Google. Política:{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 hover:underline"
            >
              policies.google.com/privacy
            </a>
            .
          </li>
          <li>
            <strong>Meta Platforms, Inc. (Meta Pixel):</strong> recebe eventos
            de página e de conversão, identificadores de cookie e parâmetros
            de campanha. O tratamento é regido pelos termos da Meta e pode
            envolver transferência internacional de dados, com salvaguardas
            declaradas pela própria Meta. Política:{' '}
            <a
              href="https://www.facebook.com/privacy/policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 hover:underline"
            >
              facebook.com/privacy/policy
            </a>
            .
          </li>
        </ul>
        <p>
          Você pode, a qualquer momento, revogar o consentimento para esse
          compartilhamento pelo link "Preferências de cookies" no rodapé do
          site. A revogação interrompe o envio de novos dados, mas não afeta
          tratamentos realizados anteriormente com base no consentimento
          válido.
        </p>

        <h2 className="text-xl font-semibold text-forest mt-8">
          10. Contato do encarregado (DPO)
        </h2>
        <p>
          Para questões relacionadas a esta política, ao tratamento dos seus
          dados ou ao exercício dos seus direitos como titular, entre em
          contato pelo WhatsApp <strong>(47) 99707-7953</strong> ou
          pessoalmente na Rua Osvaldo Minella, 56, Camboriú - SC. Detalhes
          completos sobre o exercício dos seus direitos estão na página{' '}
          <a
            href="/lgpd"
            className="underline-offset-2 hover:underline font-medium"
          >
            Direitos do Titular (LGPD)
          </a>
          .
        </p>
      </section>
    </main>
  );
}
