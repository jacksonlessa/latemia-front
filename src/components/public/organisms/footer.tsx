import Image from 'next/image';
import Link from 'next/link';
import { publicSite } from '@/config/public-site';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="flex flex-col items-center gap-4 bg-ink px-5 py-9 text-center">
      <Link href="/" aria-label="Ir para a página inicial" className="flex items-center gap-2">
        <Image
          src="/brand/logo.png"
          alt={publicSite.siteName}
          width={28}
          height={28}
          className="h-7 w-7 rounded-lg bg-white object-contain"
        />
        <span className="font-display text-[15px] text-white/80">
          {publicSite.siteName} Clínica Veterinária
        </span>
      </Link>
      <nav className="flex gap-5">
        <Link href="/privacidade" className="text-[12.5px] font-medium text-white/40 transition-colors hover:text-white/70">
          Política de Privacidade
        </Link>
        <Link href="/termos" className="text-[12.5px] font-medium text-white/40 transition-colors hover:text-white/70">
          Termos de Uso
        </Link>
      </nav>
      <p className="text-[11.5px] text-white/25">
        © {year} {publicSite.siteName}. Todos os direitos reservados.
      </p>
    </footer>
  );
}
