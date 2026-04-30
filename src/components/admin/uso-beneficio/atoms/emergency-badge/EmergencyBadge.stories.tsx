/**
 * Storybook stories for EmergencyBadge atom.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow CSF (Component Story Format) and will be picked up
 * automatically once Storybook is installed.
 */

import type React from 'react';
import { EmergencyBadge } from './EmergencyBadge';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Admin - Uso do Benefício/Atoms/EmergencyBadge',
  component: EmergencyBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story type helper (minimal — no @storybook/react dependency)
// ---------------------------------------------------------------------------

interface EmergencyBadgeProps {
  isEmergency: boolean;
  className?: string;
}

type Story = {
  render?: (args: EmergencyBadgeProps) => React.ReactElement;
  args?: Partial<EmergencyBadgeProps>;
  name?: string;
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Pílula vermelha para atendimento emergencial */
export const Emergency: Story = {
  name: 'Emergência',
  args: { isEmergency: true },
};

/** Pílula cinza para atendimento eletivo */
export const Elective: Story = {
  name: 'Eletivo',
  args: { isEmergency: false },
};

/** Ambas as variantes lado a lado */
export const Both: Story = {
  name: 'Ambas as variantes',
  render: () => (
    <div className="flex gap-2">
      <EmergencyBadge isEmergency />
      <EmergencyBadge isEmergency={false} />
    </div>
  ),
};
