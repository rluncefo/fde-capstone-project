import type { Book } from '../../types';
import BookCard from './BookCard';

interface BookGridProps {
  title: string;
  books: Book[];
  isLoading?: boolean;
  emptyMessage?: string;
}

function SkeletonCard() {
  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '12px',
      }}
    >
      <div style={{ width: 96, height: 128, borderRadius: '4px', background: 'var(--color-border)', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ height: 16, borderRadius: 4, background: 'var(--color-border)', width: '70%' }} />
        <div style={{ height: 12, borderRadius: 4, background: 'var(--color-border)', width: '40%' }} />
        <div style={{ height: 12, borderRadius: 4, background: 'var(--color-border)', width: '90%' }} />
        <div style={{ height: 12, borderRadius: 4, background: 'var(--color-border)', width: '60%' }} />
      </div>
    </div>
  );
}

export default function BookGrid({ title, books, isLoading = false, emptyMessage = 'No books found.' }: BookGridProps) {
  return (
    <section style={{ marginBottom: '32px' }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px', margin: '0 0 16px 0' }}>
        {title}
      </h2>

      {isLoading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : books.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{emptyMessage}</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </section>
  );
}
