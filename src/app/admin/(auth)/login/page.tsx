"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LoginError {
  message: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = (await res.json()) as LoginError;
        setError(data.message ?? "Erro ao realizar login. Tente novamente.");
        return;
      }

      router.push("/admin/home");
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F9F7] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4E8C75]">
            <span className="text-lg font-bold text-white">L&M</span>
          </div>
          <h1 className="text-xl font-semibold text-[#2C2C2E]">Late &amp; Mia</h1>
          <p className="text-sm text-[#6B6B6E]">Acesso ao painel administrativo</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-[#2C2C2E]"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-[#2C2C2E] placeholder:text-[#9B9B9E] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4E8C75] disabled:opacity-50"
                disabled={loading}
                aria-required="true"
              />
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-[#2C2C2E]"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-[#2C2C2E] placeholder:text-[#9B9B9E] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#4E8C75] disabled:opacity-50"
                disabled={loading}
                aria-required="true"
              />
            </div>

            {/* Error */}
            {error && (
              <p role="alert" className="text-sm text-[#C94040]">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="mt-2 w-full rounded-lg bg-[#4E8C75] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3d7260] focus:outline-none focus:ring-2 focus:ring-[#4E8C75] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
