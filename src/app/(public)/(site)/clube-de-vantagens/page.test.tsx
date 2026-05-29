import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import ClubeDeVantagensPage from './page';
import { getPublicConfigSSR } from '@/domain/public-config/get-public-config.server';
import { FALLBACK_PRICE_PER_PET_CENTS } from '@/domain/public-config/get-public-config.use-case';

vi.mock('@/domain/public-config/get-public-config.server', () => ({
  getPublicConfigSSR: vi.fn(),
}));

const mockGetPublicConfigSSR = vi.mocked(getPublicConfigSSR);

describe('ClubeDeVantagensPage', () => {
  beforeEach(() => {
    mockGetPublicConfigSSR.mockResolvedValue({
      otpContractEnabled: false,
      pricePerPetCents: FALLBACK_PRICE_PER_PET_CENTS,
    });
  });

  it('should render main element without throwing', async () => {
    const page = await ClubeDeVantagensPage();
    render(page);
    expect(document.querySelector('main')).toBeInTheDocument();
  });
});
