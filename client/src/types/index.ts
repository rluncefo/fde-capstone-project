export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  giftPoints: number;
  savedAddress?: Address | null;
}

export interface Address {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  pin: string;
  state: string;
  country: string;
  email: string;
  phone: string;
}

export interface Author {
  id: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Book {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverUrl: string;
  price: number;
  format: 'PAPERBACK' | 'HARDCOVER' | 'EBOOK';
  language: string;
  stockCount: number;
  authorId: string;
  author: Author;
  rating: number;
  salesCount: number;
  isRecommended: boolean;
  isBestseller: boolean;
  isNewLaunch: boolean;
  createdAt: string;
  categories: Category[];
  reviews?: Review[];
}

export interface CartItem {
  id: string;
  bookId: string;
  quantity: number;
  book: Book;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  content: string;
  createdAt: string;
  user: { id: string; name: string };
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  tax: number;
  discount: number;
  deliveryAddress: Address;
  couponCode?: string;
  createdAt: string;
  items: OrderItem[];
  payment?: Payment;
}

export interface OrderItem {
  id: string;
  orderId: string;
  bookId: string;
  quantity: number;
  priceAtTime: number;
  book: Book;
}

export interface Payment {
  id: string;
  orderId: string;
  method: string;
  status: string;
  amount: number;
  transactionRef?: string;
  createdAt: string;
}
