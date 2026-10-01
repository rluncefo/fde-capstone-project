import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder, validateCoupon } from '../api/orders';
import type { Address } from '../types';
import QuantitySelector from '../components/ecommerce/QuantitySelector';
import OrderSummary from '../components/ecommerce/OrderSummary';
import Badge from '../components/ui/Badge';
import PriceTag from '../components/ecommerce/PriceTag';
import { getDeliveryDate } from '../components/ecommerce/BookCard';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [address, setAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    pin: '',
    state: '',
    country: 'United States',
    email: '',
    phone: '',
  });

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSavedAddressToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setUseSavedAddress(checked);
    if (checked && user?.savedAddress) {
      setAddress({
        firstName: user.savedAddress.firstName || '',
        lastName: user.savedAddress.lastName || '',
        address: user.savedAddress.address || '',
        city: user.savedAddress.city || '',
        pin: user.savedAddress.pin || '',
        state: user.savedAddress.state || '',
        country: user.savedAddress.country || 'United States',
        email: user.savedAddress.email || user.email || '',
        phone: user.savedAddress.phone || '',
      });
    }
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleCouponApply = async (code: string) => {
    if (!code) {
      setCouponCode('');
      setDiscount(0);
      setCouponError('');
      return;
    }
    try {
      setCouponError('');
      const res = await validateCoupon(code);
      setCouponCode(code);
      setDiscount(res.discountAmount);
    } catch {
      setDiscount(0);
      setCouponError('Invalid coupon code');
    }
  };

  const isAddressValid = Boolean(
    address.firstName.trim() &&
    address.lastName.trim() &&
    address.address.trim() &&
    address.city.trim() &&
    address.pin.trim() &&
    address.state.trim() &&
    address.country.trim() &&
    address.email.trim() &&
    address.phone.trim()
  );

  const handlePayNow = async () => {
    if (!isAddressValid) {
      setFormError('Please fill in all address fields before proceeding.');
      return;
    }
    if (items.length === 0) {
      setFormError('Your cart is empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');
      const order = await createOrder({
        deliveryAddress: address,
        couponCode: couponCode || undefined,
      });

      navigate('/payment', {
        state: {
          orderId: order.id,
          items: order.items,
          totalAmount: order.totalAmount,
        },
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setFormError(error.response?.data?.message || 'Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
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
          maxWidth: '1200px',
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
          Checkout
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
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem' }}>
              Your cart is empty. Add books before checking out.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Top section: Cart items summary */}
            <div
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '24px',
              }}
            >
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  marginBottom: '20px',
                  color: 'var(--color-text-primary)',
                }}
              >
                Review Items ({items.length})
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {items.map((item) => {
                  const visibleCategories = item.book.categories?.slice(0, 2) || [];
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        gap: '16px',
                        paddingBottom: '20px',
                        borderBottom: '1px solid var(--color-border)',
                        alignItems: 'flex-start',
                      }}
                    >
                      <img
                        src={item.book.coverUrl || 'https://placehold.co/96x128/0f3460/94a3b8?text=Book'}
                        alt={item.book.title}
                        style={{
                          width: 80,
                          height: 110,
                          objectFit: 'cover',
                          borderRadius: '4px',
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3
                          style={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            margin: '0 0 4px 0',
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          {item.book.title}
                        </h3>
                        <div
                          style={{
                            fontSize: '0.8125rem',
                            color: 'var(--color-accent)',
                            marginBottom: '4px',
                          }}
                        >
                          by {item.book.author?.name ?? 'Unknown'}
                        </div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-text-muted)',
                            marginBottom: '6px',
                          }}
                        >
                          {item.book.format
                            ? item.book.format.charAt(0) + item.book.format.slice(1).toLowerCase()
                            : 'Paperback'}
                        </div>
                        {visibleCategories.length > 0 && (
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            {visibleCategories.map((cat) => (
                              <Badge key={cat.id} label={cat.name} />
                            ))}
                          </div>
                        )}
                        <PriceTag price={item.book.price} />
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-text-muted)',
                            marginTop: '4px',
                          }}
                        >
                          Delivery by {getDeliveryDate()}
                        </div>

                        {/* Quantity Controls */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            marginTop: '12px',
                          }}
                        >
                          <QuantitySelector
                            value={item.quantity}
                            onChange={(newQty) => updateItem(item.id, newQty)}
                          />
                          <button
                            onClick={() => removeItem(item.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-text-muted)',
                              cursor: 'pointer',
                              fontSize: '0.8125rem',
                              textDecoration: 'underline',
                              padding: 0,
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '1.125rem',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        ${(item.book.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom section: Address form + Order Summary */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
                gap: '32px',
                alignItems: 'flex-start',
              }}
            >
              {/* Bottom left: Address form */}
              <div
                style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '24px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                  }}
                >
                  <h2
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      margin: 0,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    Address
                  </h2>

                  {user?.savedAddress && (
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.875rem',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={useSavedAddress}
                        onChange={handleSavedAddressToggle}
                        style={{ cursor: 'pointer', accentColor: 'var(--color-accent)' }}
                      />
                      Use Saved Address
                    </label>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* First Name + Last Name */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={address.firstName}
                        onChange={(e) => handleAddressChange('firstName', e.target.value)}
                        placeholder="John"
                        style={inputStyle}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={address.lastName}
                        onChange={(e) => handleAddressChange('lastName', e.target.value)}
                        placeholder="Doe"
                        style={inputStyle}
                        required
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                      Address *
                    </label>
                    <input
                      type="text"
                      value={address.address}
                      onChange={(e) => handleAddressChange('address', e.target.value)}
                      placeholder="123 Main St, Apt 4B"
                      style={inputStyle}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={address.email}
                      onChange={(e) => handleAddressChange('email', e.target.value)}
                      placeholder="john.doe@example.com"
                      style={inputStyle}
                      required
                    />
                  </div>

                  {/* City + Pin */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                        City *
                      </label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        placeholder="New York"
                        style={inputStyle}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                        Pin / Zip Code *
                      </label>
                      <input
                        type="text"
                        value={address.pin}
                        onChange={(e) => handleAddressChange('pin', e.target.value)}
                        placeholder="10001"
                        style={inputStyle}
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                      Phone Number *
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 12px',
                          backgroundColor: 'var(--color-bg-card)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '6px',
                          color: 'var(--color-text-muted)',
                          fontSize: '0.875rem',
                        }}
                      >
                        +1
                      </span>
                      <input
                        type="tel"
                        value={address.phone}
                        onChange={(e) => handleAddressChange('phone', e.target.value)}
                        placeholder="555-0199"
                        style={inputStyle}
                        required
                      />
                    </div>
                  </div>

                  {/* State + Country */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                        State *
                      </label>
                      <input
                        type="text"
                        value={address.state}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        placeholder="NY"
                        style={inputStyle}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                        Country *
                      </label>
                      <input
                        type="text"
                        value={address.country}
                        onChange={(e) => handleAddressChange('country', e.target.value)}
                        placeholder="United States"
                        style={inputStyle}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom right: OrderSummary */}
              <div>
                <OrderSummary
                  items={items}
                  couponCode={couponCode}
                  discount={discount}
                  onCouponApply={handleCouponApply}
                  onPayNow={handlePayNow}
                  isLoading={isSubmitting}
                />
                {couponError && (
                  <p
                    style={{
                      marginTop: '8px',
                      color: 'var(--color-error)',
                      fontSize: '0.8125rem',
                    }}
                  >
                    {couponError}
                  </p>
                )}
                {formError && (
                  <p
                    style={{
                      marginTop: '12px',
                      color: 'var(--color-error)',
                      fontSize: '0.875rem',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid var(--color-error)',
                      borderRadius: '6px',
                    }}
                  >
                    {formError}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
