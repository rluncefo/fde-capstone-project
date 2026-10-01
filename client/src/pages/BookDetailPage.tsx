import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Book, Review } from '../types';
import { getBook, getRelatedBooks } from '../api/books';
import { addToWishlist } from '../api/wishlist';
import apiClient from '../api/client';
import { MainLayout } from '../components/layout';
import { Breadcrumb, Button, StarRating, Badge } from '../components/ui';
import { BookCard, PriceTag, getDeliveryDate } from '../components/ecommerce';
import { useCart } from '../context/CartContext';

// ─── Review form ────────────────────────────────────────────────────────────

interface ReviewFormProps {
  slug: string;
  onSubmitted: () => void;
}

function ReviewForm({ slug, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { setError('Please select a star rating.'); return; }
    setLoading(true);
    setError('');
    try {
      await apiClient.post(`/books/${slug}/reviews`, { rating, content });
      setRating(0);
      setContent('');
      onSubmitted();
    } catch {
      setError('Failed to submit review. Are you logged in?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <label style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
          Your Rating
        </label>
        <StarRating value={rating} onChange={setRating} size="md" />
      </div>
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 100))}
          placeholder="Write your review… (max 100 characters)"
          rows={3}
          style={{
            width: '100%',
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            padding: '8px 12px',
            color: 'var(--color-text-primary)',
            fontSize: '0.875rem',
            resize: 'vertical',
          }}
        />
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
          {content.length}/100
        </div>
      </div>
      {error && <div style={{ color: 'var(--color-error)', fontSize: '0.8rem' }}>{error}</div>}
      <Button type="submit" variant="primary" size="sm" isLoading={loading}>
        Submit Review
      </Button>
    </form>
  );
}

// ─── Review list ─────────────────────────────────────────────────────────────

function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No reviews yet.</p>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {reviews.map((r) => (
        <div
          key={r.id}
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '14px 16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.user?.name ?? 'Anonymous'}</span>
            <StarRating value={r.rating} readonly size="sm" />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
              {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{r.content}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function BookDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();

  const [book, setBook] = useState<Book | null>(null);
  const [related, setRelated] = useState<Book[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [cartMsg, setCartMsg] = useState('');
  const [wishMsg, setWishMsg] = useState('');

  async function fetchBook() {
    if (!slug) return;
    setLoading(true);
    try {
      const b = await getBook(slug);
      setBook(b);
      setReviews(b.reviews ?? []);
    } catch {
      setBook(null);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRelated() {
    if (!slug) return;
    try {
      const r = await getRelatedBooks(slug);
      setRelated(r);
    } catch {
      setRelated([]);
    }
  }

  async function fetchReviews() {
    if (!slug) return;
    try {
      const { data } = await apiClient.get<Review[]>(`/books/${slug}/reviews`);
      setReviews(data);
    } catch {
      // keep existing
    }
  }

  useEffect(() => {
    fetchBook();
    fetchRelated();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function handleAddToCart() {
    if (!book) return;
    try {
      await addItem(book.id, 1);
      setCartMsg('Added to cart!');
      setTimeout(() => setCartMsg(''), 2500);
    } catch {
      setCartMsg('Please log in to add to cart.');
      setTimeout(() => setCartMsg(''), 2500);
    }
  }

  async function handleAddToWishlist() {
    if (!book) return;
    try {
      await addToWishlist(book.id);
      setWishMsg('Added to wishlist!');
      setTimeout(() => setWishMsg(''), 2500);
    } catch {
      setWishMsg('Please log in to use wishlist.');
      setTimeout(() => setWishMsg(''), 2500);
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading book…
        </div>
      </MainLayout>
    );
  }

  if (!book) {
    return (
      <MainLayout>
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Book not found.
        </div>
      </MainLayout>
    );
  }

  const firstCategory = book.categories[0];
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    ...(firstCategory ? [{ label: firstCategory.name, href: `/?category=${firstCategory.slug}` }] : []),
    { label: book.title },
  ];

  return (
    <MainLayout>
      <div
        style={{
          display: 'flex',
          gap: '32px',
          padding: '24px',
          alignItems: 'flex-start',
        }}
      >
        {/* ── Left column ── */}
        <div style={{ flex: '0 0 65%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} />

          {/* Cover + blurb */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            <img
              src={book.coverUrl || 'https://placehold.co/200x270/0f3460/94a3b8?text=Book'}
              alt={book.title}
              style={{ width: 200, minWidth: 200, borderRadius: '8px', objectFit: 'cover' }}
            />
            <div style={{ flex: 1 }}>
              {/* Title */}
              <h1 style={{ margin: '0 0 6px 0', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3 }}>
                {book.title}
              </h1>

              {/* Author */}
              <div style={{ marginBottom: '10px', color: 'var(--color-accent)', fontSize: '0.9rem' }}>
                by {book.author?.name ?? 'Unknown Author'}
              </div>

              {/* Description */}
              <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                {book.description}
              </p>

              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                Published by: ABC Publishers
              </div>

              {/* Format + categories */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <Badge label={book.format} />
                {book.categories.map((cat) => (
                  <Badge key={cat.id} label={cat.name} />
                ))}
              </div>

              {/* Price */}
              <div style={{ marginBottom: '8px' }}>
                <PriceTag price={book.price} />
              </div>

              {/* Delivery */}
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
                Delivery by {getDeliveryDate()}
              </div>

              {/* CTA buttons */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <Button variant="primary" size="md" onClick={handleAddToCart}>
                  Add to Cart
                </Button>
                <Button variant="secondary" size="md" onClick={handleAddToWishlist}>
                  ♡ Wishlist
                </Button>
              </div>
              {cartMsg && (
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--color-success)' }}>{cartMsg}</div>
              )}
              {wishMsg && (
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--color-success)' }}>{wishMsg}</div>
              )}

              {/* Metadata row */}
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  marginTop: '14px',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-muted)',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <span>{book.language}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <StarRating value={book.rating} readonly size="sm" />
                  <span>{book.rating?.toFixed(1)}</span>
                </span>
                <span>{book.salesCount?.toLocaleString()} copies sold</span>
              </div>
            </div>
          </div>

          {/* About the writer */}
          {book.author && (
            <section>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>About the Writer</h2>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                {book.author.avatarUrl ? (
                  <img
                    src={book.author.avatarUrl}
                    alt={book.author.name}
                    style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: 'var(--color-bg-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      color: 'var(--color-text-muted)',
                      flexShrink: 0,
                    }}
                  >
                    {book.author.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{book.author.name}</div>
                  {book.author.bio && (
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                      {book.author.bio}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Reviews */}
          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Reviews</h2>
            <div
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
              }}
            >
              <h3 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 600 }}>Write a Review</h3>
              <ReviewForm slug={slug!} onSubmitted={fetchReviews} />
            </div>
            <ReviewList reviews={reviews} />
          </section>
        </div>

        {/* ── Right column (sticky) ── */}
        <div style={{ flex: '0 0 35%', minWidth: 0, position: 'sticky', top: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Related Reads</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {related.length === 0 && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No related books.</p>
            )}
            {related.slice(0, 5).map((b) => (
              <BookCard key={b.id} book={b} size="compact" />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
