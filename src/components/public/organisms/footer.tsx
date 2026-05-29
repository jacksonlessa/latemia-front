import Image from 'next/image';
import Link from 'next/link';
import { ConsentLink } from '@/components/public/consent/consent-link';
import { publicSite } from '@/config/public-site';
import { clinicaContent } from '@/content/clinica';

const FOOTER_NAV_LINK_CLASS =
  'text-[12.5px] font-medium text-white/40 transition-colors hover:text-white/70';

const FOOTER_GROUP_TITLE_CLASS =
  'text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30';

const SAC_EMAIL = 'sac@drcleitinho.com.br';

const whatsappFooterUrl = `https://wa.me/${publicSite.whatsapp.number}?text=${encodeURIComponent(
  publicSite.whatsapp.messages.footer,
)}`;

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
          {publicSite.clinicName}
        </span>
      </Link>

      <div className="flex max-w-[960px] flex-col gap-8 md:flex-row md:items-start md:justify-center md:gap-12 md:text-left">
        <nav aria-label="Conheça o plano" className="flex flex-col gap-2">
          <h3 className={FOOTER_GROUP_TITLE_CLASS}>Conheça o plano</h3>
          <ul className="flex flex-col gap-1.5">
            <li>
              <Link href="/clube-de-vantagens" className={FOOTER_NAV_LINK_CLASS}>
                Clube de Vantagens
              </Link>
            </li>
            <li>
              <Link href="/emergencia" className={FOOTER_NAV_LINK_CLASS}>
                Proteção emergencial
              </Link>
            </li>
            <li>
              <Link href={publicSite.checkoutPath} className={FOOTER_NAV_LINK_CLASS}>
                Contratar plano
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Informações oficiais" className="flex flex-col gap-2">
          <h3 className={FOOTER_GROUP_TITLE_CLASS}>Informações oficiais</h3>
          <ul className="flex flex-col gap-1.5">
            <li>
              <Link href="/beneficios" className={FOOTER_NAV_LINK_CLASS}>
                Tabela de benefícios
              </Link>
            </li>
            <li>
              <Link href="/termos" className={FOOTER_NAV_LINK_CLASS}>
                Termos de Uso
              </Link>
            </li>
            <li>
              <Link href="/privacidade" className={FOOTER_NAV_LINK_CLASS}>
                Política de Privacidade
              </Link>
            </li>
            <li>
              <Link href="/lgpd" className={FOOTER_NAV_LINK_CLASS}>
                Direitos do titular
              </Link>
            </li>
            <li>
              <ConsentLink className={FOOTER_NAV_LINK_CLASS} label="Preferências de cookies" />
            </li>
          </ul>
        </nav>

        <nav aria-label="Institucional / Atendimento" className="flex flex-col gap-2">
          <h3 className={FOOTER_GROUP_TITLE_CLASS}>Institucional / Atendimento</h3>
          <ul className="flex flex-col gap-1.5">
            <li>
              <Link href="/sobre-a-clinica" className={FOOTER_NAV_LINK_CLASS}>
                Sobre a clínica
              </Link>
            </li>
            {clinicaContent.institutionalUrl ? (
              <li>
                <a
                  href={clinicaContent.institutionalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Site da clínica (abre em nova aba)"
                  className={FOOTER_NAV_LINK_CLASS}
                >
                  Site da clínica
                </a>
              </li>
            ) : null}
            <li>
              <a
                href={whatsappFooterUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp (abre em nova aba)"
                className={FOOTER_NAV_LINK_CLASS}
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${SAC_EMAIL}`} className={FOOTER_NAV_LINK_CLASS}>
                SAC
              </a>
            </li>
            {clinicaContent.mapsUrl ? (
              <li>
                <a
                  href={clinicaContent.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Ver no Maps (abre em nova aba)"
                  className={FOOTER_NAV_LINK_CLASS}
                >
                  Ver no Maps
                </a>
              </li>
            ) : null}
          </ul>
        </nav>
      </div>

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
