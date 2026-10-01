import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function CartDrawer() {
  const { items, totalItems, subtotal, isDrawerOpen, closeDrawer } = useCart();
  const navigate = useNavigate();

  return (
    <>
      {/* Backdrop */}
      {isDrawerOpen && (
        <div
          onClick={closeDrawer}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 200,
          }}
        />
      )}

      {/* Drawer panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: 'min(380px, 100vw)',
          backgroundColor: 'var(--color-bg-secondary)',
          borderLeft: '1px solid var(--color-border)',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          transform: isDrawerOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            flexShrink: 0,
          }}
        >
          <div>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text-primary)' }}>
              Shopping Cart
            </span>
            {totalItems > 0 && (
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 12,
                  color: 'var(--color-text-muted)',
                }}
              >
                ({totalItems} {totalItems === 1 ? 'item' : 'items'})
              </span>
            )}
          </div>
          <button
            onClick={closeDrawer}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              fontSize: 20,
              lineHeight: 1,
              padding: 4,
            }}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {isDrawerOpen && items.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--color-text-muted)',
                marginTop: 60,
                fontSize: 14,
              }}
            >
              Your cart is empty
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  marginBottom: 16,
                  paddingBottom: 16,
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                {/* Cover */}
                <img
                  src={item.book.coverUrl}
                  alt={item.book.title}
                  style={{
                    width: 40,
                    height: 56,
                    objectFit: 'cover',
                    borderRadius: 4,
                    flexShrink: 0,
                    backgroundColor: 'var(--color-bg-card)',
                  }}
                />
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.book.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {item.book.author.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>
                    {item.book.format}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      Qty: {item.quantity}
                    </span>
                    <span
                      style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}
                    >
                      ${(item.book.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--color-border)',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 16,
                fontSize: 15,
              }}
            >
              <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
              <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => { navigate('/checkout'); closeDrawer(); }}
              style={{
                width: '100%',
                padding: '12px 0',
                backgroundColor: 'var(--color-accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                marginBottom: 10,
              }}
            >
              Go to Checkout
            </button>
            <button
              onClick={closeDrawer}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                fontSize: 13,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
