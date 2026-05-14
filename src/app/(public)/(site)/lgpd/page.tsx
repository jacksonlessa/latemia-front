import type { Metadata } from 'next';
import { getSeoMetadata } from '@/config/seo';

export const metadata: Metadata = getSeoMetadata('/lgpd');

export default function LgpdPage() {
  return (
    <main className="px-6 md:px-10 py-16 max-w-3xl mx-auto">
      <h1 className="font-display text-3xl md:text-4xl text-forest mb-8">
        Direitos do Titular (LGPD)
      </h1>

      <p className="text-sm text-forest/60 mb-8">Última atualização: abril de 2026</p>

      <section className="prose prose-sm max-w-none text-forest/80 space-y-6">
        <p>
          Esta página descreve os direitos garantidos a você como titular de dados
          pessoais pela <strong>Lei Geral de Proteção de Dados</strong> (LGPD,
          Lei 13.709/2018) e como exercê-los junto à <strong>Dr. Cleitinho
          Clínica Veterinária</strong>, controladora dos dados coletados por meio
          do site e do Plano Emergência Veterinária.
        </p>

        <p className="text-xs text-forest/60 italic">
          Este texto é uma versão base preparada pela equipe de produto e está
          sujeito a revisão pelo departamento jurídico antes da versão definitiva.
        </p>

        <h2 className="text-xl font-semibold text-forest mt-8">
          1. Quais são os seus direitos como titular?
        </h2>
        <p>
          Conforme o art. 18 da LGPD, você pode, a qualquer momento e
          gratuitamente, solicitar:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Confirmação</strong> da existência de tratamento dos seus
            dados pessoais;
          </li>
          <li>
            <strong>Acesso</strong> aos dados pessoais que mantemos sobre você;
          </li>
          <li>
            <strong>Correção</strong> de dados incompletos, inexatos ou
            desatualizados;
          </li>
          <li>
            <strong>Anonimização, bloqueio ou eliminação</strong> de dados
            desnecessários, excessivos ou tratados em desconformidade com a
            legislação;
          </li>
          <li>
            <strong>Portabilidade</strong> dos seus dados a outro fornecedor de
            serviço ou produto, mediante requisição expressa, observados os
            segredos comercial e industrial;
          </li>
          <li>
            <strong>Eliminação</strong> dos dados pessoais tratados com base no
            seu consentimento, ressalvadas as hipóteses de guarda legal;
          </li>
          <li>
            <strong>Informação</strong> sobre as entidades públicas e privadas
            com as quais compartilhamos os seus dados;
          </li>
          <li>
            <strong>Informação</strong> sobre a possibilidade de não fornecer o
            consentimento e sobre as consequências da negativa;
          </li>
          <li>
            <strong>Revogação do consentimento</strong> a qualquer momento,
            mediante manifestação expressa, por procedimento gratuito e
            facilitado;
          </li>
          <li>
            <strong>Oposição</strong> ao tratamento realizado com fundamento em
            uma das hipóteses de dispensa de consentimento, em caso de
            descumprimento da LGPD.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-forest mt-8">
          2. Como exercer os seus direitos
        </h2>
        <p>
          Para exercer qualquer um dos direitos acima, entre em contato com o
          nosso encarregado de proteção de dados (DPO):
        </p>
        <ul className="list-disc pl-6 space-y-1">
          {/* TODO(DPO): substituir [DPO_EMAIL_PLACEHOLDER] pelo e-mail oficial
              do encarregado de proteção de dados antes do go-live. Bloqueio
              operacional, não de engenharia. */}
          <li>
            <strong>E-mail:</strong> [DPO_EMAIL_PLACEHOLDER]
          </li>
          <li>
            <strong>WhatsApp:</strong> (47) 99707-7953
          </li>
          <li>
            <strong>Endereço:</strong> Rua Osvaldo Minella, 56 - Lídia Duarte,
            Camboriú - SC, 88340-000
          </li>
        </ul>
        <p>
          Ao entrar em contato, descreva claramente qual direito você deseja
          exercer e, quando aplicável, indique os dados pessoais aos quais a
          solicitação se refere. Para a sua segurança, podemos solicitar
          informações adicionais para confirmar a sua identidade antes de
          atender ao pedido.
        </p>

        <h2 className="text-xl font-semibold text-forest mt-8">
          3. Prazo de resposta
        </h2>
        <p>
          O prazo legal para resposta é de até <strong>15 (quinze) dias</strong>
          {' '}
          a contar do recebimento da sua solicitação, conforme determina o
          art. 19, §1º, da LGPD e as orientações da Autoridade Nacional de
          Proteção de Dados (ANPD). Em casos que demandem análise mais
          aprofundada, esse prazo poderá ser justificadamente prorrogado, e
          você será informado(a) por escrito sobre as razões.
        </p>

        <h2 className="text-xl font-semibold text-forest mt-8">
          4. Recursos e reclamações
        </h2>
        <p>
          Caso entenda que a sua solicitação não foi devidamente atendida, você
          pode apresentar reclamação diretamente à{' '}
          <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong>{' '}
          através do site oficial{' '}
          <a
            href="https://www.gov.br/anpd"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline"
          >
            gov.br/anpd
          </a>
          . Você também pode buscar os órgãos de defesa do consumidor.
        </p>

        <h2 className="text-xl font-semibold text-forest mt-8">
          5. Dados que tratamos
        </h2>
        <p>
          A descrição completa dos dados coletados, das finalidades do
          tratamento, das bases legais aplicáveis e dos prazos de retenção está
          disponível na nossa{' '}
          <a
            href="/privacidade"
            className="underline-offset-2 hover:underline font-medium"
          >
            Política de Privacidade
          </a>
          .
        </p>
      </section>
    </main>
  );
}
