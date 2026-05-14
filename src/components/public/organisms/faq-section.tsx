import { FaqItem } from '@/components/public/molecules/faq-item';
import type { LandingContent } from '@/content/landing';

interface FaqSectionProps {
  data: LandingContent['faq'];
  /**
   * Per-pet monthly price in cents — when provided, replaces the
   * `{{pricePerPet}}` placeholder inside any FAQ answer string with the
   * formatted BRL value. Lets the FAQ stay in sync with the live admin
   * setting without splitting the content into JSX fragments.
   */
  pricePerPetCents?: number;
}

const priceFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function applyPlaceholders(text: string, pricePerPetCents?: number): string {
  if (pricePerPetCents === undefined) return text;
  const formatted = priceFormatter.format(pricePerPetCents / 100);
  return text.replaceAll('{{pricePerPet}}', formatted);
}

export function FaqSection({ data, pricePerPetCents }: FaqSectionProps) {
  return (
    <section className="px-6 md:px-10 py-16 max-w-3xl mx-auto">
      <h2 className="font-display text-3xl md:text-4xl text-forest mb-8 text-center">
        {data.heading}
      </h2>
      <div className="flex flex-col gap-3">
        {data.items.map((item) => (
          <FaqItem
            key={item.question}
            question={item.question}
            answer={applyPlaceholders(item.answer, pricePerPetCents)}
          />
        ))}
      </div>
    </section>
  );
}
