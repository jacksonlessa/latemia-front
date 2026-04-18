/**
 * Storybook stories for PetSpeciesBadge atom.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { PetSpeciesBadge } from './pet-species-badge';
import type { PetSpecies } from '@/lib/types/pet';

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Admin - Clientes/Atoms/PetSpeciesBadge',
  component: PetSpeciesBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story type helper (minimal — no @storybook/react dependency)
// ---------------------------------------------------------------------------

interface PetSpeciesBadgeProps {
  species: PetSpecies;
  className?: string;
}

type Story = {
  render?: (args: PetSpeciesBadgeProps) => React.ReactElement;
  args?: Partial<PetSpeciesBadgeProps>;
  name?: string;
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Badge para espécie canino */
export const Canino: Story = {
  name: 'Canino',
  args: {
    species: 'canino',
  },
};

/** Badge para espécie felino */
export const Felino: Story = {
  name: 'Felino',
  args: {
    species: 'felino',
  },
};
