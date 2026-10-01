import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getCategories } from '../../api/books';
import type { Category } from '../../types';

export default function CategorySidebar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') ?? 'all';

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .finally(() => setIsLoading(false));
  }, []);

  const itemStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'block',
    padding: '8px 16px',
    fontSize: 13,
    textDecoration: 'none',
    color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
    borderLeft: isActive
      ? '3px solid var(--color-accent)'
      : '3px solid transparent',
    fontWeight: isActive ? 600 : 400,
    backgroundColor: isActive ? 'rgba(59,130,246,0.08)' : 'transparent',
  });

  if (isLoading) {
    return (
      <nav
        style={{
          width: 200,
          flexShrink: 0,
          backgroundColor: 'var(--color-bg-secondary)',
          padding: '16px 0',
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 14,
              margin: '10px 16px',
              borderRadius: 4,
              backgroundColor: 'var(--color-border)',
            }}
          />
        ))}
      </nav>
    );
  }

  return (
    <nav
      style={{
        width: 200,
        flexShrink: 0,
        backgroundColor: 'var(--color-bg-secondary)',
        padding: '16px 0',
        overflowY: 'auto',
      }}
    >
      <Link to="/" style={itemStyle(activeCategory === 'all')}>
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          to={`/?category=${cat.slug}`}
          style={itemStyle(activeCategory === cat.slug)}
        >
          {cat.name}
        </Link>
      ))}
    </nav>
  );
}
