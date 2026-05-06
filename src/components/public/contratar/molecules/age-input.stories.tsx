/**
 * Storybook stories for AgeInput molecule.
 *
 * NOTE: Storybook is not yet configured in this project.
 * These stories follow the CSF (Component Story Format) convention and will
 * be picked up automatically once Storybook is installed.
 */

import type React from 'react';
import { AgeInput } from './age-input';
import type { AgeInputProps } from './age-input';

const meta = {
  title: 'public/contratar/molecules/AgeInput',
  component: AgeInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = {
  render?: (args: AgeInputProps) => React.ReactElement;
  args?: Partial<AgeInputProps>;
  name?: string;
};

const baseArgs: AgeInputProps = {
  value: undefined,
  onChange: () => {},
};

function dateYearsAgo(years: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d;
}

function dateMonthsAgo(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
}

/** Modo aproximado, sem valor preenchido. */
export const ApproximateEmpty: Story = {
  name: 'Aproximada — vazia',
  args: { ...baseArgs },
};

/** Modo aproximado, idade em anos. */
export const ApproximateYears: Story = {
  name: 'Aproximada — anos',
  args: { ...baseArgs, value: dateYearsAgo(3) },
};

/** Modo aproximado, idade em meses. */
export const ApproximateMonths: Story = {
  name: 'Aproximada — meses',
  args: { ...baseArgs, value: dateMonthsAgo(8) },
};

/** Modo exato, sem data preenchida. */
export const ExactEmpty: Story = {
  name: 'Exata — vazia',
  args: { ...baseArgs },
};

/** Modo exato, com data preenchida. */
export const ExactFilled: Story = {
  name: 'Exata — preenchida',
  args: { ...baseArgs, value: dateYearsAgo(2) },
};

/** Com erro de validação. */
export const WithError: Story = {
  name: 'Com erro',
  args: {
    ...baseArgs,
    error: 'A idade do pet é obrigatória.',
  },
};
