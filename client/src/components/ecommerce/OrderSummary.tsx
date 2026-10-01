import React from 'react';
import { useState } from 'react';
import type { CartItem } from '../../types';
import Button from '../ui/Button';

interface OrderSummaryProps {
  items: CartItem[];
  couponCode: string;
  discount: number;
  onCouponApply: (code: string) => void;
  onPayNow: () => void;
  isLoading?: boolean;
}

const row = (label: string, value: React.ReactNode, bold = false, color?: string): React.ReactNode => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 0',
      borderBottom: '1px solid var(--color-border)',
      fontWeight: bold ? 700 : 400,
      color: color ?? 'inherit',
    }}
  >
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export default function OrderSummary({
  items,
  couponCode,
  discount,
  onCouponApply,
  onPayNow,
  isLoading = false,
}: OrderSummaryProps) {
  const [inputCode, setInputCode] = useState(couponCode);

  const subtotal = items.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax - discount;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '20px',
      }}
    >
      <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>Grand Total</h3>

      {row(`Price (${itemCount} item${itemCount !== 1 ? 's' : ''})`, `$${subtotal.toFixed(2)}`)}
      {row('Tax (10%)', `$${tax.toFixed(2)}`)}
      {row('Delivery Charges', <span style={{ color: 'var(--color-success)' }}>Free</span>)}
      {discount > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 0',
            borderBottom: '1px solid var(--color-border)',
            color: 'var(--color-success)',
          }}
        >
          <span>Discount</span>
          <span data-testid="discount-amount">-${discount.toFixed(2)}</span>
        </div>
      )}
      {row('Total Amount', `$${Math.max(0, total).toFixed(2)}`, true)}

      {/* Coupon */}
      <div style={{ display: 'flex', gap: '8px', margin: '16px 0' }}>
        <input
          type="text"
          data-testid="coupon-input"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          placeholder="Coupon code"
          style={{
            flex: 1,
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            padding: '8px 12px',
            color: 'var(--color-text-primary)',
            fontSize: '0.875rem',
          }}
        />
        <Button
          data-testid="apply-coupon-btn"
          variant="secondary"
          size="sm"
          onClick={() => onCouponApply(inputCode.trim())}
        >
          Apply
        </Button>
      </div>

      <div style={{ width: '100%' }}>
        <Button
          data-testid="pay-now-btn"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          onClick={onPayNow}
          className="w-full justify-center"
        >
          {isLoading ? 'Processing…' : 'Pay Now'}
        </Button>
      </div>
    </div>
  );
}
