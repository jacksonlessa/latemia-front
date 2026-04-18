import Link from 'next/link';
import { BrandLogo } from '@/components/public/atoms/brand-logo';
import { publicSite } from '@/config/public-site';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-sand bg-sand/40 mt-16">
      <div className="px-6 md:px-10 py-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6 justify-between">
        <BrandLogo width={56} height={56} />
        <nav className="flex gap-6 text-sm">
          <Link href="/privacidade" className="hover:text-forest">Política de Privacidade</Link>
          <Link href="/termos" className="hover:text-forest">Termos de Uso</Link>
        </nav>
        <p className="text-xs text-forest/60">
          © {year} {publicSite.siteName}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
