import apiClient from './client';
import type { Payment } from '../types';

export interface CardDetails {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
}

export async function processPayment(
  orderId: string,
  method: string,
  cardDetails?: CardDetails
): Promise<Payment> {
  const { data } = await apiClient.post<Payment>('/payments', {
    orderId,
    method,
    cardDetails,
  });
  return data;
}
