import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from 'react-router-dom';
import CartDrawer from '../components/layout/CartDrawer';

// ─────────────────────────────────────────────
// Module mocks
// ─────────────────────────────────────────────

/**
 * Mock useNavigate so we can assert navigation calls without
 * spinning up a full router history stack.
 */
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,                        // keep MemoryRouter, Link, etc. real
    useNavigate: () => mockNavigate,  // only replace useNavigate
  };
});

/**
 * Mock CartContext so CartDrawer renders without a real provider
 * and so each test controls exactly what state the drawer sees.
 *
 * mockCartState is mutated in beforeEach / per-test overrides,
 * then read by the mock implementation on every render.
 */
const mockCloseDrawer = vi.fn();

const mockCartState = {
  items: [] as CartItem[],
  totalItems: 0,
  subtotal: 0,
  isDrawerOpen: false,
  closeDrawer: mockCloseDrawer,
};

vi.mock("../context/CartContext", () => ({
  useCart: () => mockCartState,
}));

// ─────────────────────────────────────────────
// Types (mirrors the real CartContext shape)
// ─────────────────────────────────────────────
interface CartItem {
  id: string;
  quantity: number;
  book: {
    id: string;
    title: string;
    coverUrl: string;
    price: number;
    format: string;
    author: { name: string };
  };
}

// ─────────────────────────────────────────────
// Test fixtures
// ─────────────────────────────────────────────
const MOCK_ITEM_A: CartItem = {
  id: "item-001",
  quantity: 2,
  book: {
    id: "book-001",
    title: "The Joy of Minimalism",
    coverUrl: "https://example.com/minimalism.jpg",
    price: 12.99,
    format: "PAPERBACK",
    author: { name: "Leo Babauta" },
  },
};

const MOCK_ITEM_B: CartItem = {
  id: "item-002",
  quantity: 1,
  book: {
    id: "book-002",
    title: "Deep Work",
    coverUrl: "https://example.com/deepwork.jpg",
    price: 15.49,
    format: "HARDCOVER",
    author: { name: "Cal Newport" },
  },
};

// ─────────────────────────────────────────────
// Render helper
// ─────────────────────────────────────────────

/**
 * Renders CartDrawer inside MemoryRouter.
 * CartContext state is controlled via mockCartState directly.
 */
function renderCartDrawer() {
  return render(
    <MemoryRouter>
      <CartDrawer />
    </MemoryRouter>
  );
}

describe('CartDrawer', () => {

  // Reset shared mock state and call counts before every test
  beforeEach(() => {
    vi.clearAllMocks();

    // Restore to a safe closed/empty baseline
    mockCartState.items = [];
    mockCartState.totalItems = 0;
    mockCartState.subtotal = 0;
    mockCartState.isDrawerOpen = false;
    mockCartState.closeDrawer = mockCloseDrawer;
  });

  describe("when isDrawerOpen is false", () => {

    it("does not render the backdrop overlay", () => {
      mockCartState.isDrawerOpen = false;
      renderCartDrawer();

      // The backdrop is conditionally rendered — it must be absent
      // Test via its click handler: nothing with onClick=closeDrawer
      // should be visible. We assert the empty-cart message is absent
      // as a proxy for "no visible drawer content".
      expect(screen.queryByText("Your cart is empty")).toBeNull();
    });

    it("drawer panel is translated off-screen (transform: translateX(100%))", () => {
      mockCartState.isDrawerOpen = false;
      renderCartDrawer();

      // The panel is always in the DOM (for CSS transition) but
      // transformed off-screen when closed.
      // We find the panel via the always-present "Close cart" button.
      const closeButton = screen.getByRole("button", { name: /close cart/i });
      const panel = closeButton.closest("div[style]") as HTMLElement;

      // Walk up to the panel root that carries the transform style
      // The panel <div> is the grandparent of the header <div>
      const drawerPanel = panel?.parentElement as HTMLElement;
      expect(drawerPanel?.style.transform).toBe("translateX(100%)");
    });

    it("does not render the item count badge when totalItems is 0", () => {
      mockCartState.isDrawerOpen = false;
      mockCartState.totalItems = 0;
      renderCartDrawer();

      // "(N item/items)" only renders when totalItems > 0
      expect(screen.queryByText(/\d+ items?/)).toBeNull();
    });

    it("does not render Go to Checkout or Continue Shopping buttons", () => {
      mockCartState.isDrawerOpen = false;
      mockCartState.items = [];
      renderCartDrawer();

      // Footer only renders when items.length > 0
      expect(
        screen.queryByRole("button", { name: /go to checkout/i })
      ).toBeNull();
      expect(
        screen.queryByRole("button", { name: /continue shopping/i })
      ).toBeNull();
    });
  });

  describe("when isDrawerOpen is true and items is empty", () => {

    beforeEach(() => {
      mockCartState.isDrawerOpen = true;
      mockCartState.items = [];
      mockCartState.totalItems = 0;
      mockCartState.subtotal = 0;
    });

    it("renders 'Your cart is empty'", () => {
      renderCartDrawer();
      expect(screen.getByText("Your cart is empty")).toBeTruthy();
    });

    it("renders the 'Shopping Cart' heading", () => {
      renderCartDrawer();
      expect(screen.getByText("Shopping Cart")).toBeTruthy();
    });

    it("does not render the item count badge", () => {
      renderCartDrawer();
      // totalItems === 0 → the (N items) span must not appear
      expect(screen.queryByText(/\d+ items?/)).toBeNull();
    });

    it("does not render the footer (no Checkout or Continue Shopping buttons)", () => {
      renderCartDrawer();

      expect(
        screen.queryByRole("button", { name: /go to checkout/i })
      ).toBeNull();
      expect(
        screen.queryByRole("button", { name: /continue shopping/i })
      ).toBeNull();
    });

    it("drawer panel is translated on-screen (transform: translateX(0))", () => {
      renderCartDrawer();

      const closeButton = screen.getByRole("button", { name: /close cart/i });
      const panel = closeButton.closest("div[style]") as HTMLElement;
      const drawerPanel = panel?.parentElement as HTMLElement;

      expect(drawerPanel?.style.transform).toBe("translateX(0)");
    });
  });

  describe("when isDrawerOpen is true and items are present", () => {
    beforeEach(() => {
      mockCartState.isDrawerOpen = true;
      mockCartState.items = [MOCK_ITEM_A, MOCK_ITEM_B];
      mockCartState.totalItems = 3; // 2 + 1
      mockCartState.subtotal = 41.47; // (12.99 * 2) + 15.49
    });

    it("renders each book title", () => {
      renderCartDrawer();
      expect(screen.getByText("The Joy of Minimalism")).toBeTruthy();
      expect(screen.getByText("Deep Work")).toBeTruthy();
    });

    it("renders each author name", () => {
      renderCartDrawer();
      expect(screen.getByText("Leo Babauta")).toBeTruthy();
      expect(screen.getByText("Cal Newport")).toBeTruthy();
    });

    it("renders the correct item total price for each line item", () => {
      renderCartDrawer();
      // MOCK_ITEM_A: 12.99 * 2 = $25.98
      expect(screen.getByText("$25.98")).toBeTruthy();
      // MOCK_ITEM_B: 15.49 * 1 = $15.49
      expect(screen.getByText("$15.49")).toBeTruthy();
    });

    it("renders the subtotal from context", () => {
      renderCartDrawer();
      expect(screen.getByText("$41.47")).toBeTruthy();
    });

    it("renders the item count badge with correct count and plural label", () => {
      renderCartDrawer();
      // totalItems = 3 → "(3 items)"
      expect(screen.getByText("(3 items)")).toBeTruthy();
    });

    it("renders '(1 item)' in singular when totalItems is 1", () => {
      mockCartState.totalItems = 1;
      mockCartState.items = [MOCK_ITEM_B];
      renderCartDrawer();
      expect(screen.getByText("(1 item)")).toBeTruthy();
    });

    it("renders book cover images with correct alt text", () => {
      renderCartDrawer();
      expect(
        screen.getByAltText("The Joy of Minimalism")
      ).toBeTruthy();
      expect(screen.getByAltText("Deep Work")).toBeTruthy();
    });

    it("renders each item's quantity", () => {
      renderCartDrawer();
      expect(screen.getByText("Qty: 2")).toBeTruthy();
      expect(screen.getByText("Qty: 1")).toBeTruthy();
    });

    it("renders Go to Checkout and Continue Shopping buttons", () => {
      renderCartDrawer();
      expect(
        screen.getByRole("button", { name: /go to checkout/i })
      ).toBeTruthy();
      expect(
        screen.getByRole("button", { name: /continue shopping/i })
      ).toBeTruthy();
    });
  });

  describe("Go to Checkout button", () => {

    beforeEach(() => {
      mockCartState.isDrawerOpen = true;
      mockCartState.items = [MOCK_ITEM_A];
      mockCartState.totalItems = 2;
      mockCartState.subtotal = 25.98;
    });

    it("calls navigate with '/checkout' when clicked", async () => {
      const user = userEvent.setup();
      renderCartDrawer();

      await user.click(
        screen.getByRole("button", { name: /go to checkout/i })
      );

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith("/checkout");
    });

    it("calls closeDrawer when Go to Checkout is clicked", async () => {
      const user = userEvent.setup();
      renderCartDrawer();

      await user.click(
        screen.getByRole("button", { name: /go to checkout/i })
      );

      // navigate AND closeDrawer are both called in the same handler
      expect(mockCloseDrawer).toHaveBeenCalledTimes(1);
    });

    it("calls navigate before closeDrawer in the same click handler", async () => {
      const user = userEvent.setup();
      const callOrder: string[] = [];

      mockNavigate.mockImplementation(() => callOrder.push("navigate"));
      mockCloseDrawer.mockImplementation(() => callOrder.push("closeDrawer"));

      renderCartDrawer();

      await user.click(
        screen.getByRole("button", { name: /go to checkout/i })
      );

      expect(callOrder).toEqual(["navigate", "closeDrawer"]);
    });
  });

  describe("Close cart button", () => {

    it("calls closeDrawer once when the × button is clicked", async () => {
      const user = userEvent.setup();
      mockCartState.isDrawerOpen = true;
      renderCartDrawer();

      await user.click(screen.getByRole("button", { name: /close cart/i }));

      expect(mockCloseDrawer).toHaveBeenCalledTimes(1);
    });

    it("calls closeDrawer when the backdrop is clicked", async () => {
      const user = userEvent.setup();
      mockCartState.isDrawerOpen = true;
      renderCartDrawer();

      // The backdrop is the sibling <div> before the drawer panel.
      // It is only rendered when isDrawerOpen=true.
      // We locate it as the first child of the fragment root.
      const backdrop = screen
        .getByText("Shopping Cart")
        .closest("div")       // header inner div
        ?.parentElement        // header div
        ?.parentElement        // drawer panel
        ?.previousElementSibling as HTMLElement;

      expect(backdrop).not.toBeNull();
      await user.click(backdrop!);

      expect(mockCloseDrawer).toHaveBeenCalledTimes(1);
    });

    it("calls closeDrawer when 'Continue Shopping' is clicked", async () => {
      const user = userEvent.setup();
      mockCartState.isDrawerOpen = true;
      mockCartState.items = [MOCK_ITEM_A];
      renderCartDrawer();

      await user.click(
        screen.getByRole("button", { name: /continue shopping/i })
      );

      expect(mockCloseDrawer).toHaveBeenCalledTimes(1);
    });

    it("does NOT call navigate when the × close button is clicked", async () => {
      const user = userEvent.setup();
      mockCartState.isDrawerOpen = true;
      renderCartDrawer();

      await user.click(screen.getByRole("button", { name: /close cart/i }));

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
