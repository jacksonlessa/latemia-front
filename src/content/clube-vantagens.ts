// Centralised content for /clube-de-vantagens — pure data, no React.

export interface ClubeBenefit {
  procedure: string;
  discount: number;
}

export interface ClubeContent {
  hero: {
    headline: string;
    subtext: string;
  };
  benefits: ClubeBenefit[];
  scenarios: string[];
  legalNote: string;
  officialBenefitsLink: '/beneficios';
}

export const clubeContent: ClubeContent = {
  hero: {
    headline: 'Benefícios para cuidar do seu pet desde o primeiro mês.',
    subtext:
      'O Clube de Vantagens começa após a confirmação do primeiro pagamento.',
  },
  benefits: [
    { procedure: 'Consultas eletivas', discount: 30 },
    { procedure: 'Consultas com especialistas', discount: 10 },
    { procedure: 'Exames de sangue laboratoriais', discount: 10 },
    { procedure: 'Cirurgias eletivas', discount: 10 },
    { procedure: 'Procedimentos', discount: 10 },
    { procedure: 'Banho e Tosa', discount: 10 },
    { procedure: 'Vacinas', discount: 10 },
    { procedure: 'Exames de imagem (Raio-X e Ultrassom)', discount: 5 },
    { procedure: 'Microchipagem', discount: 30 },
  ],
  scenarios: [
    'Check-up anual',
    'Investigação de sintomas leves',
    'Acompanhamento com especialista',
    'Exames solicitados em consulta',
    'Identificação por microchip',
  ],
  legalNote:
    'Descontos aplicados exclusivamente em serviços prestados pela clínica veterinária Late&Mia. Não cumulativos com outras promoções.',
  officialBenefitsLink: '/beneficios',
} as const;
