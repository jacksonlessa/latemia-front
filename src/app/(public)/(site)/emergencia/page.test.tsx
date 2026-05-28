import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import EmergenciaPage from './page';

describe('EmergenciaPage', () => {
  it('should render main element without throwing', () => {
    const page = EmergenciaPage();
    render(page);
    expect(document.querySelector('main')).toBeInTheDocument();
  });
});
