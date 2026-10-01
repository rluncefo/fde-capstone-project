import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { getOrders, cancelOrder } from '../api/orders';
import { useCart } from '../context/CartContext';
import type { Order } from '../types';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { addItem, openDrawer } = useCart();

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getOrders();
      setOrders(data);
    } catch {
      setError('Failed to load orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleBuyAgain = async (bookId: string) => {
    try {
      await addItem(bookId, 1);
      openDrawer();
    } catch {
      // ignore
    }
  };

  const handleCancel = async (orderId: string) => {
    try {
      setActionLoadingId(orderId);
      await cancelOrder(orderId);
      await fetchOrders();
    } catch {
      setError('Failed to cancel order.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const canCancel = (order: Order) => {
    const isStatusCancellable = order.status === 'PENDING' || order.status === 'CONFIRMED';
    if (!isStatusCancellable) return false;

    // Check if within 48h
    const orderTime = new Date(order.createdAt).getTime();
    const now = Date.now();
    const hoursElapsed = (now - orderTime) / (1000 * 60 * 60);
    return hoursElapsed <= 48;
  };

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
          My Orders
        </h1>

        {error && (
          <p
            style={{
              marginBottom: '20px',
              color: 'var(--color-error)',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </p>
        )}

        {isLoading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '64px',
            }}
          >
            <Spinner />
          </div>
        ) : orders.length === 0 ? (
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
              No orders yet
            </p>
            <Link to="/">
              <Button variant="primary">Browse Books</Button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={order.id}
                  style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '20px',
                  }}
                >
                  {/* Order Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--color-border)',
                      paddingBottom: '16px',
                      marginBottom: '16px',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        Order ID:{' '}
                        <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                          #{order.id.slice(0, 8)}...
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Placed on {formattedDate}
                      </div>
                    </div>
                    <div>
                      <Badge variant="status" label={order.status} />
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          paddingBottom: '12px',
                          borderBottom: '1px dashed var(--color-border)',
                        }}
                      >
                        <img
                          src={item.book.coverUrl || 'https://placehold.co/96x128/0f3460/94a3b8?text=Book'}
                          alt={item.book.title}
                          style={{
                            width: 50,
                            height: 70,
                            objectFit: 'cover',
                            borderRadius: '4px',
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4
                            style={{
                              fontSize: '0.9375rem',
                              fontWeight: 600,
                              margin: '0 0 4px 0',
                              color: 'var(--color-text-primary)',
                            }}
                          >
                            {item.book.title}
                          </h4>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                            Qty: {item.quantity} × ${item.priceAtTime.toFixed(2)}
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleBuyAgain(item.bookId)}
                        >
                          Buy Again
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '16px',
                      paddingTop: '12px',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      {canCancel(order) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          isLoading={actionLoadingId === order.id}
                          onClick={() => handleCancel(order.id)}
                          style={{ color: 'var(--color-error)' }}
                        >
                          Cancel Order
                        </Button>
                      )}
                    </div>
                    <div style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                      <span>Total Amount: </span>
                      <strong style={{ fontSize: '1.125rem' }}>${order.totalAmount.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
