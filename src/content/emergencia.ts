// Centralised content for /emergencia — pure data, no React.

export interface EmergenciaContent {
  hero: {
    headline: string;
    discount: number;
    carenceDays: number;
  };
  warnings: string[];
}

export const emergenciaContent: EmergenciaContent = {
  hero: {
    headline: 'Proteção financeira quando seu pet mais precisa.',
    discount: 50,
    carenceDays: 180,
  },
  warnings: [
    'Válido somente após 180 dias de carência a contar da confirmação do primeiro pagamento.',
    'Atendimento exclusivamente na Clínica Veterinária Late&Mia, em Camboriú/SC.',
    'Não é um seguro. Não é plano de saúde pet. Não cobre atendimento em outras clínicas.',
  ],
} as const;
