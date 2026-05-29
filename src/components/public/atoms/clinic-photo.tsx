import Image from 'next/image';
import fotoClinica from '@/assets/foto-clinica.png';
import { cn } from '@/lib/utils';

const CLINIC_PHOTO_ALT =
  'Equipe e estrutura da Late&Mia Clínica Veterinária em Camboriú';

const DEFAULT_SIZES = '(max-width: 640px) 100vw, 480px';

export interface ClinicPhotoProps {
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function ClinicPhoto({
  className,
  sizes = DEFAULT_SIZES,
  priority = false,
}: ClinicPhotoProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={fotoClinica}
        alt={CLINIC_PHOTO_ALT}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
