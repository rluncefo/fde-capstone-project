import apiClient from './client';
import type { Book, Category } from '../types';

export interface BookListParams {
  category?: string;
  format?: string;
  language?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface BookListResponse {
  books: Book[];
  total: number;
  page: number;
  limit: number;
}

export async function getBooks(params: BookListParams): Promise<Book[]> {
  const { data } = await apiClient.get<BookListResponse>('/books', { params });
  // API returns { books, total, page, limit } — extract the array
  return Array.isArray(data) ? data : (data.books ?? []);
}

export async function getBook(slug: string): Promise<Book> {
  const { data } = await apiClient.get<Book>(`/books/${slug}`);
  return data;
}

export async function getRelatedBooks(slug: string): Promise<Book[]> {
  const { data } = await apiClient.get<Book[]>(`/books/${slug}/related`);
  return data;
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>('/categories');
  return data;
}
