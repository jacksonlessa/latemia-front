/**
 * Storybook stories for CopyableId molecule.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention.
 */

import type React from 'react';
import { CopyableId } from './CopyableId';

const meta = {
  title: 'Admin - Planos/Molecules/CopyableId',
  component: CopyableId,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

interface CopyableIdProps {
  value: string;
  label?: string;
  className?: string;
}

type Story = {
  render?: (args: CopyableIdProps) => React.ReactElement;
  args?: Partial<CopyableIdProps>;
  name?: string;
};

export const Default: Story = {
  name: 'Padrão',
  args: { value: 'sub_abc123def456ghi789', label: 'ID da assinatura' },
};

export const ShortValue: Story = {
  name: 'Valor curto',
  args: { value: 'cus_1234', label: 'ID do cliente' },
};
