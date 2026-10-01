import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import UserDropdown from './UserDropdown';

export default function Navbar() {
  const { totalItems, openDrawer } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        height: 56,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: 'var(--color-text-primary)',
          fontWeight: 700,
          fontSize: 18,
          textDecoration: 'none',
          flexShrink: 0,
        }}
      >
        {/* Grid icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        Book Worm
      </Link>

      {/* Center nav links */}
      <div
        style={{
          display: 'flex',
          gap: 28,
          marginLeft: 40,
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <Link
          to="/orders"
          style={{ color: 'var(--color-text-muted)', fontSize: 14, textDecoration: 'none' }}
        >
          My Orders
        </Link>
        <Link
          to="/wishlist"
          style={{ color: 'var(--color-text-muted)', fontSize: 14, textDecoration: 'none' }}
        >
          My Wishlist
        </Link>
        <Link
          to="/my-writers"
          style={{ color: 'var(--color-text-muted)', fontSize: 14, textDecoration: 'none' }}
        >
          My Writers
        </Link>
      </div>

      {/* Right side: cart + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
        {/* Cart icon with badge */}
        <button
          onClick={openDrawer}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-primary)',
            position: 'relative',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Open cart"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {totalItems > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -2,
                right: -4,
                backgroundColor: '#ef4444',
                color: '#fff',
                borderRadius: '50%',
                width: 16,
                height: 16,
                fontSize: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </button>

        {/* User icon + dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="User menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
          <UserDropdown isOpen={dropdownOpen} onClose={() => setDropdownOpen(false)} />
        </div>
      </div>
    </nav>
  );
}
