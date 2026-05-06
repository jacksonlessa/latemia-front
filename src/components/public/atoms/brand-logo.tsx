import Image from 'next/image';
import Link from 'next/link';
import { publicSite } from '@/config/public-site';

interface BrandLogoProps {
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  asLink?: boolean;
}

export function BrandLogo({ width = 120, height = 120, priority = false, className, asLink = false }: BrandLogoProps) {
  const image = (
    <Image
      src={publicSite.brand.logoSrc}
      alt={publicSite.brand.logoAlt}
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );

  if (asLink) {
    return <Link href="/" aria-label="Ir para a página inicial">{image}</Link>;
  }

  return image;
}
