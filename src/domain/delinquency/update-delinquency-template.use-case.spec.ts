/**
 * Unit tests for updateDelinquencyTemplateUseCase.
 *
 * Mocks global fetch to test the use-case in isolation. No personal data is
 * included in fixtures — templates only contain placeholder tokens.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { updateDelinquencyTemplateUseCase } from './update-delinquency-template.use-case';
import { ApiError } from '@/lib/api-errors';
import type { DelinquencyTemplateDto } from '@/lib/types/delinquency';

function makeFetchResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

const mockTemplate: DelinquencyTemplateDto = {
  stageDays: 1,
  title: 'Lembrete de pagamento',
  body: 'Olá [nome do tutor], atualize o pagamento em [LINK].',
  updatedById: 'user-uuid-0001',
  updatedAt: '2026-08-07T12:00:00.000Z',
};

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('updateDelinquencyTemplateUseCase — success', () => {
  it('should return the updated template when API returns 200', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(mockTemplate, 200));

    const result = await updateDelinquencyTemplateUseCase(1, {
      title: mockTemplate.title,
      body: mockTemplate.body,
    });

    expect(result).toEqual(mockTemplate);
  });

  it('should call the correct route handler URL with PUT', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(mockTemplate, 200));

    await updateDelinquencyTemplateUseCase(1, {
      title: mockTemplate.title,
      body: mockTemplate.body,
    });

    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toBe('/api/admin/delinquency/templates/1');
    expect((init as RequestInit).method).toBe('PUT');
  });

  it('should send title and body as JSON payload', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse(mockTemplate, 200));

    await updateDelinquencyTemplateUseCase(1, {
      title: mockTemplate.title,
      body: mockTemplate.body,
    });

    const [, init] = mockFetch.mock.calls[0];
    const parsedBody = JSON.parse((init as RequestInit).body as string);
    expect(parsedBody).toEqual({
      title: mockTemplate.title,
      body: mockTemplate.body,
    });
  });
});

describe('updateDelinquencyTemplateUseCase — error handling', () => {
  it('should throw ApiError with code TEMPLATE_MISSING_LINK_PLACEHOLDER on 422', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse(
        {
          code: 'TEMPLATE_MISSING_LINK_PLACEHOLDER',
          message: 'O corpo da mensagem deve conter o placeholder [LINK].',
        },
        422,
      ),
    );

    try {
      await updateDelinquencyTemplateUseCase(1, {
        title: 'Sem link',
        body: 'Corpo sem o placeholder.',
      });
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const typed = err as ApiError;
      expect(typed.status).toBe(422);
      expect(typed.code).toBe('TEMPLATE_MISSING_LINK_PLACEHOLDER');
    }
  });

  it('should throw ApiError on 404 for unknown stageDays', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'TEMPLATE_NOT_FOUND', message: 'Not found.' }, 404),
    );

    await expect(
      updateDelinquencyTemplateUseCase(3, { title: 'x', body: '[LINK]' }),
    ).rejects.toThrow(ApiError);
  });

  it('should throw ApiError on 401', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      makeFetchResponse({ code: 'UNAUTHENTICATED', message: 'Sessão expirada.' }, 401),
    );

    await expect(
      updateDelinquencyTemplateUseCase(1, { title: 'x', body: '[LINK]' }),
    ).rejects.toThrow(ApiError);
  });

  it('should fall back to UNKNOWN_ERROR code when the body is empty', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(makeFetchResponse({}, 500));

    try {
      await updateDelinquencyTemplateUseCase(1, { title: 'x', body: '[LINK]' });
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).code).toBe('UNKNOWN_ERROR');
    }
  });

  it('should propagate network errors', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(
      updateDelinquencyTemplateUseCase(1, { title: 'x', body: '[LINK]' }),
    ).rejects.toThrow();
  });
});
