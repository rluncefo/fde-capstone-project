import React from 'react';

export interface FilterState {
  language: string;
  format: string;
  priceRange: string;
  sort: string;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (f: Partial<FilterState>) => void;
}

const selectStyle: React.CSSProperties = {
  background: 'var(--color-bg-secondary)',
  color: 'var(--color-text-primary)',
  border: '1px solid var(--color-border)',
  borderRadius: '6px',
  padding: '6px 10px',
  fontSize: '0.8125rem',
  cursor: 'pointer',
  flex: 1,
  minWidth: 0,
};

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <select
        value={filters.language}
        onChange={(e) => onChange({ language: e.target.value })}
        style={selectStyle}
        aria-label="Language"
      >
        <option value="">Language</option>
        <option value="English">English</option>
        <option value="Spanish">Spanish</option>
        <option value="French">French</option>
        <option value="German">German</option>
      </select>

      <select
        value={filters.format}
        onChange={(e) => onChange({ format: e.target.value })}
        style={selectStyle}
        aria-label="Format"
      >
        <option value="">Format</option>
        <option value="PAPERBACK">Paperback</option>
        <option value="HARDCOVER">Hardcover</option>
        <option value="EBOOK">eBook</option>
      </select>

      <select
        value={filters.priceRange}
        onChange={(e) => onChange({ priceRange: e.target.value })}
        style={selectStyle}
        aria-label="Price Range"
      >
        <option value="">Price Range</option>
        <option value="under5">Under $5</option>
        <option value="5to10">$5 – $10</option>
        <option value="over10">Over $10</option>
      </select>

      <select
        value={filters.sort}
        onChange={(e) => onChange({ sort: e.target.value })}
        style={selectStyle}
        aria-label="Sort By"
      >
        <option value="">Sort By</option>
        <option value="price_asc">Price Low–High</option>
        <option value="price_desc">Price High–Low</option>
        <option value="rating">Rating</option>
        <option value="newest">Newest</option>
      </select>
    </div>
  );
}
