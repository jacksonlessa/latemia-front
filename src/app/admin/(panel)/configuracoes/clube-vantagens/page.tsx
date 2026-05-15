import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { fetchMe } from '@/lib/api-server';
import { SESSION_COOKIE } from '@/lib/session';
import { CLUBE_VANTAGENS_VERSION } from '@/content/beneficios';
import { ClubeVantagensPageClient } from './ClubeVantagensPageClient';

/**
 * Página admin `/admin/configuracoes/clube-vantagens` — apenas papel `admin`.
 *
 * Server Component shell: valida a sessão e o papel do usuário, depois delega
 * para `ClubeVantagensPageClient` (Client Component orchestrator) que cuida
 * do formulário, da listagem e do tratamento de erros tipados.
 *
 * Atendentes (que conseguem chamar o `GET /v1/admin/clube-vantagens/alteracoes`
 * via SAC) acessam a listagem por outro caminho operacional — esta tela é
 * exclusivamente admin porque combina escrita (disparar comunicação) com
 * leitura.
 */
export default async function ClubeVantagensConfigPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect('/admin/login');
  }

  const me = await fetchMe(token);
  if (!me || me.role !== 'admin') {
    redirect('/admin/home');
  }

  return (
    <ClubeVantagensPageClient currentVersion={CLUBE_VANTAGENS_VERSION} />
  );
}
