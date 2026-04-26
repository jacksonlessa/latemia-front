import { publicSite } from '@/config/public-site';
import { landingContent } from '@/content/landing';

const whatsappHref = `https://wa.me/${publicSite.whatsapp.number}?text=${encodeURIComponent(
  publicSite.whatsapp.defaultMessage,
)}`;

export function ContactSection() {
  const { address, phone, mapsUrl } = landingContent.contact;
  const [addressLine1, addressLine2] = address.split(' - ');
  return (
    <section className="bg-cream py-16">
      <div className="mx-auto w-full max-w-[1120px] px-5">
        <div className="mb-8 flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[1.4px] text-ink-muted">
            Contato
          </span>
          <h2 className="font-display text-[clamp(28px,7vw,42px)] leading-[1.05] tracking-[-0.03em] text-ink">
            Estamos em <em className="italic text-forest">Camboriú, SC</em>.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="h-[240px] overflow-hidden rounded-[18px] border border-forest-soft bg-forest-pale sm:h-auto sm:min-h-[280px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d-48.6477971!3d-27.0337695!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94d8b76bc7fc191f%3A0x6b944b2d0758290b!2sLate%20%26%20Mia%20Cl%C3%ADnica%20Veterin%C3%A1ria!5e0!3m2!1spt-BR!2sbr!4v1"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização Late & Mia"
              className="h-full w-full rounded-[18px] border-none"
            />
          </div>
          <div>
            <div className="mb-5 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-forest-pale text-forest">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 22s-8-7.6-8-13a8 8 0 1116 0c0 5.4-8 13-8 13z" />
                    <circle cx="12" cy="9" r="3" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[1px] text-ink-muted">
                    Endereço
                  </div>
                  <div className="mt-0.5 text-[14.5px] leading-[1.4] text-ink">
                    {addressLine1}
                    <br />
                    {addressLine2}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-forest-pale text-forest">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.4 2.1L8.1 9.8a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.7.7a2 2 0 011.8 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[1px] text-ink-muted">
                    Telefone
                  </div>
                  <div className="mt-0.5 text-[14.5px] leading-[1.4] text-ink">{phone}</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <a
                href={whatsappHref}
                className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#25D366] px-6 py-[15px] text-[15px] font-semibold text-white shadow-[0_2px_0_#1aaa50,0_8px_24px_rgba(37,211,102,0.25)] transition-[filter] hover:brightness-110 active:scale-[0.97]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                </svg>
                Falar pelo WhatsApp
              </a>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-sand-dark bg-transparent px-6 py-[15px] text-[15px] font-semibold text-ink shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:bg-white active:scale-[0.97]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 22s-8-7.6-8-13a8 8 0 1116 0c0 5.4-8 13-8 13z" />
                    <circle cx="12" cy="9" r="3" />
                  </svg>
                  Ver no Maps
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
