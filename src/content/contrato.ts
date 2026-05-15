/**
 * Texto oficial dos Termos de Uso e Contrato de Prestação de Serviços do
 * Plano Emergencial Veterinário Dr. Cleitinho.
 *
 * Fonte de verdade única — consumida por:
 *   - página /termos (renderiza via react-markdown)
 *   - step 3 do fluxo /contratar (renderiza via react-markdown)
 *   - SHA-256 hex do conteúdo é enviado ao backend como prova do texto
 *     efetivamente exibido ao cliente no momento do aceite eletrônico.
 *
 * Qualquer alteração no texto exige:
 *   1) bump explícito de `CONTRACT_VERSION`
 *   2) snapshot do markdown em `docs/juridico/<data>/revisado/`
 *   3) comunicação prévia aos titulares ativos (cláusula 16 dos TERMOS)
 */

/**
 * Versão vigente dos TERMOS. Persistida em `ContractAcceptanceEvidence` no
 * backend e usada para identificar exatamente qual edição cada cliente
 * aceitou. NUNCA alterar sem subir um novo snapshot do texto.
 */
export const CONTRACT_VERSION = 'v1.0';

/**
 * Data de entrada em vigor desta versão dos TERMOS (ISO YYYY-MM-DD).
 * Exibida ao usuário ao lado de `CONTRACT_VERSION`.
 */
export const CONTRACT_EFFECTIVE_DATE = '2026-05-14';

export const CONTRATO_TEXTO = `# TERMOS DE USO E CONTRATO DE PRESTAÇÃO DE SERVIÇOS
## Plano Emergencial Veterinário Dr. Cleitinho

**Versão do documento:** v1.0 — 14/05/2026

> **Aviso a VOCÊ:** este é o texto que VOCÊ está aceitando ao contratar o Plano Emergencial Veterinário Dr. Cleitinho. **Leia com atenção.** Ao concluir o aceite eletrônico no fluxo de contratação, VOCÊ **declara ter lido, compreendido e concordado** com cada uma das cláusulas a seguir, bem como com a **[Política de Privacidade](https://plano.drcleitinho.com.br/privacidade)** da Dr. Cleitinho, que é parte integrante destes TERMOS.

---

## Identificação das partes

- **Dr. Cleitinho** (também referida como "nós" ou "a CONTRATADA"): **LATE E MIA VETERINARIA LTDA**, pessoa jurídica de direito privado, inscrita no CNPJ sob o n. **47.937.233/0001-89**, com sede na Rua Osvaldo Minella, 56 — Bairro Lídia Duarte, Camboriú/SC, CEP 88340-000, que atua sob o nome fantasia **Dr. Cleitinho**.
- **VOCÊ** (também referido como "o CONTRATANTE"): **pessoa natural, maior de 18 (dezoito) anos, residente no Brasil, com CPF regular**, que tenha aceitado estes TERMOS no fluxo de contratação eletrônica da Dr. Cleitinho.

**Pessoa jurídica não é admitida como CONTRATANTE** nesta versão dos TERMOS.

---

## Cláusula 1 — Definições

Para os fins destes TERMOS, as expressões abaixo, quando grafadas com inicial maiúscula, têm os significados a seguir, independentemente de estarem no singular ou no plural:

**1.1.** **PLANO** ou **Plano Emergencial Veterinário Dr. Cleitinho:** a assinatura mensal recorrente contratada por VOCÊ, que confere ao PET vinculado os benefícios descritos na Cláusula 2.

**1.2.** **PET:** animal doméstico das espécies canina (cão) ou felina (gato), com **até 10 (dez) anos** para cães e **até 12 (doze) anos** para gatos na data da adesão, cadastrado por VOCÊ no fluxo de contratação.

**1.3.** **ATENDIMENTO EMERGENCIAL:** situação clínica que oferece risco imediato à vida do PET ou exige intervenção médica imediata para evitar agravamento severo, conforme caracterizada na Cláusula 3 e avaliada pelo médico veterinário da CLÍNICA.

**1.4.** **CARÊNCIA:** período de **180 (cento e oitenta) dias corridos**, contados da Confirmação do Primeiro Pagamento, durante o qual o PET não tem direito ao benefício emergencial. Detalhamento na Cláusula 4.

**1.5.** **CONFIRMAÇÃO DO PRIMEIRO PAGAMENTO:** momento em que o Processador de Pagamento confirma a captura efetiva do valor da primeira mensalidade no cartão de crédito informado por VOCÊ.

**1.6.** **CICLO:** período mensal de 30 (trinta) dias, ancorado na data da Confirmação do Primeiro Pagamento.

**1.7.** **ASSINATURA CONSOLIDADA:** regime único de cobrança em que todos os PETs vinculados a VOCÊ compartilham uma mesma assinatura no Processador de Pagamento, com fatura única mensal consolidada. Detalhamento na Cláusula 6.

**1.8.** **PROCESSADOR DE PAGAMENTO** ou **GATEWAY:** a empresa **Pagar.me Pagamentos S.A.**, responsável pela tokenização e cobrança recorrente dos valores no cartão de crédito.

**1.9.** **CLÍNICA:** a unidade física da Dr. Cleitinho, situada no endereço da CONTRATADA, onde os atendimentos veterinários são prestados.

**1.10.** **CLUBE DE VANTAGENS:** conjunto de descontos em procedimentos não-emergenciais prestados diretamente pela CLÍNICA, descrito na Cláusula 2.2.2.

**1.11.** **ACEITE ELETRÔNICO:** manifestação de vontade de VOCÊ, expressa no fluxo de contratação eletrônica da Dr. Cleitinho, com OTP por SMS e registro auditável, configurando assinatura eletrônica avançada nos termos da Cláusula 5.

**1.12.** **TERMOS** ou **CONTRATO:** este documento, em sua versão vigente identificada pela VERSÃO DO CONTRATO.

**1.13.** **VERSÃO DO CONTRATO:** identificador único que individualiza cada edição destes TERMOS, composto pelo número de versão e data de entrada em vigor (exemplo: \`v1.0 — 14/05/2026\`). A VERSÃO DO CONTRATO aceita por VOCÊ no momento do aceite eletrônico é registrada no log de auditoria descrito na Cláusula 5.3 e preservada em snapshot para fins probatórios.

**1.14.** **POLÍTICA DE PRIVACIDADE:** documento separado, parte integrante destes TERMOS, que descreve em detalhe o tratamento de dados pessoais pela Dr. Cleitinho.

---

## Cláusula 2 — Objeto e cobertura

**2.1.** Este CONTRATO tem por objeto a prestação, pela Dr. Cleitinho, de serviços de **atendimento veterinário emergencial** ao PET, bem como benefícios complementares descritos nesta Cláusula.

**2.2.** O PLANO confere a VOCÊ **três pilares** de benefício:

### 2.2.1. Benefício emergencial

**50% (cinquenta por cento) de desconto** sobre o valor cheio do ATENDIMENTO EMERGENCIAL prestado ao PET pela CLÍNICA, conforme caracterização técnica da Cláusula 3 e cumprida a CARÊNCIA da Cláusula 4.

### 2.2.2. Clube de Vantagens

A Dr. Cleitinho oferece, no âmbito do Clube de Vantagens, **descontos em procedimentos não-emergenciais** prestados diretamente pela CLÍNICA, **disponíveis a VOCÊ a partir da Confirmação do Primeiro Pagamento** (sem carência).

**Configuração vigente na data de aceite destes TERMOS:**

| Procedimento | Desconto |
|--------------|----------|
| Microchipagem | **30%** |
| Consultas eletivas e de especialidades | **30%** |
| Exames de sangue laboratoriais | **10%** |
| Exames de imagem (Raio-X e Ultrassom) | **5%** |
| Cirurgias eletivas | **10%** |

**Tabela do Clube de Vantagens (página atualizável).** A Dr. Cleitinho **disponibilizará e manterá** a Tabela do Clube de Vantagens em **página dedicada do site oficial**, permitindo a atualização da lista de procedimentos e respectivos percentuais conforme as seguintes regras assimétricas:

**(a)** **INCLUSÕES** de novos procedimentos no Clube de Vantagens e **AUMENTOS** dos percentuais de desconto vigentes podem ser feitas pela Dr. Cleitinho **a qualquer momento, sem aviso prévio** — pois beneficiam exclusivamente a VOCÊ, passando a vigorar imediatamente após a publicação;

**(b)** **REDUÇÕES** de percentual de desconto ou **EXCLUSÕES** de procedimentos previamente listados ficam **sujeitas a aviso prévio mínimo de 30 (trinta) dias** por e-mail. Nesse prazo, VOCÊ poderá **rejeitar a alteração exercendo o cancelamento** (Cláusula 9) sem qualquer ônus, ou seguir vinculado às novas condições caso opte por continuar com o PLANO.

A Dr. Cleitinho **manterá histórico das versões anteriores** da Tabela do Clube de Vantagens acessível a VOCÊ, para verificação da configuração vigente em qualquer momento da relação contratual.

**Em qualquer cenário, alterações da Tabela do Clube de Vantagens não afetam:** (i) a essência e os limites do benefício emergencial (Cláusula 2.2.1); (ii) a CARÊNCIA (Cláusula 4); (iii) o valor mensal do PLANO (Cláusula 6.1); (iv) a regra de reajuste (Cláusula 7).

**Os descontos do Clube de Vantagens não são cumulativos** com outras promoções da Dr. Cleitinho, **aplicam-se exclusivamente a serviços prestados pela CLÍNICA** e **não abrangem serviços terceirizados**.

### 2.2.3. Canal de orientação por WhatsApp

A Dr. Cleitinho mantém canal de orientação por WhatsApp para esclarecimento de dúvidas antes ou durante um quadro emergencial, com **horário usual das 07h às 23h**, **sujeito à disponibilidade operacional** da equipe veterinária.

**Este canal é prestado em regime de esforço comercial**, não constituindo SLA contratual de tempo de resposta nem promessa de cobertura 24h. A indisponibilidade pontual do canal não configura descumprimento contratual.

**2.3.** O PLANO **não cobre** (sem prejuízo dos descontos do Clube de Vantagens, quando aplicáveis):

- vacinação e vermifugação de rotina;
- consultas de rotina ou acompanhamento sem urgência;
- banho, tosa e demais procedimentos estéticos;
- exames preventivos sem indicação emergencial;
- internações posteriores à fase aguda;
- tratamentos contínuos, crônicos ou oncológicos;
- medicamentos para uso domiciliar.

---

## Cláusula 3 — Atendimento emergencial

**3.1.** Para os fins destes TERMOS, consideram-se **ATENDIMENTOS EMERGENCIAIS** as situações clínicas que oferecem risco imediato à vida do PET ou exigem intervenção médica imediata para evitar agravamento severo, tais como — exemplificativa e não exaustivamente:

- traumas graves (atropelamentos, quedas, mordidas, ferimentos);
- intoxicações e envenenamentos;
- convulsões;
- dificuldade respiratória aguda;
- hemorragias;
- choque (hipovolêmico, séptico ou anafilático);
- dor aguda intensa.

**3.2.** A **caracterização** do quadro como ATENDIMENTO EMERGENCIAL é feita pelo **médico veterinário da CLÍNICA**, com base em critérios técnicos e protocolos médicos vigentes.

**3.3.** VOCÊ poderá, querendo, **solicitar segunda opinião por escrito** sobre a caracterização do quadro, **sem prejuízo da continuidade do atendimento**. Em caso de divergência fundamentada, VOCÊ pode acionar o canal de atendimento da Dr. Cleitinho, que abrirá protocolo de reanálise — assegurada a prevalência da indicação clínica em situações de urgência atual.

**3.4.** O benefício emergencial cobre exclusivamente a **fase aguda** do atendimento: consulta emergencial, estabilização clínica inicial do PET, medicações administradas durante o atendimento e procedimentos emergenciais necessários para a estabilização — **incluindo intervenção cirúrgica emergencial, se caso cirúrgico**. Internações de continuidade, cirurgias eletivas e procedimentos não relacionados ao quadro emergencial **não estão incluídos** no desconto de 50%.

---

## Cláusula 4 — Carência

**4.1.** O PLANO possui período de **CARÊNCIA de 180 (cento e oitenta) dias corridos**, contados da **Confirmação do Primeiro Pagamento**, durante o qual o PET **não tem direito ao benefício emergencial** (Cláusula 2.2.1), ainda que VOCÊ esteja com o pagamento em dia.

**4.2.** A CARÊNCIA é **individual por PET**: cada PET cadastrado por VOCÊ tem seu próprio prazo, contado da Confirmação do Primeiro Pagamento da fatura que primeiramente o inclua (ver Cláusula 12).

**4.3.** Os benefícios do **Clube de Vantagens** (Cláusula 2.2.2) e do **canal de orientação** (Cláusula 2.2.3) **NÃO se sujeitam à CARÊNCIA** — estão disponíveis a VOCÊ a partir da Confirmação do Primeiro Pagamento.

**4.4.** Em comunicações comerciais, a Dr. Cleitinho pode referir-se à CARÊNCIA simplificadamente como "6 meses". Para fins contratuais e operacionais, **prevalece o prazo de 180 (cento e oitenta) dias corridos**.

---

## Cláusula 5 — Aceite eletrônico e celebração do CONTRATO

**5.1.** A contratação ocorre **integralmente em ambiente digital**, no fluxo de adesão disponibilizado pela Dr. Cleitinho.

**5.2.** No fluxo de adesão, VOCÊ:

(i) preenche dados pessoais e do PET;
(ii) recebe um **código de uso único (OTP)** por SMS no celular informado;
(iii) **manifesta seu aceite eletrônico** marcando o checkbox de concordância com estes TERMOS e com a [Política de Privacidade](https://plano.drcleitinho.com.br/privacidade);
(iv) informa os dados do cartão de crédito para a cobrança recorrente.

**5.3.** No momento do aceite eletrônico, a Dr. Cleitinho registra automaticamente, em log auditável:

- data e hora (em UTC) do aceite;
- endereço IP de origem da requisição;
- *user agent* do navegador utilizado;
- VERSÃO DO CONTRATO aceita;
- snapshot do texto exato apresentado a VOCÊ;
- hash do código OTP entregue;
- callback de entrega da operadora de SMS.

**5.4.** **O conjunto de evidências acima configura assinatura eletrônica avançada** nos termos do **art. 4º, II da Lei nº 14.063/2020** e do **§ 2º do art. 10 da Medida Provisória nº 2.200-2/2001**.

**5.5.** **O CONTRATO considera-se celebrado** entre VOCÊ e a Dr. Cleitinho no momento da **Confirmação do Primeiro Pagamento**. A partir desse momento, iniciam-se a vigência do PLANO e a contagem da CARÊNCIA.

---

## Cláusula 6 — Pagamento e cobrança consolidada

**6.1.** Pela prestação dos serviços objeto deste CONTRATO, VOCÊ pagará à Dr. Cleitinho o valor mensal de **R$ 25,00 (vinte e cinco reais) por PET cadastrado**.

**6.2.** A cobrança é **mensal recorrente**, debitada automaticamente no cartão de crédito informado por VOCÊ no momento da adesão. A primeira cobrança ocorre **no momento da adesão** (modelo prepaid). As cobranças subsequentes ocorrem no **mesmo dia do mês** da primeira cobrança (dia âncora).

**6.3.** São aceitas as bandeiras de cartão de crédito: **Visa, Mastercard, Elo, American Express e Hipercard**, conforme suportadas pelo Processador de Pagamento. Outras bandeiras podem ser incorporadas futuramente pelo Processador, sem necessidade de aditamento contratual.

**6.4.** Quando VOCÊ tiver mais de um PET cadastrado, todos os PETs ficam sob **ASSINATURA CONSOLIDADA**: uma única assinatura no Processador de Pagamento, com fatura mensal única no valor de \`N × R$ 25,00\`, onde \`N\` é o número de PETs vivos no ciclo. **A cobertura e a CARÊNCIA, no entanto, permanecem individuais por PET.**

**6.5.** **Os dados do cartão de crédito (número, código de verificação, validade) são tokenizados diretamente pelo Processador de Pagamento no navegador de VOCÊ e nunca trafegam pelos servidores da Dr. Cleitinho.** A Dr. Cleitinho armazena apenas **referências opacas** geradas pelo Processador (identificadores anônimos), em conformidade com PCI-DSS.

**6.6.** Em caso de atraso no pagamento, ficam estabelecidos, cumulativamente: (i) **multa de 2% (dois por cento)** sobre o valor em atraso; (ii) atualização monetária pelo **IPCA**; e (iii) juros de mora de **1% (um por cento) ao mês**, calculados pro rata die — sem prejuízo das medidas previstas na Cláusula 10.

---

## Cláusula 7 — Reajuste anual

**7.1.** O valor mensal do PLANO será reajustado **anualmente**, na **data de aniversário** da Confirmação do Primeiro Pagamento, pela variação positiva acumulada do **IPCA (Índice Nacional de Preços ao Consumidor Amplo)** dos 12 (doze) meses anteriores, ou outro índice que venha legalmente a substituí-lo.

**7.2.** O reajuste será comunicado a VOCÊ por e-mail com antecedência mínima de **30 (trinta) dias** da data de aplicação.

**7.3.** Não há "reajuste técnico" condicionado a sinistralidade ou outros indicadores operacionais — o único reajuste contratualmente previsto é o do item 7.1.

---

## Cláusula 8 — Direito de arrependimento

**8.1.** Nos termos do **art. 49 do Código de Defesa do Consumidor (Lei nº 8.078/1990)**, em razão da natureza eletrônica e à distância da contratação, VOCÊ pode **desistir do CONTRATO em até 7 (sete) dias corridos**, contados da data do aceite eletrônico (Cláusula 5).

**8.2.** O exercício do direito de arrependimento **não impõe a VOCÊ qualquer ônus**: a Dr. Cleitinho realizará o **reembolso integral** do valor pago, mediante estorno no cartão de crédito utilizado, no prazo previsto pelo Processador de Pagamento.

**8.3.** A manifestação da desistência deverá ser encaminhada por VOCÊ ao canal oficial de Atendimento ao Consumidor (SAC) da Dr. Cleitinho: **sac@drcleitinho.com.br** — com indicação clara da intenção de exercer o direito de arrependimento. A Dr. Cleitinho enviará retorno automático de protocolo confirmando o recebimento.

**8.4.** O direito de arrependimento **não se aplica** caso VOCÊ já tenha utilizado qualquer dos benefícios do PLANO no período de 7 dias.

---

## Cláusula 9 — Cancelamento pelo CONTRATANTE

**9.1.** VOCÊ pode **cancelar o PLANO a qualquer momento**, **sem fidelidade, sem multa e sem aviso prévio**.

**9.2.** O cancelamento pode ser solicitado:

(i) **diretamente** em canal oficial de Atendimento ao Consumidor (SAC) da Dr. Cleitinho — e-mail **sac@drcleitinho.com.br**, WhatsApp ou telefone; ou
(ii) mediante **link público de confirmação** enviado por atendente da Dr. Cleitinho, com validade de **7 (sete) dias** — após esse prazo o link expira automaticamente, e novo link gerado invalida o anterior.

**9.3.** A cobertura **permanece ativa até o final do ciclo já pago** (\`coveredUntil\`). **Não há reembolso proporcional** dos dias remanescentes do ciclo em curso.

**9.4.** O cancelamento é **irreversível**: para retomar a cobertura, VOCÊ deverá realizar **nova contratação**, com **nova CARÊNCIA integral de 180 dias** (ver Cláusula 12.4).

**9.5.** Quando VOCÊ tiver múltiplos PETs cadastrados, o cancelamento de um PET individualmente é tratado como **remoção** (Cláusula 12.2); o cancelamento do **último** PET equivale ao cancelamento integral do CONTRATO.

---

## Cláusula 10 — Suspensão e cancelamento por inadimplência

**10.1.** Em caso de não pagamento da fatura mensal na data devida, a Dr. Cleitinho adotará modelo em **dois estágios**:

### 10.1.1. Suspensão dos benefícios

Transcorridos **5 (cinco) dias corridos** da primeira tentativa de cobrança recusada, sem regularização, **os benefícios do PLANO ficam suspensos** (emergencial e Clube de Vantagens). O PET permanece cadastrado e VOCÊ permanece notificado para regularização.

### 10.1.2. Cancelamento automático

Transcorridos **15 (quinze) dias corridos** da primeira tentativa de cobrança recusada, sem regularização, **o PLANO é automaticamente cancelado**, independentemente de notificação adicional.

**10.2.** Durante o período de suspensão, ainda que VOCÊ esteja fora da CARÊNCIA, o PET **não tem direito** aos benefícios. A **regularização do pagamento** dentro dos 30 dias restaura o status do PLANO conforme regras de adimplência aplicáveis ao Processador de Pagamento.

**10.3.** Após o cancelamento automático por inadimplência, a retomada da cobertura exige **nova contratação**, com nova CARÊNCIA integral.

**10.4.** A Dr. Cleitinho notificará VOCÊ por **e-mail, SMS e/ou WhatsApp** em cada estágio (suspensão e cancelamento iminente), com link público para atualização do cartão de crédito.

---

## Cláusula 11 — Rescisão por iniciativa da Dr. Cleitinho — outras hipóteses

**11.1.** A Dr. Cleitinho poderá rescindir este CONTRATO, mediante notificação a VOCÊ, nas seguintes hipóteses:

(i) **fraude na adesão** — informação falsa sobre identidade, CPF, idade do tutor ou condição do PET;
(ii) **uso indevido do benefício** — tentativa de obter desconto fora das hipóteses cobertas, em nome de terceiros, ou para PET não cadastrado;
(iii) **conduta desrespeitosa, agressiva ou discriminatória** comprovada de VOCÊ contra a equipe da Dr. Cleitinho — assegurado contraditório por **15 (quinze) dias**, salvo em caso de violência atual ou risco iminente;
(iv) **descumprimento reiterado** de obrigações destes TERMOS;
(v) **descontinuação do serviço Dr. Cleitinho** — com aviso prévio mínimo de **30 (trinta) dias** e reembolso de eventuais valores cobrados antecipadamente em desacordo.

---

## Cláusula 12 — Adição, remoção, óbito e recontratação de PETs

### 12.1. Adição de PET ao PLANO existente

VOCÊ pode adicionar novos PETs a qualquer momento, mediante solicitação à equipe de atendimento da Dr. Cleitinho. A adição é considerada **alteração contratual**, e o aceite de VOCÊ é registrado eletronicamente, com snapshot do termo aditivo.

**Não há cobrança avulsa na adição:** o PET passa a ser cobrado na **próxima fatura consolidada**. A CARÊNCIA individual do PET adicionado começa a contar da **Confirmação do Primeiro Pagamento da fatura que primeiramente o inclua**.

### 12.2. Remoção de PET

VOCÊ pode remover individualmente um PET, mediante solicitação à equipe de atendimento da Dr. Cleitinho. A remoção encerra a cobertura daquele PET ao final do ciclo já pago (\`coveredUntil\`), **sem reembolso proporcional**. Os demais PETs permanecem cobertos normalmente, com fatura reduzida proporcionalmente nos ciclos seguintes.

A **remoção do único PET ativo** equivale ao cancelamento integral do CONTRATO (Cláusula 9).

### 12.3. Óbito do PET

Em caso de óbito do PET, VOCÊ **fica obrigado a comunicar imediatamente** à Dr. Cleitinho, pelos canais oficiais de atendimento. As cobranças relacionadas ao PET cessam a partir do **mês subsequente** à comunicação.

**Valores pagos entre a data do óbito e a data da comunicação não são reembolsáveis**, dada a impossibilidade material de verificação retroativa.

### 12.4. Recontratação

A recontratação para PET anteriormente cancelado é permitida, exigindo cumulativamente:

(i) **novo aceite eletrônico** destes TERMOS na versão então vigente;
(ii) **nova CARÊNCIA integral de 180 dias**, contada da Confirmação do Primeiro Pagamento da nova adesão.

O histórico anterior do PET permanece registrado para auditoria, mas **não confere** direito a cobertura imediata nem dispensa qualquer parte da nova CARÊNCIA.

---

## Cláusula 13 — Limitação de responsabilidade

**13.1.** A Dr. Cleitinho presta os serviços com a **diligência exigida** pela natureza da atividade veterinária, observadas as normas técnicas do **Conselho Regional de Medicina Veterinária de Santa Catarina (CRMV-SC)**.

**13.2.** **A Dr. Cleitinho não se responsabiliza por danos indiretos, lucros cessantes ou danos morais decorrentes do uso ou da impossibilidade de uso dos serviços**, salvo nas hipóteses legais cogentes.

**13.3.** O PLANO **tem caráter emergencial e limitado**: a Dr. Cleitinho **não garante** cura, alta clínica ou sobrevivência do PET, dada a natureza imprevisível e grave dos quadros emergenciais.

**13.4.** A **recusa, por VOCÊ, de procedimentos clinicamente indicados** pelo médico veterinário pode comprometer o resultado do atendimento, sem que isso implique responsabilidade da Dr. Cleitinho quanto ao desfecho clínico.

**13.5.** As limitações desta Cláusula **não excluem** a responsabilidade da Dr. Cleitinho por **vícios na prestação do serviço** nos termos do art. 20 do CDC, nem por **dolo ou culpa grave** comprovados.

---

## Cláusula 14 — Proteção de dados pessoais

**14.1.** A Dr. Cleitinho atua como **controladora** dos dados pessoais de VOCÊ e dos dados associados ao PET, nos termos do **art. 5º, VI da Lei nº 13.709/2018 (LGPD)**.

**14.2.** O tratamento de dados pessoais é regido pela **[Política de Privacidade da Dr. Cleitinho](https://plano.drcleitinho.com.br/privacidade)**, **parte integrante destes TERMOS**, disponível em \`https://plano.drcleitinho.com.br/privacidade\`.

**14.3.** A Política de Privacidade descreve, entre outros:

(i) dados pessoais coletados;
(ii) bases legais aplicadas;
(iii) finalidades de tratamento;
(iv) **operadores** envolvidos (atualmente: **Pagar.me**, **Twilio**, **Resend** e a **CLÍNICA**);
(v) prazos de retenção;
(vi) direitos do titular (art. 18 da LGPD);
(vii) canais de contato com o Encarregado de Proteção de Dados (DPO).

**14.4. Encarregado de Proteção de Dados (DPO):** **dpo@drcleitinho.com.br**. Prazo de resposta a pedidos de exercício de direitos: **15 (quinze) dias** contados do recebimento.

**14.5. Retenção pós-cancelamento:** os dados pessoais associados ao CONTRATO são retidos por **5 (cinco) anos** após o cancelamento, para fins de **defesa em eventual disputa**, **atendimento a obrigações fiscais** e **exercício regular de direitos** pela Dr. Cleitinho — sem prejuízo de prazos legais específicos eventualmente aplicáveis.

**14.6. Transferência internacional residual:** alguns operadores (Twilio, Resend) operam infraestrutura predominantemente nos Estados Unidos da América. Eventual transferência internacional de dados pessoais decorrente desses operadores observa o **art. 33 da LGPD**, em especial cláusulas-padrão contratuais firmadas com os operadores que asseguram nível adequado de proteção.

**14.7. Comunicações de marketing e recuperação de cadastro — reserva para tratamentos futuros.**

A Dr. Cleitinho poderá, no futuro, oferecer a VOCÊ:

(i) comunicações de natureza promocional, ofertas comerciais e conteúdo de marketing direto;

(ii) mecanismos de retomada de cadastro interrompido ("recuperação de carrinho"), com a captura antecipada de dados de contato no fluxo de adesão.

Tais tratamentos:

(a) **NÃO estão em operação** na data de aceite destes TERMOS;

(b) quando ativados, ficarão **condicionados a consentimento específico, granular e revogável** de VOCÊ, nos termos do **art. 8º da LGPD**, expresso em momento e mecanismo **distintos e separados** do aceite deste CONTRATO;

(c) serão precedidos de **atualização da Política de Privacidade**, com aviso prévio de **30 (trinta) dias** da entrada em vigor;

(d) admitirão **descadastro a qualquer momento**, sem ônus, por mecanismo automatizado disponível em cada comunicação enviada.

**O aceite destes TERMOS NÃO constitui, em nenhuma hipótese, consentimento de VOCÊ para os tratamentos descritos neste item.**

---

## Cláusula 15 — Propriedade intelectual

**15.1.** A marca **Dr. Cleitinho**, o nome, a identidade visual, o conteúdo do site, o texto destes TERMOS, o código-fonte do sistema, os materiais de comunicação e demais elementos distintivos da Dr. Cleitinho são **propriedade exclusiva** da CONTRATADA e estão protegidos pelas leis brasileiras de propriedade intelectual.

**15.2.** Estes TERMOS **não conferem** a VOCÊ qualquer licença ou direito sobre os elementos descritos no item 15.1, salvo o direito de **uso dos serviços contratados** pelo prazo de vigência do PLANO.

---

## Cláusula 16 — Alteração dos TERMOS

**16.1.** A Dr. Cleitinho **reserva-se o direito de modificar estes TERMOS** a qualquer momento, com **aviso prévio mínimo de 30 (trinta) dias** da entrada em vigor das alterações, comunicado a VOCÊ por e-mail.

**16.2.** A continuidade no uso dos benefícios do PLANO, ou a adição/remoção de PETs após a entrada em vigor das alterações, significa que VOCÊ **aceitou os novos TERMOS**.

**16.3.** VOCÊ pode **rejeitar os novos TERMOS** exercendo o cancelamento (Cláusula 9) **antes** da entrada em vigor das alterações, sem qualquer ônus.

**16.4.** Cada edição destes TERMOS é identificada por uma **VERSÃO DO CONTRATO** no sistema, com snapshot preservado para auditoria.

---

## Cláusula 17 — Disposições gerais

**17.1. Comunicações.** A Dr. Cleitinho enviará a VOCÊ comunicações por **e-mail (Resend), SMS (Twilio) e WhatsApp**. VOCÊ é responsável por manter os dados de contato (e-mail e celular) atualizados. Comunicações relevantes para a vigência do CONTRATO (alteração de TERMOS, falha de pagamento, suspensão, cancelamento) são enviadas com confirmação de envio.

**17.2. Tolerância.** A **tolerância** da Dr. Cleitinho quanto a eventual descumprimento isolado por VOCÊ não implica **novação** ou renúncia ao direito de exigir o cumprimento dos TERMOS em outras ocasiões.

**17.3. Nulidade parcial.** A **nulidade ou inexequibilidade de qualquer cláusula** destes TERMOS não invalida as demais, que permanecem em pleno vigor.

**17.4. Normas do CRMV-SC.** Os serviços veterinários prestados pela Dr. Cleitinho observam as **Resoluções do Conselho Regional de Medicina Veterinária de Santa Catarina (CRMV-SC)** aplicáveis, em especial as normas relativas ao exercício profissional do médico veterinário e ao atendimento de animais de companhia.

**17.5. Independência de profissionais.** Os médicos veterinários da CLÍNICA atuam com **autonomia técnica** assegurada pelas normas do CRMV-SC.

**17.6. Lei aplicável.** Este CONTRATO é regido pelas **leis da República Federativa do Brasil** — em especial, o Código Civil, o Código de Defesa do Consumidor e a Lei Geral de Proteção de Dados.

---

## Cláusula 18 — Foro

**18.1.** Para dirimir quaisquer dúvidas ou litígios oriundos deste CONTRATO, as partes elegem o foro da comarca de **Camboriú/SC**, com renúncia expressa a qualquer outro, por mais privilegiado que seja.

---

## Celebração eletrônica

Este CONTRATO é celebrado **eletronicamente**, **mediante o aceite de VOCÊ** no fluxo de contratação da Dr. Cleitinho, com manifestação de vontade plenamente válida nos termos do **§ 2º do art. 10 da Medida Provisória nº 2.200-2/2001** e do **art. 4º, II da Lei nº 14.063/2020**.

A Dr. Cleitinho mantém, em registro auditável, as evidências enumeradas na Cláusula 5.3 deste documento, à disposição de VOCÊ e das autoridades competentes pelos prazos previstos na Cláusula 14.
`;
