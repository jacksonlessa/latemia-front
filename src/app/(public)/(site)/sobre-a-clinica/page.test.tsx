import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SobreAClinicaPage from './page';

describe('SobreAClinicaPage', () => {
  it('should render main element without throwing', () => {
    const page = SobreAClinicaPage();
    render(page);
    expect(document.querySelector('main')).toBeInTheDocument();
  });
});
