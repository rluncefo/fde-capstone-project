import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { getWishlist, removeFromWishlist } from '../api/wishlist';
import { useCart } from '../context/CartContext';
import type { Book } from '../types';
import BookCard from '../components/ecommerce/BookCard';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

// The API returns WishlistItem[] — each has { id, bookId, book: Book, ... }
interface WishlistItem {
  id: string;
  bookId: string;
  book: Book;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { addItem, openDrawer } = useCart();

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getWishlist() as unknown as WishlistItem[];
      setWishlist(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load wishlist.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleAddToCart = async (book: Book, bookId: string) => {
    try {
      setActionLoadingId(bookId);
      await addItem(bookId, 1);
      setFeedback(`Added "${book.title}" to cart!`);
      openDrawer();
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setError('Failed to add book to cart.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemove = async (wishlistItemId: string, bookId: string) => {
    try {
      setActionLoadingId(wishlistItemId);
      await removeFromWishlist(bookId);
      await fetchWishlist();
    } catch {
      setError('Failed to remove from wishlist.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <MainLayout>
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 20px',
        }}
      >
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            marginBottom: '24px',
            color: 'var(--color-text-primary)',
          }}
        >
          My Wishlist
        </h1>

        {feedback && (
          <div
            style={{
              marginBottom: '20px',
              padding: '10px 16px',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid var(--color-success)',
              borderRadius: '6px',
              color: 'var(--color-success)',
              fontSize: '0.875rem',
            }}
          >
            {feedback}
          </div>
        )}

        {error && (
          <div
            style={{
              marginBottom: '20px',
              padding: '10px 16px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--color-error)',
              borderRadius: '6px',
              color: 'var(--color-error)',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        {isLoading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '64px',
            }}
          >
            <Spinner />
          </div>
        ) : wishlist.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 20px',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
            }}
          >
            <p
              style={{
                fontSize: '1.125rem',
                color: 'var(--color-text-muted)',
                marginBottom: '20px',
              }}
            >
              Your wishlist is empty
            </p>
            <Link to="/">
              <Button variant="primary">Browse Books</Button>
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {wishlist.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <BookCard book={item.book} />
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'flex-end',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    isLoading={actionLoadingId === item.id}
                    onClick={() => handleRemove(item.id, item.bookId)}
                    style={{ color: 'var(--color-error)' }}
                  >
                    Remove
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={actionLoadingId === item.id}
                    onClick={() => handleAddToCart(item.book, item.bookId)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
