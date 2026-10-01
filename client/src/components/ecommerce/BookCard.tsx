import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Book } from '../../types';
import { useCart } from '../../context/CartContext';
import Badge from '../ui/Badge';
import PriceTag from './PriceTag';
import Button from '../ui/Button';

interface BookCardProps {
  book: Book;
  size?: 'compact' | 'normal';
  showAddToCart?: boolean;
}

/** Returns a delivery date string "+3 business days from today", e.g. "Mon, 29 Sep" */
export function getDeliveryDate(): string {
  const date = new Date();
  let added = 0;
  while (added < 3) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function BookCard({ book, size = 'normal', showAddToCart = false }: BookCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const imgWidth = size === 'compact' ? 72 : 96;
  const categories = Array.isArray(book?.categories) ? book.categories : [];
  const visibleCategories = categories.slice(0, 2);

  function handleCardClick(e: React.MouseEvent<HTMLDivElement>) {
    // Don't navigate if the click originated from a button, link, input, or
    // any element inside the Add-to-Cart section (data-no-navigate).
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.tagName === 'INPUT' ||
      target.closest?.('button') !== null ||
      target.closest?.('[data-no-navigate]') !== null
    ) return;
    navigate(`/books/${book.slug}`);
  }

  async function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await addItem(book.id, 1);
    } catch {
      // silent — auth guard or cart error handled higher up
    }
  }

  return (
    <div
      onClick={handleCardClick}
      style={{
        display: 'flex',
        gap: '12px',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '12px',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
    >
      {/* Cover */}
      <img
        src={book.coverUrl || 'https://placehold.co/96x128/0f3460/94a3b8?text=Book'}
        alt={book.title}
        style={{
          width: imgWidth,
          minWidth: imgWidth,
          height: size === 'compact' ? 96 : 128,
          objectFit: 'cover',
          borderRadius: '4px',
          flexShrink: 0,
        }}
      />

      {/* Right column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: size === 'compact' ? '0.875rem' : '1rem',
            whiteSpace: size === 'compact' ? 'nowrap' : 'normal',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={book.title}
        >
          {book.title}
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--color-accent)' }}>
          by {book.author?.name ?? 'Unknown'}
        </div>

        <div
          style={{
            fontSize: '0.8125rem',
            color: 'var(--color-text-muted)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {book.description}
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {book?.format ? book.format.charAt(0) + book.format.slice(1).toLowerCase() : ''}
        </div>

        {visibleCategories.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {visibleCategories.map((cat) => (
              <Badge key={cat.id} label={cat.name} />
            ))}
          </div>
        )}

        <div style={{ marginTop: '2px' }}>
          <PriceTag price={book.price} />
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          Delivery by {getDeliveryDate()}
        </div>

        {showAddToCart && (
          <div
            style={{ marginTop: '6px' }}
            data-no-navigate="true"
            onClick={(e) => e.stopPropagation()}
          >
            <Button size="sm" variant="primary" onClick={handleAddToCart}>
              Add to Cart
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
