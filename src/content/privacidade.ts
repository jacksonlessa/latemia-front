/**
 * Texto oficial da Política de Privacidade da Dr. Cleitinho — Plano
 * Emergencial Veterinário.
 *
 * Fonte de verdade única — consumida pela página /privacidade.
 *
 * Qualquer alteração no texto exige:
 *   1) bump explícito de `PRIVACY_POLICY_VERSION`
 *   2) snapshot do markdown em `docs/juridico/<data>/revisado/`
 *   3) aviso prévio de 30 dias aos titulares (item 14 da Política)
 */

/**
 * Versão vigente da Política de Privacidade. Não há persistência server-side
 * desta versão hoje (não há aceite explícito separado da Política — ela é
 * parte integrante dos TERMOS aceitos no fluxo de contratação). Mantida como
 * label estável para histórico interno e exibição ao usuário.
 */
export const PRIVACY_POLICY_VERSION = 'v1.0';

/**
 * Data de entrada em vigor desta versão (ISO YYYY-MM-DD).
 */
export const PRIVACY_POLICY_EFFECTIVE_DATE = '2026-05-14';

export const POLITICA_PRIVACIDADE_TEXTO = `# POLÍTICA DE PRIVACIDADE
## Dr. Cleitinho — Plano Emergencial Veterinário

**Versão do documento:** v1.0 — 14/05/2026

> **Aviso a VOCÊ:** esta Política de Privacidade explica **como a Dr. Cleitinho trata seus dados pessoais** no âmbito do Plano Emergencial Veterinário Dr. Cleitinho. Ela é **parte integrante** dos Termos de Uso e Contrato de Prestação de Serviços e deve ser lida em conjunto com eles. Em caso de divergência, **prevalecem os Termos para questões contratuais** e **esta Política para questões de tratamento de dados pessoais**.

---

## 1. Introdução

Esta Política descreve, de forma transparente e em linguagem clara (CDC art. 6º, III; LGPD art. 6º, VI), **quais dados pessoais coletamos, por que coletamos, com quem compartilhamos, por quanto tempo guardamos e quais direitos VOCÊ tem** sobre eles, nos termos da **Lei nº 13.709/2018 (LGPD)**.

A Dr. Cleitinho adota uma postura de **minimização de dados**: coletamos apenas o que é necessário para prestar o serviço contratado por VOCÊ.

---

## 2. Quem somos (Controladora)

**LATE E MIA VETERINARIA LTDA**, pessoa jurídica de direito privado, inscrita no CNPJ sob o n. **47.937.233/0001-89**, com sede em **Camboriú/SC** (Rua Osvaldo Minella, 56 — Bairro Lídia Duarte, CEP 88340-000), que atua sob o nome fantasia **Dr. Cleitinho**, é a **Controladora** dos dados pessoais tratados no âmbito do Plano Emergencial Veterinário Dr. Cleitinho, nos termos do **art. 5º, VI da LGPD**.

---

## 3. Quando coletamos seus dados

A coleta de dados pessoais ocorre **em um único momento**: quando VOCÊ **conclui** o passo a passo de contratação no fluxo \`/contratar\` da Dr. Cleitinho.

**Importante para VOCÊ saber:** o fluxo de contratação tem 4 (quatro) etapas (cadastro, pets, contrato, pagamento). Durante as etapas 1 a 3, os dados ficam **somente no estado local** do navegador de VOCÊ. **Se VOCÊ abandonar o fluxo antes de finalizar o pagamento, nenhum dado pessoal é gravado** em nossos servidores.

A persistência efetiva ocorre apenas no momento em que VOCÊ **confirma o pagamento da primeira mensalidade** — ponto a partir do qual o contrato é celebrado (Cláusula 5 dos TERMOS).

---

## 4. Quais dados coletamos

### 4.1. Dados do tutor (VOCÊ)

| Dado | Tipo (LGPD) | Finalidade |
|------|-------------|-----------|
| Nome completo | Pessoal | Identificação contratual, personalização da comunicação |
| CPF | Pessoal — identificador oficial | Identificação inequívoca, prevenção a fraude, emissão fiscal |
| E-mail | Pessoal — contato | Comunicação transacional |
| Telefone (celular) | Pessoal — contato | Entrega de OTP no aceite, comunicação transacional |
| Endereço completo (CEP, logradouro, número, complemento, bairro, cidade, UF) | Pessoal — localização | Faturamento, atendimento, antifraude do provedor de pagamento |

**Não coletamos:**

- RG, data de nascimento, gênero, estado civil, profissão, renda;
- dados bancários (a cobrança é exclusivamente em cartão de crédito);
- dados de saúde, dados biométricos ou quaisquer dados sensíveis nos termos do **art. 5º, II da LGPD**.

### 4.2. Dados do PET

Nome, espécie (canino ou felino), raça, data de nascimento, sexo, peso, status de castração.

Embora não sejam dados pessoais de VOCÊ na acepção da LGPD, são tratados com a mesma diligência operacional por estarem indissociavelmente vinculados ao tutor.

### 4.3. Dados de aceite contratual

Registrados automaticamente no momento do aceite eletrônico, para fins de auditoria e força probatória:

- data e hora do aceite (UTC);
- endereço IP de origem;
- *user agent* do navegador;
- VERSÃO DO CONTRATO aceita;
- snapshot do texto exato apresentado;
- hash do código OTP entregue;
- callback de entrega da operadora SMS.

### 4.4. Dados de origem do tráfego (Touchpoint)

Coletamos automaticamente, da URL ou da sessão de navegação, os seguintes parâmetros: \`utmSource\`, \`utmMedium\`, \`utmCampaign\`, \`utmContent\`, \`utmTerm\`, \`gclid\`, \`fbclid\`, \`referrer\`, \`referralCode\`, \`capturedAt\`.

**Finalidade:** medir a efetividade dos canais de aquisição de novos clientes.

**Importante:** atualmente **não cruzamos** esses dados com plataformas de marketing automation, anunciantes ou brokers de dados.

### 4.5. Dados de pagamento

**Os dados do cartão de crédito (número/PAN, código de verificação/CVV, validade, nome do titular do cartão) nunca chegam aos servidores da Dr. Cleitinho.** Eles são **tokenizados** diretamente no navegador de VOCÊ pelo Processador de Pagamento (Pagar.me).

Mantemos em nossos sistemas apenas **referências opacas** geradas pelo Processador:

- \`pagarmeCustomerId\` (identificador anônimo do cliente no Pagar.me);
- \`pagarmeSubscriptionId\` (identificador anônimo da assinatura);
- \`pagarmeSubscriptionItemId\` (identificador anônimo do item da assinatura, por PET).

Conformidade **PCI-DSS** por construção: a Dr. Cleitinho não armazena, processa nem transmite dados de cartão em texto claro.

### 4.6. Dados de uso do benefício

Quando VOCÊ utiliza o benefício (consulta emergencial, atendimento da CLÍNICA com aplicação de desconto do Clube de Vantagens), registramos:

- data e hora do atendimento;
- PET atendido;
- tipo de procedimento;
- valor cheio, valor cobrado, desconto aplicado;
- identificação do veterinário responsável.

**Não armazenamos prontuário clínico detalhado nem dados de saúde do PET** — esses dados ficam no sistema da CLÍNICA conforme as obrigações próprias do exercício veterinário (normas do CRMV-SC).

---

## 5. Bases legais aplicadas

Aplicamos as seguintes bases legais da LGPD (art. 7º) para o tratamento dos dados acima:

| Base legal | Onde aplicamos |
|------------|---------------|
| **Execução de contrato** (art. 7º, V) | Dados de adesão, cobrança recorrente, comunicação transacional, registro de aceite, uso do benefício, atendimento de suporte |
| **Legítimo interesse** (art. 7º, IX) | Auditoria de aceite, prevenção a fraude, melhoria operacional, dados de touchpoint para medição de aquisição |
| **Cumprimento de obrigação legal ou regulatória** (art. 7º, II) | Retenção fiscal e contábil; atendimento a requisições de autoridades competentes |
| **Consentimento** (art. 7º, I) | **Não usamos consentimento como base legal principal hoje**, já que a contratação é regida por execução de contrato. Eventual inclusão futura de marketing direto, recuperação de carrinho ou outras finalidades secundárias dependerá de **consentimento explícito, granular e revogável**, com mecanismo de descadastro disponível |

---

## 6. Com quem compartilhamos seus dados

Compartilhamos dados pessoais **estritamente o necessário** com **operadores** (LGPD art. 5º, VII) que prestam serviços essenciais ao Plano:

| Operador | Função | Dados compartilhados |
|----------|--------|---------------------|
| **Pagar.me Pagamentos S.A.** | Gateway de pagamento e cobrança recorrente | Cartão tokenizado, CPF, e-mail, endereço, valor da fatura |
| **Twilio Inc.** | Entrega de SMS — OTP do aceite e mensagens transacionais | Telefone celular, conteúdo da mensagem |
| **Resend Inc.** | Envio de e-mails transacionais | E-mail, nome, conteúdo da mensagem |
| **CLÍNICA Dr. Cleitinho** | Comprovação de uso do benefício | Identificação do tutor e do PET, evento de uso |

Cada operador atua **sob nossas instruções** e está submetido a obrigações contratuais de **confidencialidade e segurança da informação**.

**Não compartilhamos dados** com:

- plataformas de marketing, remarketing ou anunciantes;
- *data brokers* ou agregadores de dados;
- terceiros para finalidades de venda ou cruzamento comercial.

Atualmente, **não há nenhuma operação de cessão, venda ou cruzamento de dados próprios** com terceiros.

---

## 7. Transferência internacional de dados

**Twilio Inc.** e **Resend Inc.** operam infraestrutura predominantemente nos **Estados Unidos da América**. Eventual transferência internacional residual de dados pessoais (telefone celular para Twilio; e-mail para Resend) decorrente da utilização desses operadores observa o **art. 33 da LGPD**.

A Dr. Cleitinho assegura-se de que esses operadores adotam **cláusulas-padrão contratuais e medidas técnicas adequadas** para garantir nível de proteção compatível com o exigido pela legislação brasileira.

---

## 8. Por quanto tempo guardamos seus dados (retenção)

| Categoria | Prazo de retenção | Fundamento |
|-----------|------------------|------------|
| Dados de adesão, cobrança e uso do benefício | **5 (cinco) anos** após o cancelamento do PLANO | CDC art. 27; CTN arts. 173/174; LGPD art. 16, III |
| Registros de aceite contratual (auditoria) | **5 (cinco) anos** após o cancelamento | Mesma fundamentação |
| Logs técnicos e de segurança | 5 (cinco) anos da geração | Detecção e investigação de incidentes |
| Dados fiscais e tributários | Conforme legislação tributária aplicável | Obrigação legal |
| Dados de touchpoint (UTM) | 5 (cinco) anos da coleta | Análise histórica de aquisição |

**Após o término do prazo aplicável**, os dados são **eliminados ou anonimizados** conforme procedimento técnico documentado pela Dr. Cleitinho.

**Fundamento da retenção de 5 anos:**

- **CDC art. 27** — prescrição quinquenal para ações de reparação por fato do serviço;
- **CTN arts. 173 e 174** — decadência e prescrição tributária de 5 anos;
- **LGPD art. 16, III** — guarda por exercício regular de direitos em processos administrativos, judiciais ou arbitrais.

---

## 9. Seus direitos como titular (LGPD art. 18)

VOCÊ tem direito a:

- **Confirmação** da existência de tratamento de seus dados;
- **Acesso** aos seus dados pessoais;
- **Correção** de dados incompletos, inexatos ou desatualizados;
- **Anonimização, bloqueio ou eliminação** de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD;
- **Portabilidade** dos dados a outro fornecedor;
- **Eliminação** dos dados pessoais tratados com base em consentimento (quando aplicável);
- **Informação** sobre entidades públicas e privadas com as quais compartilhamos seus dados;
- **Informação** sobre a possibilidade de não fornecer consentimento e suas consequências;
- **Revogação do consentimento**, quando aplicável;
- **Revisão de decisões automatizadas** que afetem seus interesses, quando aplicável;
- **Apresentação de reclamação à ANPD** (Autoridade Nacional de Proteção de Dados), em https://www.gov.br/anpd.

### Como exercer seus direitos

Envie e-mail para **dpo@drcleitinho.com.br** contendo:

1. seu **nome completo** e **CPF**;
2. descrição clara do **direito que deseja exercer**;
3. **evidências razoáveis de identidade** (para evitar que terceiros façam pedidos em seu nome).

**Prazo de resposta:** **15 (quinze) dias corridos** a partir do recebimento do pedido.

Caso a resposta não seja satisfatória, VOCÊ pode peticionar à **Autoridade Nacional de Proteção de Dados (ANPD)** — https://www.gov.br/anpd.

---

## 10. Cookies e tecnologias similares

O site da Dr. Cleitinho pode utilizar:

- **Cookies estritamente necessários** ao funcionamento do fluxo de contratação (sessão, segurança, prevenção a fraude);
- **Cookies analíticos** para mensuração da origem do tráfego (parâmetros UTM e referrer).

**Atualmente não utilizamos** cookies de marketing, remarketing ou rastreamento entre sites para finalidades comerciais.

A eventual inclusão futura de cookies não-essenciais será precedida de **banner de consentimento granular**, com possibilidade de aceitar/rejeitar por categoria, conforme padrão LGPD.

---

## 11. Segurança da informação

A Dr. Cleitinho adota medidas técnicas e administrativas razoáveis para proteger os dados pessoais contra acesso não autorizado, perda, alteração ou destruição, incluindo:

- **comunicação criptografada** (TLS/HTTPS) em todas as camadas externas;
- **tokenização** de dados sensíveis (cartão de crédito) por construção (PCI-DSS);
- **hash** de senhas e segredos de longo prazo;
- **controle de acesso baseado em perfis** (admin, atendente), com princípio do menor privilégio;
- **logs de auditoria** para operações sensíveis (aceite, uso do benefício, cancelamento, alteração de dados);
- **monitoramento** e alertas de incidentes de segurança.

### Em caso de incidente

Em caso de **incidente de segurança relevante** envolvendo dados pessoais (LGPD art. 48), a Dr. Cleitinho comunicará a **ANPD** e os titulares afetados nos prazos e na forma da legislação.

---

## 12. O que NÃO fazemos com seus dados

Para evitar dúvidas, registramos explicitamente — atualmente, a Dr. Cleitinho **não realiza** nenhuma das seguintes operações:

- **marketing direto**, e-mail marketing promocional ou push de campanhas;
- **recuperação de carrinho** (cart abandonment) — não capturamos dados antes da finalização do pagamento;
- **segmentação de público para mídia paga** com base em dados próprios;
- **cessão, venda ou compartilhamento comercial** dos seus dados;
- **decisões automatizadas** que afetem direitos seus sem revisão humana;
- **cruzamento de dados** com brokers, agregadores ou redes de afiliados.

Qualquer inclusão futura dessas operações dependerá de **base legal específica**, eventual **consentimento explícito, granular e revogável** e **atualização desta Política**, com aviso prévio mínimo de **30 (trinta) dias** a VOCÊ.

Especificamente para **comunicações de marketing direto** e **mecanismos de recuperação de cadastro** (cart abandonment), a possibilidade de futura ativação está formalmente registrada na **Cláusula 14.7 dos TERMOS** — que reitera, expressamente, que **o aceite dos TERMOS não constitui consentimento** para esses tratamentos. Quando e se forem ativados, VOCÊ será convidado a manifestar opt-in separado, em mecanismo dissociado do aceite contratual, com possibilidade de recusa total sem qualquer prejuízo aos serviços contratados.

---

## 13. Encarregado de Proteção de Dados (DPO)

**Encarregado de Proteção de Dados:** **dpo@drcleitinho.com.br**

Use este canal para:

- exercer qualquer dos direitos do **art. 18 da LGPD**;
- esclarecer dúvidas sobre esta Política de Privacidade;
- comunicar suspeita de incidente envolvendo seus dados;
- denunciar uso indevido de dados.

---

## 14. Alterações desta Política

Esta Política pode ser revisada periodicamente para refletir mudanças operacionais, legais ou regulatórias.

**Mudanças relevantes** serão comunicadas a VOCÊ por **e-mail** e pela disponibilização da nova versão na página de privacidade do site da Dr. Cleitinho, com **30 (trinta) dias** de antecedência da entrada em vigor.

**Versões anteriores** ficam preservadas em arquivo interno e podem ser solicitadas ao DPO.

---

## 15. Lei aplicável e foro

Esta Política é regida pelas **leis da República Federativa do Brasil**, em especial a **Lei Geral de Proteção de Dados (Lei nº 13.709/2018)** e o **Código de Defesa do Consumidor (Lei nº 8.078/1990)**.

Para dirimir questões oriundas desta Política, aplica-se a mesma cláusula de foro dos TERMOS — **Comarca de Camboriú/SC**, **com exceção dos foros privilegiados eventualmente aplicáveis ao consumidor** (CDC art. 101, I).

---

## 16. Contato

- **Encarregado de Proteção de Dados (DPO):** **dpo@drcleitinho.com.br** — exercício dos direitos do art. 18 da LGPD, dúvidas sobre esta Política, comunicação de incidentes e denúncia de uso indevido de dados.
- **Atendimento ao Consumidor (SAC):** **sac@drcleitinho.com.br** — direito de arrependimento (Cláusula 8 dos TERMOS), cancelamento, reclamações e suporte ao uso do plano.
- **Atendimento geral:** **contato@drcleitinho.com.br** — dúvidas comerciais, parcerias e demais assuntos não relacionados aos canais acima.
- **Site:** site oficial da Dr. Cleitinho
`;
