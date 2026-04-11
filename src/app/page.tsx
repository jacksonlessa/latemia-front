interface HealthResponse {
  status: string;
  env: string;
  db: string;
}

export default async function HomePage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  let data: HealthResponse | null = null;
  let error: string | null = null;

  try {
    const res = await fetch(`${apiUrl}/health`, { cache: "no-store" });
    const body = (await res.json()) as HealthResponse;
    if (
      typeof body?.status === "string" &&
      typeof body?.env === "string" &&
      typeof body?.db === "string"
    ) {
      data = body;
    } else {
      error = `Resposta inesperada do backend em ${apiUrl}/health`;
    }
  } catch {
    error = `Backend não acessível em ${apiUrl}`;
  }

  return (
    <main style={{ fontFamily: "monospace", padding: "2rem" }}>
      <h1>LateMia — Health Check</h1>
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </main>
  );
}
