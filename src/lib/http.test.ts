/**
 * Unit tests for the httpFetch wrapper.
 *
 * `fetch` is mocked via vi.stubGlobal. The observability helpers are mocked
 * at module boundaries so we can assert on header injection and error
 * reporting without side-effects.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { httpFetch } from './http';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock('@/lib/observability/request-id', () => ({
  getOrCreateAttemptId: vi.fn(() => 'test-attempt-uuid'),
}));

vi.mock('@/lib/observability/idempotency-key', () => ({
  createIdempotencyKey: vi.fn(() => 'test-idempotency-uuid'),
}));

const reportClientErrorMock = vi.fn().mockResolvedValue(undefined);
vi.mock('@/lib/observability/client-error-reporter', () => ({
  reportClientError: (...args: unknown[]) => reportClientErrorMock(...args),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeResponse(status: number): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: new Headers(),
  } as unknown as Response;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('httpFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('X-Request-Id injection', () => {
    it('should inject X-Request-Id when header is not present', async () => {
      const fetchSpy = vi.fn().mockResolvedValue(makeResponse(200));
      vi.stubGlobal('fetch', fetchSpy);

      await httpFetch('/v1/health');

      const [, options] = fetchSpy.mock.calls[0] as [string, { headers: Headers }];
      expect(options.headers.get('X-Request-Id')).toBe('test-attempt-uuid');
    });

    it('should not overwrite an existing X-Request-Id header', async () => {
      const fetchSpy = vi.fn().mockResolvedValue(makeResponse(200));
      vi.stubGlobal('fetch', fetchSpy);

      await httpFetch('/v1/health', {
        headers: { 'X-Request-Id': 'caller-supplied-id' },
      });

      const [, options] = fetchSpy.mock.calls[0] as [string, { headers: Headers }];
      expect(options.headers.get('X-Request-Id')).toBe('caller-supplied-id');
    });
  });

  describe('Idempotency-Key injection', () => {
    it('should inject Idempotency-Key when idempotent is true', async () => {
      const fetchSpy = vi.fn().mockResolvedValue(makeResponse(200));
      vi.stubGlobal('fetch', fetchSpy);

      await httpFetch('/v1/checkout/customer', {
        method: 'POST',
        idempotent: true,
      });

      const [, options] = fetchSpy.mock.calls[0] as [string, { headers: Headers }];
      expect(options.headers.get('Idempotency-Key')).toBe('test-idempotency-uuid');
    });

    it('should use provided idempotencyKey when idempotent is true', async () => {
      const fetchSpy = vi.fn().mockResolvedValue(makeResponse(200));
      vi.stubGlobal('fetch', fetchSpy);

      await httpFetch('/v1/checkout/customer', {
        method: 'POST',
        idempotent: true,
        idempotencyKey: 'my-custom-key',
      });

      const [, options] = fetchSpy.mock.calls[0] as [string, { headers: Headers }];
      expect(options.headers.get('Idempotency-Key')).toBe('my-custom-key');
    });

    it('should not inject Idempotency-Key when idempotent is false', async () => {
      const fetchSpy = vi.fn().mockResolvedValue(makeResponse(200));
      vi.stubGlobal('fetch', fetchSpy);

      await httpFetch('/v1/checkout/customer', {
        method: 'POST',
        idempotent: false,
      });

      const [, options] = fetchSpy.mock.calls[0] as [string, { headers: Headers }];
      expect(options.headers.get('Idempotency-Key')).toBeNull();
    });

    it('should not inject Idempotency-Key when idempotent flag is absent', async () => {
      const fetchSpy = vi.fn().mockResolvedValue(makeResponse(200));
      vi.stubGlobal('fetch', fetchSpy);

      await httpFetch('/v1/health');

      const [, options] = fetchSpy.mock.calls[0] as [string, { headers: Headers }];
      expect(options.headers.get('Idempotency-Key')).toBeNull();
    });
  });

  describe('reportClientError on 5xx', () => {
    it('should call reportClientError on HTTP 500', async () => {
      const fetchSpy = vi.fn().mockResolvedValue(makeResponse(500));
      vi.stubGlobal('fetch', fetchSpy);

      await httpFetch('/v1/checkout/customer', { method: 'POST' });

      expect(reportClientErrorMock).toHaveBeenCalledOnce();
      expect(reportClientErrorMock).toHaveBeenCalledWith(
        expect.objectContaining({ stage: 'http_5xx', message: 'HTTP 500' }),
      );
    });

    it('should call reportClientError on HTTP 503', async () => {
      const fetchSpy = vi.fn().mockResolvedValue(makeResponse(503));
      vi.stubGlobal('fetch', fetchSpy);

      await httpFetch('/v1/checkout/customer');

      expect(reportClientErrorMock).toHaveBeenCalledOnce();
      expect(reportClientErrorMock).toHaveBeenCalledWith(
        expect.objectContaining({ stage: 'http_5xx', message: 'HTTP 503' }),
      );
    });

    it('should not call reportClientError on HTTP 200', async () => {
      const fetchSpy = vi.fn().mockResolvedValue(makeResponse(200));
      vi.stubGlobal('fetch', fetchSpy);

      await httpFetch('/v1/health');

      expect(reportClientErrorMock).not.toHaveBeenCalled();
    });

    it('should not call reportClientError on HTTP 400', async () => {
      const fetchSpy = vi.fn().mockResolvedValue(makeResponse(400));
      vi.stubGlobal('fetch', fetchSpy);

      await httpFetch('/v1/checkout/customer');

      expect(reportClientErrorMock).not.toHaveBeenCalled();
    });

    it('should suppress reportClientError when reportClientErrorOn5xx is false', async () => {
      const fetchSpy = vi.fn().mockResolvedValue(makeResponse(500));
      vi.stubGlobal('fetch', fetchSpy);

      await httpFetch('/v1/checkout/customer', { reportClientErrorOn5xx: false });

      expect(reportClientErrorMock).not.toHaveBeenCalled();
    });
  });

  describe('reportClientError on network failure', () => {
    it('should call reportClientError and rethrow on network error', async () => {
      const networkError = new Error('Failed to fetch');
      const fetchSpy = vi.fn().mockRejectedValue(networkError);
      vi.stubGlobal('fetch', fetchSpy);

      await expect(httpFetch('/v1/checkout/customer')).rejects.toThrow(
        'Failed to fetch',
      );

      expect(reportClientErrorMock).toHaveBeenCalledOnce();
      expect(reportClientErrorMock).toHaveBeenCalledWith(
        expect.objectContaining({
          stage: 'network',
          message: 'Failed to fetch',
        }),
      );
    });

    it('should suppress reportClientError on network error when reportClientErrorOn5xx is false', async () => {
      const fetchSpy = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.stubGlobal('fetch', fetchSpy);

      await expect(
        httpFetch('/v1/checkout/customer', { reportClientErrorOn5xx: false }),
      ).rejects.toThrow();

      expect(reportClientErrorMock).not.toHaveBeenCalled();
    });
  });

  describe('response passthrough', () => {
    it('should return the raw Response object without consuming the body', async () => {
      const mockResponse = makeResponse(200);
      const fetchSpy = vi.fn().mockResolvedValue(mockResponse);
      vi.stubGlobal('fetch', fetchSpy);

      const result = await httpFetch('/v1/health');

      expect(result).toBe(mockResponse);
    });
  });
});
