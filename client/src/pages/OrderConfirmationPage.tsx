import { useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import BookCard from '../components/ecommerce/BookCard';
import Button from '../components/ui/Button';
import { useCart } from '../context/CartContext';
import type { OrderItem } from '../types';

interface OrderConfirmationState {
  order?: {
    id: string;
    items: OrderItem[];
    transactionRef?: string;
    totalAmount?: number;
  };
}

export default function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const state = location.state as OrderConfirmationState | null;

  useEffect(() => {
    if (state?.order) {
      clearCart();
    }
  }, [state?.order, clearCart]);

  if (!state?.order) {
    return <Navigate to="/" replace />;
  }

  const { items = [], transactionRef } = state.order;

  return (
    <MainLayout>
      <div
        style={{
          maxWidth: '800px',
          margin: '40px auto',
          padding: '0 20px',
        }}
      >
        <div
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Green checkmark circle icon */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: '0 0 8px 0',
            }}
          >
            Your purchase of the following reads is successful
          </h1>

          {transactionRef && (
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)',
                marginBottom: '28px',
              }}
            >
              Transaction Reference:{' '}
              <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                {transactionRef}
              </span>
            </p>
          )}

          {/* Grid of purchased books */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
              textAlign: 'left',
              margin: '28px 0 36px 0',
            }}
          >
            {items.map((item) => (
              <BookCard key={item.id || item.bookId} book={item.book} size="compact" />
            ))}
          </div>

          <div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/', { replace: true })}
            >
              Continue your Shopping
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
