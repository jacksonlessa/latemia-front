import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { ContactLine } from '@/components/public/molecules/contact-line';
import { WhatsAppLink } from '@/components/public/atoms/whatsapp-link';
import type { LandingContent } from '@/content/landing';

interface ContactSectionProps {
  data: LandingContent['contact'];
}

export function ContactSection({ data }: ContactSectionProps) {
  return (
    <section className="px-6 md:px-10 py-16 max-w-3xl mx-auto">
      <h2 className="font-display text-3xl md:text-4xl text-forest mb-8 text-center">
        {data.heading}
      </h2>
      <ul className="flex flex-col gap-4 mb-8">
        <ContactLine icon={MapPin} label="Endereço" value={data.address} />
        <ContactLine icon={Phone} label="Telefone" value={data.phone} href={`tel:${data.phone.replace(/\D/g, '')}`} />
        <ContactLine icon={Mail} label="E-mail" value={data.email} href={`mailto:${data.email}`} />
      </ul>
      <div className="flex justify-center">
        <WhatsAppLink
          message={data.whatsapp.defaultMessage}
          label="Abrir conversa no WhatsApp"
          className="inline-flex items-center gap-2 rounded-full bg-forest text-cream px-6 py-3 text-base font-semibold hover:bg-forest-strong transition-colors"
        >
          <MessageCircle size={20} aria-hidden="true" />
          Falar pelo WhatsApp
        </WhatsAppLink>
      </div>
    </section>
  );
}
