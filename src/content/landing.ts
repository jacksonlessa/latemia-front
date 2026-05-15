// Centralised content for the public landing page.
// No React imports, no formatting logic — pure data and types.

export type LucideIconName =
  | 'ShieldCheck'
  | 'Clock'
  | 'BadgeDollarSign'
  | 'HeartPulse'
  | 'Stethoscope'
  | 'Zap'
  | 'Smile';

export interface BenefitItem {
  title: string;
  description: string;
  icon: LucideIconName;
}

export interface Testimonial {
  petName: string;
  tutorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface WhatsAppConfig {
  number: '5547997077953';
  defaultMessage: string;
}

export interface LandingContent {
  hero: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: '/contratar';
  };
  benefits: {
    heading: string;
    items: BenefitItem[];
  };
  coverage: {
    heading: string;
    items: string[];
  };
  exclusions: {
    heading: string;
    items: string[];
  };
  gracePeriod: {
    heading: string;
    body: string;
    months: 6;
  };
  pricing: {
    heading: string;
    priceCents: 2500;
    unitLabel: string;
    footnote: string;
  };
  testimonials: {
    heading: string;
    items: Testimonial[];
  };
  faq: {
    heading: string;
    items: FaqEntry[];
  };
  contact: {
    heading: string;
    address: string;
    phone: string;
    email: string;
    mapsUrl?: string;
    whatsapp: WhatsAppConfig;
  };
}

export const landingContent: LandingContent = {
  hero: {
    title: 'Plano de Emergência Veterinária para o seu pet',
    subtitle:
      'Garanta 50% de desconto nos atendimentos de emergência 24h para o seu companheiro, sem surpresas no final do mês.',
    ctaLabel: 'Contratar plano',
    ctaHref: '/contratar',
  },

  benefits: {
    heading: 'Por que contratar o Plano Emergência Dr. Cleitinho?',
    items: [
      {
        title: '50% de desconto em emergências',
        description:
          'Metade do valor dos atendimentos emergenciais fica por nossa conta. Você paga menos quando mais precisa.',
        icon: 'BadgeDollarSign',
      },
      {
        title: 'Mensalidade fixa e transparente',
        description:
          'Um único valor por pet, todo mês. Sem letras miúdas, sem franquias ocultas.',
        icon: 'ShieldCheck',
      },
      {
        title: 'Simplicidade acima de tudo',
        description:
          'Um plano único e claro. Sem categorias, sem níveis de cobertura para confundir.',
        icon: 'Smile',
      },
    ],
  },

  coverage: {
    heading: 'O que o plano cobre',
    items: [
      'Intoxicações e envenenamentos',
      'Convulsões',
      'Dificuldade respiratória aguda',
      'Hemorragias',
      'Choque (hipovolêmico, séptico ou anafilático)',
      'Dor aguda intensa',
      'Traumas graves (atropelamentos, quedas de altura, mordidas)',
    ],
  },

  exclusions: {
    heading: 'O que NÃO está coberto',
    items: [
      'Vacinas e vermifugação',
      'Consultas de rotina e check-ups',
      'Procedimentos estéticos (banho, tosa, micropigmentação)',
      'Castração e outros procedimentos eletivos',
      'Exames preventivos sem indicação de emergência',
      'Internações programadas',
    ],
  },

  gracePeriod: {
    heading: 'Carência de 6 meses',
    body: 'O plano entra em vigor 6 meses após o primeiro pagamento. Esse período existe para garantir o equilíbrio financeiro do plano e permitir que continuemos oferecendo o benefício a todos os tutores. Contratar quanto antes significa estar coberto mais cedo.',
    months: 6,
  },

  pricing: {
    heading: 'Preço justo, sem surpresas',
    priceCents: 2500,
    unitLabel: 'por pet / mês',
    footnote:
      'O valor total será calculado pelo número de pets cadastrados no momento da contratação.',
  },

  testimonials: {
    heading: 'O que os tutores dizem',
    items: [
      {
        petName: 'Mel',
        tutorName: 'Ana Paula S.',
        rating: 5,
        quote: 'A Mel foi atendida de emergência às 2h da manhã. Graças ao plano, paguei metade e o atendimento foi impecável. Recomendo para todo tutor responsável!',
      },
      {
        petName: 'Thor',
        tutorName: 'Carlos M.',
        rating: 5,
        quote: 'Meu cachorro engoliu algo que não devia e precisou de atendimento urgente. O plano cobriu 50% e o processo foi simples, sem burocracia nenhuma.',
      },
      {
        petName: 'Luna',
        tutorName: 'Fernanda R.',
        rating: 4,
        quote: 'Ótimo custo-benefício. Mensalidade acessível e quando precisei o desconto foi aplicado na hora. Plano simples e honesto como prometido.',
      },
    ],
  },

  faq: {
    heading: 'Perguntas frequentes',
    items: [
      {
        question: 'Como funciona a carência de 6 meses?',
        answer:
          'Após o primeiro pagamento confirmado, o plano fica em período de carência por 6 meses. Durante esse período o contrato está ativo, mas o desconto emergencial ainda não pode ser utilizado. A partir do 7.º mês, o benefício está disponível integralmente.',
      },
      {
        question: 'O que é considerado uma emergência veterinária?',
        answer:
          'Emergência é qualquer situação que coloca a vida do animal em risco imediato ou que cause sofrimento intenso e agudo — como traumas, convulsões, intoxicações, hemorragias e dificuldade respiratória. Consultas de rotina ou procedimentos eletivos não se enquadram como emergência.',
      },
      {
        question: 'Como o pagamento é feito?',
        answer:
          'O plano é cobrado mensalmente via cartão de crédito ou boleto bancário. O valor é fixo por pet contratado e não sofre reajustes surpresa ao longo do período anual.',
      },
      {
        question: 'Como utilizo o benefício quando precisar?',
        answer:
          'Leve seu pet diretamente à clínica Dr. Cleitinho informando que é assinante do plano. A equipe verificará o cadastro e aplicará o desconto de 50% automaticamente na hora do atendimento. Não é necessário reembolso posterior.',
      },
      {
        question: 'Posso contratar para mais de um pet?',
        answer:
          'Sim! O plano é por pet, então você pode incluir todos os seus companheiros. O valor mensal total é calculado multiplicando {{pricePerPet}} pelo número de pets cadastrados no contrato.',
      },
      {
        question: 'Posso cancelar o plano a qualquer momento?',
        answer:
          'Sim, o cancelamento pode ser solicitado a qualquer momento. O plano permanece ativo até o fim do período já pago. Entre em contato pelo WhatsApp para iniciar o processo de cancelamento.',
      },
      {
        question: 'O plano cobre qualquer raça ou porte de animal?',
        answer:
          'O plano cobre cães e gatos de qualquer raça e porte. As condições e o valor da mensalidade são os mesmos independentemente do animal.',
      },
    ],
  },

  contact: {
    heading: 'Fale com a gente',
    address: 'Rua Osvaldo Minella, 56 - Lídia Duarte, Camboriú - SC, 88340-000',
    phone: '(47) 99707-7953',
    email: '',
    mapsUrl: 'https://www.google.com/maps/place/Late+%26+Mia+Cl%C3%ADnica+Veterin%C3%A1ria/@-27.0337695,-48.6487444,19z/data=!4m6!3m5!1s0x94d8b76bc7fc191f:0x6b944b2d0758290b!8m2!3d-27.0337695!4d-48.6477971!16s%2Fg%2F11thc3nrm1?entry=ttu&g_ep=EgoyMDI2MDQxNS4wIKXMDSoASAFQAw%3D%3D',
    whatsapp: {
      number: '5547997077953',
      defaultMessage:
        'Olá! Tenho interesse no Plano Emergência do Dr. Cleitinho e gostaria de mais informações.',
    },
  },
} as const;
