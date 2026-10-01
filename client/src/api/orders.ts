import apiClient from './client';
import type { Order, Address } from '../types';

export interface CreateOrderData {
  deliveryAddress: Address;
  couponCode?: string;
}

export async function getOrders(): Promise<Order[]> {
  const { data } = await apiClient.get<Order[]>('/orders');
  return data;
}

export async function createOrder(data: CreateOrderData): Promise<Order> {
  const { data: order } = await apiClient.post<Order>('/orders', data);
  return order;
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/orders/${id}`);
  return data;
}

export async function cancelOrder(id: string): Promise<Order> {
  const { data } = await apiClient.post<Order>(`/orders/${id}/cancel`);
  return data;
}

export async function validateCoupon(
  code: string
): Promise<{ discountAmount: number }> {
  const { data } = await apiClient.post<{ discountAmount: number }>(
    '/coupons/validate',
    { code }
  );
  return data;
}
