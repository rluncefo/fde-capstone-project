import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserDropdown({ isOpen, onClose }: UserDropdownProps) {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible fixed backdrop overlay to capture outside clicks reliably */}
      <div
        data-testid="user-dropdown-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 90,
          cursor: 'default',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: 8,
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          minWidth: 200,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 100,
          padding: '8px 0',
        }}
      >
      {isAuthenticated && user ? (
        <>
          <div
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 14 }}>
              {user.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
              {user.giftPoints} gift points
            </div>
          </div>
          <Link
            to="/orders"
            onClick={onClose}
            style={{
              display: 'block',
              padding: '10px 16px',
              color: 'var(--color-text-primary)',
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            My Orders
          </Link>
          <Link
            to="/wishlist"
            onClick={onClose}
            style={{
              display: 'block',
              padding: '10px 16px',
              color: 'var(--color-text-primary)',
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            My Wishlist
          </Link>
          <button
            onClick={() => { logout(); onClose(); }}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              color: 'var(--color-error)',
              fontSize: 14,
              cursor: 'pointer',
              borderTop: '1px solid var(--color-border)',
              marginTop: 4,
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <Link
          to="/login"
          onClick={onClose}
          style={{
            display: 'block',
            padding: '10px 16px',
            color: 'var(--color-accent)',
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          Login
        </Link>
      )}
      </div>
    </>
  );
}
