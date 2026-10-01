import apiClient from './client';
import type { Book } from '../types';

export async function getWishlist(): Promise<Book[]> {
  const { data } = await apiClient.get<Book[]>('/wishlist');
  return data;
}

export async function addToWishlist(bookId: string): Promise<void> {
  await apiClient.post('/wishlist', { bookId });
}

export async function removeFromWishlist(bookId: string): Promise<void> {
  await apiClient.delete(`/wishlist/${bookId}`);
}
