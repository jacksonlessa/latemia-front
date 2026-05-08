/**
 * Unit tests for client-error-reporter.
 *
 * Verifies: correct URL construction, keepalive flag, silent error swallowing,
 * userAgent truncation, and fallback when NEXT_PUBLIC_API_URL is absent.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reportClientError } from './client-error-reporter';

describe('reportClientError', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 200 })));
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
  });

  it('should POST to the correct URL using NEXT_PUBLIC_API_URL', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';

    await reportClientError({
      requestId: 'test-id',
      stage: 'network',
      message: 'Something went wrong',
    });

    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/log/client-error',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('should pass keepalive: true to fetch', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';

    await reportClientError({
      requestId: 'test-id',
      stage: 'network',
      message: 'Something went wrong',
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ keepalive: true }),
    );
  });

  it('should silently swallow errors when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));

    await expect(
      reportClientError({ requestId: 'id', stage: 'network', message: 'err' }),
    ).resolves.toBeUndefined();
  });

  it('should not throw when NEXT_PUBLIC_API_URL is absent (fallback to localhost)', async () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    await reportClientError({ requestId: 'id', stage: 'network', message: 'err' });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/v1/log/client-error',
      expect.any(Object),
    );
  });

  it('should truncate userAgent to 200 characters', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
    const longUA = 'A'.repeat(300);

    await reportClientError({
      requestId: 'id',
      stage: 'network',
      message: 'err',
      userAgent: longUA,
    });

    const body = JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body as string);
    expect(body.userAgent).toHaveLength(200);
    expect(body.userAgent).toBe('A'.repeat(200));
  });

  it('should handle absent userAgent without throwing', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';

    await expect(
      reportClientError({ requestId: 'id', stage: 'network', message: 'err' }),
    ).resolves.toBeUndefined();
  });
});
