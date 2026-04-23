import Link from 'next/link';
import { BrandLogo } from '@/components/public/atoms/brand-logo';
import { publicSite } from '@/config/public-site';

export function HeaderNav() {
  return (
    <header className="flex items-center justify-between py-4 px-6 md:px-10">
      <BrandLogo width={72} height={72} priority asLink />
      <Link
        href={publicSite.checkoutPath}
        className="rounded-full bg-forest text-cream px-5 py-2 text-sm font-semibold hover:bg-forest-strong transition-colors"
      >
        Contratar plano
      </Link>
    </header>
  );
}
