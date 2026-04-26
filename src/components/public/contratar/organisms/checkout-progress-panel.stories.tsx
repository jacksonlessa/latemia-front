import type React from 'react';
import { CheckoutProgressPanel } from './checkout-progress-panel';
import type { CheckoutProgressPanelProps } from './checkout-progress-panel';

const meta = {
  title: 'public/contratar/organisms/CheckoutProgressPanel',
  component: CheckoutProgressPanel,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = {
  render?: (args: CheckoutProgressPanelProps) => React.ReactElement;
  args?: Partial<CheckoutProgressPanelProps>;
  name?: string;
};

const baseArgs: CheckoutProgressPanelProps = {
  currentStage: 1,
  asOverlay: false,
};

export const Stage1: Story = {
  name: 'Etapa 1 — validando dados do cartão',
  args: { ...baseArgs, currentStage: 1 },
};

export const Stage2: Story = {
  name: 'Etapa 2 — tokenizando',
  args: { ...baseArgs, currentStage: 2 },
};

export const Stage6OnePet: Story = {
  name: 'Etapa 6 — 1 pet',
  args: {
    ...baseArgs,
    currentStage: 6,
    petStages: [{ name: 'Rex', state: 'in_progress' }],
  },
};

export const Stage6ThreePetsMix: Story = {
  name: 'Etapa 6 — 3 pets (mix de estados)',
  args: {
    ...baseArgs,
    currentStage: 6,
    petStages: [
      { name: 'Rex', state: 'done' },
      { name: 'Mel', state: 'in_progress' },
      { name: 'Thor', state: 'pending' },
    ],
  },
};

export const Stage8Success: Story = {
  name: 'Sucesso completo (etapa 8)',
  args: { ...baseArgs, currentStage: 8 },
};

const errorArgs = (
  stage: number,
  message: string,
  petStages?: CheckoutProgressPanelProps['petStages'],
): CheckoutProgressPanelProps => ({
  ...baseArgs,
  currentStage: stage,
  errorStage: stage,
  errorMessage: message,
  onRetry: () => console.log('retry'),
  petStages,
});

export const ErrorStage1: Story = {
  name: 'Erro — etapa 1',
  args: errorArgs(1, 'Dados do cartão inválidos. Confira número e validade.'),
};

export const ErrorStage2: Story = {
  name: 'Erro — etapa 2',
  args: errorArgs(2, 'Não foi possível tokenizar o cartão. Tente novamente.'),
};

export const ErrorStage3: Story = {
  name: 'Erro — etapa 3',
  args: errorArgs(3, 'Falha ao salvar os dados de cadastro.'),
};

export const ErrorStage4: Story = {
  name: 'Erro — etapa 4',
  args: errorArgs(4, 'Falha ao cadastrar pets.'),
};

export const ErrorStage5: Story = {
  name: 'Erro — etapa 5',
  args: errorArgs(5, 'Provedor de pagamento indisponível. Tente novamente.'),
};

export const ErrorStage6: Story = {
  name: 'Erro — etapa 6 (3 pets)',
  args: errorArgs(6, 'Seu cartão foi recusado. Verifique os dados ou tente outro cartão.', [
    { name: 'Rex', state: 'done' },
    {
      name: 'Mel',
      state: 'error',
      errorMessage: 'Cartão recusado.',
    },
    { name: 'Thor', state: 'pending' },
  ]),
};

export const ErrorStage7: Story = {
  name: 'Erro — etapa 7',
  args: errorArgs(7, 'Não foi possível finalizar a contratação.'),
};

export const ErrorStage8: Story = {
  name: 'Erro — etapa 8',
  args: errorArgs(8, 'Falha ao redirecionar.'),
};

export const Overlay: Story = {
  name: 'Overlay (modal)',
  args: {
    currentStage: 5,
    asOverlay: true,
  },
};
