import Link from 'next/link';
import { BrandLogo } from '@/components/public/atoms/brand-logo';
import { publicSite } from '@/config/public-site';
import { landingContent } from '@/content/landing';

const phoneDigits = landingContent.contact.phone.replace(/\D/g, '');

export function HeaderNav() {
  return (
    <nav className="sticky top-0 z-[100] border-b border-sand-dark bg-cream/90 px-5 backdrop-blur-md">
      <div className="mx-auto flex h-[60px] max-w-[1120px] items-center justify-between">
        <Link href="/" aria-label="Ir para a página inicial" className="flex items-center gap-2.5">
          <BrandLogo width={34} height={34} priority />
          <div>
            <div className="font-display text-[17px] leading-none text-ink">Late & Mia</div>
            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[1px] text-ink-muted">
              Clínica Veterinária
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2.5">
          <a
            href={`tel:+55${phoneDigits}`}
            className="hidden rounded-full border-[1.5px] border-sand-dark bg-transparent px-4 py-2.5 text-[13px] font-semibold text-ink shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:bg-white sm:inline-flex"
          >
            {landingContent.contact.phone}
          </a>
          <Link
            href={publicSite.checkoutPath}
            className="inline-flex items-center justify-center rounded-full bg-forest px-5 py-[11px] text-[14px] font-semibold text-white shadow-[0_2px_0_var(--color-forest-deep),0_8px_24px_rgba(93,122,94,0.28)] transition-[filter] hover:brightness-110"
          >
            Contratar plano
          </Link>
        </div>
      </div>
    </nav>
  );
}
