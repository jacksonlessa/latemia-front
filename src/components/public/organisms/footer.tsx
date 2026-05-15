import Image from 'next/image';
import Link from 'next/link';
import { publicSite } from '@/config/public-site';
import { ConsentLink } from '@/components/public/consent/consent-link';

const FOOTER_NAV_LINK_CLASS =
  'text-[12.5px] font-medium text-white/40 transition-colors hover:text-white/70';

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
      <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
        <Link href="/beneficios" className={FOOTER_NAV_LINK_CLASS}>
          Clube de Vantagens
        </Link>
        <Link href="/privacidade" className={FOOTER_NAV_LINK_CLASS}>
          Política de Privacidade
        </Link>
        <Link href="/termos" className={FOOTER_NAV_LINK_CLASS}>
          Termos de Uso
        </Link>
        <Link href="/lgpd" className={FOOTER_NAV_LINK_CLASS}>
          Direitos do titular
        </Link>
        <ConsentLink className={FOOTER_NAV_LINK_CLASS} label="Preferências de cookies" />
      </nav>
      <p className="text-[11.5px] text-white/25">
        © {year} {publicSite.siteName}. Todos os direitos reservados.
      </p>
      <p className="text-[10.5px] text-white/20">
        Desenvolvido por{' '}
        <a
          href="https://www.jackssolutions.com.br/"
          target="_blank"
          rel="noopener"
          className="underline-offset-2 transition-colors hover:text-white/40 hover:underline"
        >
          Jackson Lessa · Jack's Solutions
        </a>
      </p>
      <p className="text-[10.5px] text-white/20">
        Fotografias:{' '}
        <a
          href="https://www.pexels.com/pt-br/@kaboompics"
          target="_blank"
          rel="noopener"
          className="underline-offset-2 transition-colors hover:text-white/40 hover:underline"
        >
          Kaboompics
        </a>
        ,{' '}
        <a
          href="https://www.pexels.com/pt-br/@mikhail-nilov"
          target="_blank"
          rel="noopener"
          className="underline-offset-2 transition-colors hover:text-white/40 hover:underline"
        >
          Mikhail Nilov
        </a>
        ,{' '}
        <a
          href="https://www.pexels.com/pt-br/@pixabay"
          target="_blank"
          rel="noopener"
          className="underline-offset-2 transition-colors hover:text-white/40 hover:underline"
        >
          Pixabay
        </a>{' '}
        via Pexels
      </p>
    </footer>
  );
}
