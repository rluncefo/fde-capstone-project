import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md';
}

const sizePx = { sm: 16, md: 22 };

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const px = sizePx[size];
  const display = hovered !== null ? hovered : value;

  return (
    <span style={{ display: 'inline-flex', gap: '2px', lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = display >= star;
        const half = !filled && display >= star - 0.5;
        return (
          <span
            key={star}
            onClick={!readonly && onChange ? () => onChange(star) : undefined}
            onMouseEnter={!readonly ? () => setHovered(star) : undefined}
            onMouseLeave={!readonly ? () => setHovered(null) : undefined}
            style={{
              cursor: readonly ? 'default' : 'pointer',
              fontSize: px,
              display: 'inline-block',
              position: 'relative',
              width: px,
              height: px,
              lineHeight: `${px}px`,
            }}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          >
            {/* Background (empty) star */}
            <span style={{ color: 'var(--color-border)', position: 'absolute', left: 0, top: 0 }}>
              ★
            </span>
            {/* Filled overlay */}
            {(filled || half) && (
              <span
                style={{
                  color: '#f59e0b',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  overflow: 'hidden',
                  width: filled ? '100%' : '50%',
                }}
              >
                ★
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
