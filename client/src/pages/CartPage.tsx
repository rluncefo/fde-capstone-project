import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { useCart } from '../context/CartContext';
import QuantitySelector from '../components/ecommerce/QuantitySelector';
import PriceTag from '../components/ecommerce/PriceTag';
import Button from '../components/ui/Button';

export default function CartPage() {
  const { items, totalItems, subtotal, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '32px 20px',
        }}
      >
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            marginBottom: '24px',
            color: 'var(--color-text-primary)',
          }}
        >
          Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </h1>

        {items.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 20px',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
            }}
          >
            <p
              style={{
                fontSize: '1.125rem',
                color: 'var(--color-text-muted)',
                marginBottom: '20px',
              }}
            >
              Your cart is empty
            </p>
            <Link to="/">
              <Button variant="primary">Browse Books</Button>
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '16px',
                    alignItems: 'center',
                  }}
                >
                  {/* Cover */}
                  <img
                    src={item.book.coverUrl || 'https://placehold.co/96x128/0f3460/94a3b8?text=Book'}
                    alt={item.book.title}
                    style={{
                      width: 72,
                      height: 100,
                      objectFit: 'cover',
                      borderRadius: '4px',
                      flexShrink: 0,
                    }}
                  />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      onClick={() => navigate(`/books/${item.book.slug}`)}
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        margin: '0 0 4px 0',
                        cursor: 'pointer',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {item.book.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--color-accent)',
                        margin: '0 0 6px 0',
                      }}
                    >
                      by {item.book.author?.name ?? 'Unknown'}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {item.book.format.charAt(0) + item.book.format.slice(1).toLowerCase()}
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <PriceTag price={item.book.price} />
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '12px',
                    }}
                  >
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        fontSize: '1.25rem',
                        cursor: 'pointer',
                        padding: '4px',
                        lineHeight: 1,
                      }}
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      ×
                    </button>
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(newQty) => updateItem(item.id, newQty)}
                    />
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '1rem',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      ${(item.book.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal & Checkout Button */}
            <div
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
                  Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'}):{' '}
                </span>
                <span
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
