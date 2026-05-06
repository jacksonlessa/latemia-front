export class CancellationTokenGenerationError extends Error {
  constructor(message = 'Erro ao gerar link de cancelamento.') {
    super(message);
    this.name = 'CancellationTokenGenerationError';
  }
}

export interface GenerateCancellationTokenResult {
  url: string;
  expiresAt: string;
}

export async function generateCancellationTokenUseCase(
  planId: string,
): Promise<GenerateCancellationTokenResult> {
  const res = await fetch(
    `/api/admin/plans/${encodeURIComponent(planId)}/cancellation-token`,
    { method: 'POST' },
  );

  if (!res.ok) {
    throw new CancellationTokenGenerationError();
  }

  const data = (await res.json()) as { url: string; expiresAt: string };
  return { url: data.url, expiresAt: data.expiresAt };
}
