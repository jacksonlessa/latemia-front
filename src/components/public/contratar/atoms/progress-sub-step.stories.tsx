import type React from 'react';
import { ProgressSubStep } from './progress-sub-step';
import type { ProgressSubStepProps } from './progress-sub-step';

const meta = {
  title: 'public/contratar/atoms/ProgressSubStep',
  component: ProgressSubStep,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

type Story = {
  render?: (args: ProgressSubStepProps) => React.ReactElement;
  args?: Partial<ProgressSubStepProps>;
  name?: string;
};

const renderSub = (args: ProgressSubStepProps) => (
  <ul className="space-y-1.5 max-w-md pl-6">
    <ProgressSubStep {...args} />
  </ul>
);

export const SinglePetPending: Story = {
  name: 'Pet único — pendente',
  render: renderSub,
  args: { state: 'pending', label: 'Configurando assinatura para Rex' },
};

export const SinglePetInProgress: Story = {
  name: 'Pet único — em andamento',
  render: renderSub,
  args: { state: 'in_progress', label: 'Configurando assinatura para Rex' },
};

export const SinglePetDone: Story = {
  name: 'Pet único — concluído',
  render: renderSub,
  args: { state: 'done', label: 'Configurando assinatura para Rex' },
};

export const SinglePetError: Story = {
  name: 'Pet único — erro',
  render: renderSub,
  args: {
    state: 'error',
    label: 'Configurando assinatura para Rex',
    errorMessage: 'Cartão recusado.',
  },
};

export const ThreePetsMix: Story = {
  name: 'Três pets — mix de estados',
  render: () => (
    <ul className="space-y-1.5 max-w-md pl-6">
      <ProgressSubStep state="done" label="Configurando assinatura para Rex" />
      <ProgressSubStep state="in_progress" label="Configurando assinatura para Mel" />
      <ProgressSubStep state="pending" label="Configurando assinatura para Thor" />
    </ul>
  ),
};
