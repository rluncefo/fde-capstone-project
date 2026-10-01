import MainLayout from '../components/layout/MainLayout';

export default function MyWritersPage() {
  return (
    <MainLayout>
      <div
        style={{
          maxWidth: '800px',
          margin: '60px auto',
          padding: '0 20px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '48px 32px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: '0 0 16px 0',
            }}
          >
            My Writers
          </h1>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
              maxWidth: '480px',
              margin: '0 auto',
            }}
          >
            This feature is coming soon. Follow your favourite authors to get notified of new releases.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
