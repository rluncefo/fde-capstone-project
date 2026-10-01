import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { useCart } from '../context/CartContext';
import { processPayment } from '../api/payments';
import Button from '../components/ui/Button';
import type { OrderItem } from '../types';

type PaymentMethodType = 'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'WALLET';

interface LocationState {
  orderId?: string;
  items?: OrderItem[];
  totalAmount?: number;
}

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const state = location.state as LocationState | null;

  if (!state?.orderId) {
    return <Navigate to="/checkout" replace />;
  }

  const { orderId, items = [], totalAmount = 0 } = state;

  const [method, setMethod] = useState<PaymentMethodType>('CREDIT_CARD');
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const paymentMethods: { id: PaymentMethodType; label: string }[] = [
    { id: 'CREDIT_CARD', label: 'Credit Card' },
    { id: 'DEBIT_CARD', label: 'Debit Card' },
    { id: 'UPI', label: 'UPI' },
    { id: 'WALLET', label: 'Wallet' },
  ];

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic client validation
    if (method === 'CREDIT_CARD' || method === 'DEBIT_CARD') {
      if (!cardNumber.trim() || !cardholderName.trim() || !expiry.trim() || !cvv.trim()) {
        setError('Please fill in all card details.');
        return;
      }
    } else if (method === 'UPI') {
      if (!upiId.trim() || !upiId.includes('@')) {
        setError('Please enter a valid UPI ID (e.g. user@bank).');
        return;
      }
    }

    try {
      setIsLoading(true);
      const [expiryMonth = '12', expiryYear = '2030'] = expiry.split('/');
      const cardDetails =
        method === 'CREDIT_CARD' || method === 'DEBIT_CARD'
          ? {
              cardNumber: cardNumber.replace(/\s+/g, ''),
              cardholderName,
              expiryMonth,
              expiryYear,
              cvv,
            }
          : undefined;

      const paymentRes = await processPayment(orderId, method, cardDetails);
      clearCart();

      navigate('/order-confirmation', {
        state: {
          order: {
            id: orderId,
            items,
            transactionRef: paymentRes.transactionRef || (paymentRes as any).payment?.transactionRef,
            totalAmount,
          },
        },
      });
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string; message?: string } } };
      setError(
        apiErr.response?.data?.error ||
          apiErr.response?.data?.message ||
          'Payment failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: 'var(--color-bg-primary)',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    color: 'var(--color-text-primary)',
    fontSize: '0.875rem',
    boxSizing: 'border-box',
  };

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
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Card Header */}
          <div
            style={{
              padding: '24px 28px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h1
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                margin: 0,
                color: 'var(--color-text-primary)',
              }}
            >
              Complete Payment
            </h1>
            <div
              style={{
                fontSize: '1.125rem',
                color: 'var(--color-text-primary)',
              }}
            >
              <span>Payable Amount: </span>
              <strong style={{ color: 'var(--color-accent)' }}>
                ${totalAmount > 0 ? totalAmount.toFixed(2) : '0.00'}
              </strong>
            </div>
          </div>

          {/* Card Body - Two Columns */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(200px, 1fr) minmax(300px, 2fr)',
              minHeight: '340px',
            }}
          >
            {/* Left column: Method Selector */}
            <div
              style={{
                borderRight: '1px solid var(--color-border)',
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                background: 'rgba(0,0,0,0.15)',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  paddingLeft: '8px',
                  marginBottom: '4px',
                }}
              >
                Payment Method
              </span>
              {paymentMethods.map((m) => {
                const isActive = method === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setMethod(m.id);
                      setError('');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: isActive ? 'var(--color-bg-card)' : 'transparent',
                      border: `1px solid ${isActive ? 'var(--color-accent)' : 'transparent'}`,
                      color: isActive ? 'var(--color-accent)' : 'var(--color-text-primary)',
                      fontWeight: isActive ? 600 : 400,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        border: `2px solid ${isActive ? 'var(--color-accent)' : 'var(--color-text-muted)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isActive && (
                        <div
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--color-accent)',
                          }}
                        />
                      )}
                    </div>
                    {m.label}
                  </button>
                );
              })}
            </div>

            {/* Right column: Form */}
            <form
              onSubmit={handlePayNow}
              style={{
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {(method === 'CREDIT_CARD' || method === 'DEBIT_CARD') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                        Name on Card
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                          CVV
                        </label>
                        <input
                          type="password"
                          placeholder="XXX"
                          maxLength={4}
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          style={inputStyle}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                          Date of Expiry
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YYYY"
                          maxLength={7}
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          style={inputStyle}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {method === 'UPI' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                        UPI ID
                      </label>
                      <input
                        type="text"
                        placeholder="name@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0 }}>
                      Enter your Virtual Payment Address (VPA) to approve the payment on your UPI app.
                    </p>
                  </div>
                )}

                {method === 'WALLET' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div
                      style={{
                        padding: '16px',
                        background: 'var(--color-bg-card)',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', display: 'block' }}>
                        Wallet Balance
                      </span>
                      <strong style={{ fontSize: '1.25rem', color: 'var(--color-success)' }}>
                        $500.00
                      </strong>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0 }}>
                      The payable amount will be deducted directly from your BookWorm wallet balance.
                    </p>
                  </div>
                )}

                {error && (
                  <p
                    style={{
                      marginTop: '16px',
                      color: 'var(--color-error)',
                      fontSize: '0.8125rem',
                      padding: '8px 12px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid var(--color-error)',
                      borderRadius: '6px',
                    }}
                  >
                    {error}
                  </p>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '24px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                >
                  Pay Now
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
