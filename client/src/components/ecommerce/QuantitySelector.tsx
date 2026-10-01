import React from 'react';

interface QuantitySelectorProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

const btnStyle = (disabled: boolean): React.CSSProperties => ({
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--color-bg-card)',
  border: '1px solid var(--color-border)',
  color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
  borderRadius: '4px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: '1rem',
  fontWeight: 600,
  opacity: disabled ? 0.5 : 1,
  userSelect: 'none',
});

export default function QuantitySelector({ value, onChange, min = 1, max = 99 }: QuantitySelectorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        style={btnStyle(value <= min)}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span
        style={{
          minWidth: 28,
          textAlign: 'center',
          fontWeight: 600,
          fontSize: '0.9rem',
        }}
      >
        {value}
      </span>
      <button
        style={btnStyle(value >= max)}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
