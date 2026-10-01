interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 16,
  md: 32,
  lg: 48,
};

export default function Spinner({ size = 'md' }: SpinnerProps) {
  const px = sizeMap[size];
  return (
    <div
      style={{
        width: px,
        height: px,
        borderRadius: '50%',
        border: `3px solid var(--color-border)`,
        borderTopColor: 'var(--color-accent)',
        animation: 'spin 0.7s linear infinite',
        display: 'inline-block',
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
