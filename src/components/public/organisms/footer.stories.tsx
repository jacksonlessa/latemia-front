/**
 * Storybook stories for Footer organism.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { ConsentProvider } from '@/components/public/consent/consent-provider';
import { Footer } from './footer';

const meta = {
  title: 'public/organisms/Footer',
  component: Footer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = {
  render?: () => React.ReactElement;
  name?: string;
};

export const Default: Story = {
  name: 'Default',
  render: () => (
    <ConsentProvider>
      <Footer />
    </ConsentProvider>
  ),
};
