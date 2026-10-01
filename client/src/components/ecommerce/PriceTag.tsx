interface PriceTagProps {
  price: number | string;
  className?: string;
}

export default function PriceTag({ price, className }: PriceTagProps) {
  const formatted = `$${parseFloat(String(price)).toFixed(2)}`;
  return (
    <span
      className={className}
      style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}
    >
      {formatted}
    </span>
  );
}
