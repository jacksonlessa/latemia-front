import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchMe } from '@/lib/api-server';
import { SESSION_COOKIE } from '@/lib/session';
import { PlanosAssinaturaPageClient } from './PlanosAssinaturaPageClient';

export default async function PlanosAssinaturaPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect('/admin/login');
  }

  const me = await fetchMe(token);
  if (!me || me.role !== 'admin') {
    redirect('/admin/home');
  }

  return <PlanosAssinaturaPageClient />;
}
