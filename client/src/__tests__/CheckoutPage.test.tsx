import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from 'react-router-dom';
import CheckoutPage from '../pages/CheckoutPage';

// Render MainLayout as a passthrough so the Navbar/CartDrawer don't
// pollute the DOM with duplicate text from the mock cart items.
vi.mock("../components/layout/MainLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ─────────────────────────────────────────────
// Types (mirrors the real shape used by CheckoutPage)
// ─────────────────────────────────────────────
interface CartItem {
  id: string;
  quantity: number;
  book: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string;
    price: number;
    format: string;
    author: { name: string };
    categories: { id: string; name: string; slug: string }[];
  };
}

// ─────────────────────────────────────────────
// Module mocks
// ─────────────────────────────────────────────

/**
 * useNavigate — assert navigation calls without a real history stack.
 */
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

/**
 * AuthContext — supply a minimal authenticated user.
 * Tests that need a savedAddress can mutate mockAuthState directly.
 */
const mockAuthState = {
  user: {
    id: "user-001",
    email: "test@bookworm.com",
    name: "Test User",
    savedAddress: null as null | Record<string, string>,
  },
};

vi.mock("../context/AuthContext", () => ({
  useAuth: () => mockAuthState,
}));

/**
 * CartContext — full mutable state object controlled per-test.
 */
const mockUpdateItem = vi.fn();
const mockRemoveItem = vi.fn();

const mockCartState = {
  items: [] as CartItem[],
  totalItems: 0,
  subtotal: 0,
  updateItem: mockUpdateItem,
  removeItem: mockRemoveItem,
};

vi.mock("../context/CartContext", () => ({
  useCart: () => mockCartState,
}));

/**
 * API calls — validateCoupon and createOrder must never hit the network.
 */
const mockValidateCoupon = vi.fn();
const mockCreateOrder = vi.fn();

vi.mock("../api/orders", () => ({
  validateCoupon: (...args: unknown[]) => mockValidateCoupon(...args),
  createOrder: (...args: unknown[]) => mockCreateOrder(...args),
}));

vi.mock("../components/ecommerce/PriceTag", () => ({
  default: ({ price }: { price: number }) => (
    <span data-testid="price-tag">${price.toFixed(2)}</span>
  ),
}));

vi.mock("../components/ecommerce/BookCard", () => ({
  getDeliveryDate: () => "Mon, 29 Sep",
}));

// ─────────────────────────────────────────────
// Test fixtures
// ─────────────────────────────────────────────
const MOCK_CART_ITEM: CartItem = {
  id: "item-001",
  quantity: 1,
  book: {
    id: "book-001",
    title: "The Joy of Minimalism",
    slug: "joy-of-minimalism",
    coverUrl: "https://example.com/cover.jpg",
    price: 12.99,
    format: "PAPERBACK",
    author: { name: "Leo Babauta" },
    categories: [{ id: "cat-001", name: "Self Help", slug: "self-help" }],
  },
};

// ─────────────────────────────────────────────
// Render helper
// ─────────────────────────────────────────────
function renderCheckoutPage() {
  return render(
    <MemoryRouter>
      <CheckoutPage />
    </MemoryRouter>
  );
}

/**
 * Fills every required address field so isAddressValid === true.
 * Call this before testing Pay Now submission behaviour.
 */
async function fillAddressForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("John"), "Test");
  await user.type(screen.getByPlaceholderText("Doe"), "User");
  await user.type(
    screen.getByPlaceholderText("123 Main St, Apt 4B"),
    "123 Test Street"
  );
  await user.type(
    screen.getByPlaceholderText("john.doe@example.com"),
    "test@bookworm.com"
  );
  await user.type(screen.getByPlaceholderText("New York"), "Reading");
  await user.type(screen.getByPlaceholderText("10001"), "12345");
  await user.type(screen.getByPlaceholderText("555-0199"), "5550001234");
  await user.type(screen.getByPlaceholderText("NY"), "CA");
  // Country defaults to "United States" — already valid, no need to type
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset to safe baseline before every test
    mockCartState.items = [];
    mockCartState.totalItems = 0;
    mockCartState.subtotal = 0;
    mockAuthState.user.savedAddress = null;
  });

  describe("when cart has no items", () => {

    beforeEach(() => {
      mockCartState.items = [];
    });

    it("shows the empty cart message", () => {
      renderCheckoutPage();

      expect(
        screen.getByText("Your cart is empty. Add books before checking out.")
      ).toBeTruthy();
    });

    it("does not render the checkout form", () => {
      renderCheckoutPage();

      // Address fields must be absent when cart is empty
      expect(screen.queryByPlaceholderText("John")).toBeNull();
      expect(screen.queryByPlaceholderText("Doe")).toBeNull();
      expect(screen.queryByTestId("pay-now-btn")).toBeNull();
    });

    it("does not render the Review Items section", () => {
      renderCheckoutPage();

      expect(screen.queryByText(/Review Items/)).toBeNull();
    });

    it("renders the page heading regardless of cart state", () => {
      renderCheckoutPage();

      expect(screen.getByRole("heading", { name: "Checkout" })).toBeTruthy();
    });
  });

  describe("Pay Now button", () => {
    beforeEach(() => {
      mockCartState.items = [MOCK_CART_ITEM];
      mockCartState.totalItems = 1;
      mockCartState.subtotal = 12.99;
    });

    it("does not call createOrder when address fields are empty", async () => {
      const user = userEvent.setup();
      renderCheckoutPage();

      // All address fields are empty by default — click Pay Now
      await user.click(screen.getByTestId("pay-now-btn"));

      // createOrder must not be called with an invalid address
      expect(mockCreateOrder).not.toHaveBeenCalled();
    });

    it("shows a form error when createOrder rejects", async () => {
      const user = userEvent.setup();
      mockCreateOrder.mockRejectedValueOnce({
        response: { data: { message: "Payment method not supported." } },
      });

      renderCheckoutPage();
      await fillAddressForm(user);
      await user.click(screen.getByTestId("pay-now-btn"));

      await waitFor(() => {
        expect(
          screen.getByText("Payment method not supported.")
        ).toBeTruthy();
      });
    });

    it("shows fallback error text when createOrder rejects with no message", async () => {
      const user = userEvent.setup();
      mockCreateOrder.mockRejectedValueOnce(new Error("Network Error"));

      renderCheckoutPage();
      await fillAddressForm(user);
      await user.click(screen.getByTestId("pay-now-btn"));

      await waitFor(() => {
        expect(
          screen.getByText("Failed to create order. Please try again.")
        ).toBeTruthy();
      });
    });

    it("shows 'Processing…' label while order is being created", async () => {
      const user = userEvent.setup();

      // Never resolves — keeps isSubmitting=true indefinitely
      mockCreateOrder.mockReturnValueOnce(new Promise(() => {}));

      renderCheckoutPage();
      await fillAddressForm(user);
      await user.click(screen.getByTestId("pay-now-btn"));

      await waitFor(() => {
        expect(screen.getByText("Processing…")).toBeTruthy();
      });
    });
  });

  describe("coupon code application", () => {
    beforeEach(() => {
      mockCartState.items = [MOCK_CART_ITEM];
      mockCartState.totalItems = 1;
      mockCartState.subtotal = 12.99;
    });

    it("shows discount amount after applying a valid coupon", async () => {
      const user = userEvent.setup();
      mockValidateCoupon.mockResolvedValueOnce({
        valid: true,
        discountAmount: 1.0,
      });

      renderCheckoutPage();

      await user.type(screen.getByTestId("coupon-input"), "DISCOUNT100");
      await user.click(screen.getByTestId("apply-coupon-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("discount-amount")).toBeTruthy();
        expect(screen.getByTestId("discount-amount").textContent).toContain(
          "$1.00"
        );
      });
    });

    it("calls validateCoupon with the entered code", async () => {
      const user = userEvent.setup();
      mockValidateCoupon.mockResolvedValueOnce({
        valid: true,
        discountAmount: 1.0,
      });

      renderCheckoutPage();

      await user.type(screen.getByTestId("coupon-input"), "DISCOUNT100");
      await user.click(screen.getByTestId("apply-coupon-btn"));

      await waitFor(() => {
        expect(mockValidateCoupon).toHaveBeenCalledWith("DISCOUNT100");
      });
    });

    it("shows 'Invalid coupon code' error for an unknown code", async () => {
      const user = userEvent.setup();
      mockValidateCoupon.mockRejectedValueOnce(new Error("Not found"));

      renderCheckoutPage();

      await user.type(screen.getByTestId("coupon-input"), "FAKECODE");
      await user.click(screen.getByTestId("apply-coupon-btn"));

      await waitFor(() => {
        expect(screen.getByText("Invalid coupon code")).toBeTruthy();
      });
    });

    it("does not show discount section before a coupon is applied", () => {
      renderCheckoutPage();
      expect(screen.queryByTestId("discount-amount")).toBeNull();
    });

    it("clears coupon error when a valid coupon is applied after a failed attempt", async () => {
      const user = userEvent.setup();

      // First attempt — invalid
      mockValidateCoupon.mockRejectedValueOnce(new Error("Not found"));
      renderCheckoutPage();

      await user.type(screen.getByTestId("coupon-input"), "FAKECODE");
      await user.click(screen.getByTestId("apply-coupon-btn"));

      await waitFor(() => {
        expect(screen.getByText("Invalid coupon code")).toBeTruthy();
      });

      // Second attempt — valid
      mockValidateCoupon.mockResolvedValueOnce({
        valid: true,
        discountAmount: 1.0,
      });

      // Clear input and type valid code
      await user.clear(screen.getByTestId("coupon-input"));
      await user.type(screen.getByTestId("coupon-input"), "DISCOUNT100");
      await user.click(screen.getByTestId("apply-coupon-btn"));

      await waitFor(() => {
        expect(screen.queryByText("Invalid coupon code")).toBeNull();
        expect(screen.getByTestId("discount-amount")).toBeTruthy();
      });
    });
  });

  describe("cart items section", () => {

    beforeEach(() => {
      mockCartState.items = [MOCK_CART_ITEM];
      mockCartState.totalItems = 1;
      mockCartState.subtotal = 12.99;
    });

    it("renders the book title in the review section", () => {
      renderCheckoutPage();
      expect(screen.getByText("The Joy of Minimalism")).toBeTruthy();
    });

    it("renders the author name prefixed with 'by'", () => {
      renderCheckoutPage();
      expect(screen.getByText("by Leo Babauta")).toBeTruthy();
    });

    it("renders the item count in the Review Items heading", () => {
      renderCheckoutPage();
      expect(screen.getByText("Review Items (1)")).toBeTruthy();
    });

    it("renders the line item total price", () => {
      renderCheckoutPage();
      // 12.99 * 1 = $12.99 — may appear multiple times (PriceTag + line total)
      expect(screen.getAllByText("$12.99").length).toBeGreaterThanOrEqual(1);
    });

    it("renders the delivery date string", () => {
      renderCheckoutPage();
      expect(screen.getByText("Delivery by Mon, 29 Sep")).toBeTruthy();
    });

    it("calls removeItem when Remove button is clicked", async () => {
      const user = userEvent.setup();
      renderCheckoutPage();

      await user.click(screen.getByRole("button", { name: /remove/i }));

      expect(mockRemoveItem).toHaveBeenCalledWith(MOCK_CART_ITEM.id);
    });
  });

  describe("saved address toggle", () => {
    it("does not render the saved address checkbox when user has no savedAddress", () => {
      mockCartState.items = [MOCK_CART_ITEM];
      mockAuthState.user.savedAddress = null;
      renderCheckoutPage();

      expect(screen.queryByLabelText(/use saved address/i)).toBeNull();
    });

    it("renders the saved address checkbox when user has a savedAddress", () => {
      mockCartState.items = [MOCK_CART_ITEM];
      mockAuthState.user.savedAddress = {
        firstName: "Test",
        lastName: "User",
        address: "123 Saved St",
        city: "SavedCity",
        pin: "99999",
        state: "SC",
        country: "United States",
        email: "test@bookworm.com",
        phone: "5559990000",
      };
      renderCheckoutPage();

      expect(screen.getByLabelText(/use saved address/i)).toBeTruthy();
    });

    it("populates address fields when saved address checkbox is checked", async () => {
      const user = userEvent.setup();
      mockCartState.items = [MOCK_CART_ITEM];
      mockAuthState.user.savedAddress = {
        firstName: "Saved",
        lastName: "Person",
        address: "99 Persisted Ave",
        city: "Storeville",
        pin: "77777",
        state: "SP",
        country: "United States",
        email: "saved@bookworm.com",
        phone: "5551112222",
      };

      renderCheckoutPage();

      await user.click(screen.getByLabelText(/use saved address/i));

      // The saved address must now populate the form inputs
      expect(
        (screen.getByPlaceholderText("John") as HTMLInputElement).value
      ).toBe("Saved");
      expect(
        (screen.getByPlaceholderText("Doe") as HTMLInputElement).value
      ).toBe("Person");
      expect(
        (screen.getByPlaceholderText("New York") as HTMLInputElement).value
      ).toBe("Storeville");
    });
  });
});
