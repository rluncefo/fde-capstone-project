interface BadgeProps {
  label: string;
  onClick?: () => void;
  variant?: 'genre' | 'status';
}

const statusColors: Record<string, { background: string; color: string }> = {
  CONFIRMED: { background: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  DELIVERED: { background: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  PENDING: { background: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  CANCELLED: { background: 'rgba(239,68,68,0.15)', color: '#ef4444' },
};

export default function Badge({ label, onClick, variant = 'genre' }: BadgeProps) {
  if (variant === 'status') {
    const colors = statusColors[label.toUpperCase()] ?? {
      background: 'rgba(148,163,184,0.15)',
      color: 'var(--color-text-muted)',
    };
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '2px 10px',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 500,
          ...colors,
        }}
      >
        {label}
      </span>
    );
  }

  return (
    <span
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        background: 'var(--color-bg-card)',
        color: 'var(--color-accent)',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      {label}
    </span>
  );
}
