import Image from 'next/image';
import { publicSite } from '@/config/public-site';

interface BrandLogoProps {
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

export function BrandLogo({ width = 120, height = 120, priority = false, className }: BrandLogoProps) {
  return (
    <Image
      src={publicSite.brand.logoSrc}
      alt={publicSite.brand.logoAlt}
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
