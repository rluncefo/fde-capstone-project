import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search books, authors…',
  onSubmit,
}: SearchBarProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') onSubmit?.();
  }

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '8px 40px 8px 14px',
          color: 'var(--color-text-primary)',
          fontSize: '0.9rem',
          outline: 'none',
        }}
      />
      <button
        onClick={onSubmit}
        style={{
          position: 'absolute',
          right: '10px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-muted)',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
        }}
        aria-label="Search"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </div>
  );
}
