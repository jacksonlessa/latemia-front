/**
 * Storybook stories for MoneyInput atom.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow CSF and will be picked up once Storybook is installed.
 */

import type React from 'react';
import { useState } from 'react';
import { MoneyInput } from './MoneyInput';

const meta = {
  title: 'Admin - Planos de Assinatura/Atoms/MoneyInput',
  component: MoneyInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

type Story = {
  render?: () => React.ReactElement;
  args?: Record<string, unknown>;
  name?: string;
};

/** Estado padrão com valor inicial */
export const Default: Story = {
  name: 'Default',
  render: () => {
    const [value, setValue] = useState(9990);
    return (
      <MoneyInput
        id="story-default"
        label="Preço"
        value={value}
        onChange={setValue}
      />
    );
  },
};

/** Valor zerado — placeholder visível */
export const Empty: Story = {
  name: 'Vazio',
  render: () => {
    const [value, setValue] = useState(0);
    return (
      <MoneyInput
        id="story-empty"
        label="Preço mínimo"
        value={value}
        onChange={setValue}
        placeholder="0,00"
      />
    );
  },
};

/** Valor grande — separador de milhar */
export const LargeValue: Story = {
  name: 'Valor com milhares',
  render: () => {
    const [value, setValue] = useState(145000);
    return (
      <MoneyInput
        id="story-large"
        label="Valor total"
        value={value}
        onChange={setValue}
      />
    );
  },
};

/** Estado desabilitado */
export const Disabled: Story = {
  name: 'Desabilitado',
  render: () => (
    <MoneyInput
      id="story-disabled"
      label="Preço"
      value={4990}
      onChange={() => undefined}
      disabled
    />
  ),
};

/** Sem label */
export const WithoutLabel: Story = {
  name: 'Sem Label',
  render: () => {
    const [value, setValue] = useState(0);
    return <MoneyInput id="story-no-label" value={value} onChange={setValue} />;
  },
};
