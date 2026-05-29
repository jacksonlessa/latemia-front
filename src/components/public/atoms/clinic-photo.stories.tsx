import type React from 'react';
import { ClinicPhoto, type ClinicPhotoProps } from './clinic-photo';

const meta = {
  title: 'public/atoms/ClinicPhoto',
  component: ClinicPhoto,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;

type Story = {
  render?: (args: ClinicPhotoProps) => React.ReactElement;
  args?: Partial<ClinicPhotoProps>;
  name?: string;
};

export const Default: Story = {
  name: 'Default',
  args: {
    className: 'min-h-[220px] w-full max-w-[480px] rounded-[18px] sm:min-h-[280px]',
    sizes: '(max-width: 640px) 100vw, 480px',
  },
};

export const SquareCrop: Story = {
  name: 'SquareCrop',
  args: {
    className: 'aspect-square w-full max-w-sm rounded-lg',
    sizes: '(max-width: 1024px) 100vw, 384px',
  },
};
