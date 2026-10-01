import React from 'react';
import Spinner from './Spinner';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
  children: React.ReactNode;
}

const sizeStyles: Record<NonNullable<ButtonProps['size']>, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: '0.875rem' },
  md: { padding: '8px 16px', fontSize: '0.875rem' },
  lg: { padding: '12px 24px', fontSize: '1rem' },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  className,
  style,
  'data-testid': dataTestId,
  children,
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '6px',
    fontWeight: 500,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.6 : 1,
    border: 'none',
    transition: 'background 0.15s, opacity 0.15s',
    pointerEvents: isLoading ? 'none' : undefined,
    ...sizeStyles[size],
  };

  const variantStyle: React.CSSProperties =
    variant === 'primary'
      ? {
          background: 'var(--color-accent)',
          color: '#fff',
        }
      : variant === 'secondary'
      ? {
          background: 'transparent',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        }
      : {
          background: 'transparent',
          border: 'none',
          color: 'var(--color-accent)',
          padding: sizeStyles[size].padding,
        };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={className}
      style={{ ...baseStyle, ...variantStyle, ...style }}
      data-testid={dataTestId}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
