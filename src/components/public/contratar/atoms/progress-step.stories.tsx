import type React from 'react';
import { ProgressStep } from './progress-step';
import type { ProgressStepProps } from './progress-step';

const meta = {
  title: 'public/contratar/atoms/ProgressStep',
  component: ProgressStep,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

type Story = {
  render?: (args: ProgressStepProps) => React.ReactElement;
  args?: Partial<ProgressStepProps>;
  name?: string;
};

const renderStep = (args: ProgressStepProps) => (
  <ul className="space-y-2 max-w-md">
    <ProgressStep {...args} />
  </ul>
);

export const Pending: Story = {
  name: 'Pendente',
  render: renderStep,
  args: { state: 'pending', label: 'Validando dados do cartão...' },
};

export const InProgress: Story = {
  name: 'Em andamento',
  render: renderStep,
  args: { state: 'in_progress', label: 'Tokenizando seu cartão com segurança...' },
};

export const Done: Story = {
  name: 'Concluído',
  render: renderStep,
  args: { state: 'done', label: 'Salvando seus dados de cadastro...' },
};

export const ErrorState: Story = {
  name: 'Erro',
  render: renderStep,
  args: {
    state: 'error',
    label: 'Conectando ao provedor de pagamento...',
    errorMessage: 'Provedor de pagamento indisponível. Tente novamente.',
  },
};

export const WithSubSteps: Story = {
  name: 'Com sub-itens (3 pets)',
  render: renderStep,
  args: {
    state: 'in_progress',
    label: 'Configurando assinatura para os pets...',
    subSteps: [
      { id: 'rex', label: 'Configurando assinatura para Rex', state: 'done' },
      { id: 'mel', label: 'Configurando assinatura para Mel', state: 'in_progress' },
      { id: 'thor', label: 'Configurando assinatura para Thor', state: 'pending' },
    ],
  },
};
