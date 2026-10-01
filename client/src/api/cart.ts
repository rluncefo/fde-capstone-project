import apiClient from './client';
import type { Cart } from '../types';

export async function getCart(): Promise<Cart> {
  const { data } = await apiClient.get<Cart>('/cart');
  return data;
}

export async function addToCart(bookId: string, quantity: number): Promise<Cart> {
  const { data } = await apiClient.post<Cart>('/cart', { bookId, quantity });
  return data;
}

export async function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  const { data } = await apiClient.patch<Cart>(`/cart/${itemId}`, { quantity });
  return data;
}

export async function removeFromCart(itemId: string): Promise<Cart> {
  const { data } = await apiClient.delete<Cart>(`/cart/${itemId}`);
  return data;
}
