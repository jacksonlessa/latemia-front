import { HeaderNav } from '@/components/public/organisms/header-nav';
import { Footer } from '@/components/public/organisms/footer';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderNav />
      {children}
      <Footer />
    </>
  );
}
