interface PriceTagProps {
  cents: number;
  className?: string;
}

const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function PriceTag({ cents, className }: PriceTagProps) {
  return (
    <span className={className} aria-label={`${formatter.format(cents / 100)} por pet por mês`}>
      {formatter.format(cents / 100)}
    </span>
  );
}
