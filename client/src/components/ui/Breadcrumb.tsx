import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', fontSize: '0.875rem' }}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {idx > 0 && (
              <span style={{ color: 'var(--color-text-muted)', userSelect: 'none' }}>/</span>
            )}
            {!isLast && item.href ? (
              <Link to={item.href} style={{ color: 'var(--color-accent)' }}>
                {item.label}
              </Link>
            ) : (
              <span style={{ color: isLast ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
