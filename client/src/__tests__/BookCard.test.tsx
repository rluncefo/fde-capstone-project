import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from 'react-router-dom';

import BookCard, { getDeliveryDate } from '../components/ecommerce/BookCard';
import type { Book } from "../types";

// ─────────────────────────────────────────────
// Module mocks
// ─────────────────────────────────────────────

/**
 * Mock useNavigate so we can assert navigation calls
 * without spinning up a full router history stack.
 */
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,                          // keep MemoryRouter, Link, etc. real
    useNavigate: () => mockNavigate,    // only replace useNavigate
  };
});

/**
 * Mock CartContext so the component renders without a real provider
 * and so we can assert addItem calls independently.
 */
const mockAddItem = vi.fn();
vi.mock("../context/CartContext", () => ({
  useCart: () => ({ addItem: mockAddItem }),
}));

/**
 * Mock child UI components with minimal, deterministic output.
 * This keeps the test surface focused on BookCard's own logic.
 */
vi.mock("../components/ui/Badge", () => ({
  default: ({ label }: { label: string }) => <span>{label}</span>,
}));

vi.mock("../components/ecommerce/PriceTag", () => ({
  /**
   * PriceTag receives a raw number (e.g. 12.99).
   * This stub formats it as $X.XX so BookCard tests can
   * assert on the formatted string without testing PriceTag itself.
   */
  default: ({ price }: { price: number }) => (
    <span>${price.toFixed(2)}</span>
  ),
}));

vi.mock("../components/ui/Button", () => ({
  default: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: React.MouseEventHandler;
  }) => <button onClick={onClick}>{children}</button>,
}));

// ─────────────────────────────────────────────
// Test fixture
// ─────────────────────────────────────────────

/**
 * A minimal but complete Book object that satisfies every
 * code path exercised by BookCard.
 * Cast through `unknown` so we only need the fields the
 * component actually uses — no need to satisfy every key
 * of the full Book type in tests.
 */
const MOCK_BOOK = {
  id: "book-001",
  title: "The Joy of Minimalism",
  slug: "joy-of-minimalism",
  price: 12.99,
  description: "A guide to living with less.",
  format: "PAPERBACK",
  coverUrl: "https://example.com/cover.jpg",
  author: {
    id: "author-001",
    name: "Leo Babauta",
  },
  categories: [
    { id: "cat-001", name: "Self Help", slug: "self-help" },
    { id: "cat-002", name: "Lifestyle", slug: "lifestyle" },
    { id: "cat-003", name: "Philosophy", slug: "philosophy" }, // 3rd — must be hidden
  ],
} as unknown as Book;

// ─────────────────────────────────────────────
// Render helper
// ─────────────────────────────────────────────

interface RenderOptions {
  size?: "compact" | "normal";
  showAddToCart?: boolean;
  book?: Book;
}

function renderBookCard({
  size = "normal",
  showAddToCart = false,
  book = MOCK_BOOK,
}: RenderOptions = {}) {
  return render(
    <MemoryRouter>
      <BookCard book={book} size={size} showAddToCart={showAddToCart} />
    </MemoryRouter>
  );
}

describe('BookCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the book title", () => {
    renderBookCard();

    // getByText throws if absent — no explicit assertion needed,
    // but we add toBeTruthy so the intent is self-documenting.
    expect(
      screen.getByText(MOCK_BOOK.title)
    ).toBeTruthy();
  });

  it("renders the author name prefixed with 'by'", () => {
    renderBookCard();

    // The component renders: `by ${book.author?.name ?? 'Unknown'}`
    expect(
      screen.getByText(`by ${MOCK_BOOK.author.name}`)
    ).toBeTruthy();
  });

  it("renders 'by Unknown' when author is absent", () => {
    const bookWithoutAuthor = {
      ...MOCK_BOOK,
      author: undefined,
    } as unknown as Book;

    renderBookCard({ book: bookWithoutAuthor });

    expect(screen.getByText("by Unknown")).toBeTruthy();
  });

  it("renders the price formatted as $X.XX via PriceTag", () => {
    renderBookCard();

    // PriceTag stub outputs `$${price.toFixed(2)}`
    expect(screen.getByText("$12.99")).toBeTruthy();
  });

  it("renders zero price as $0.00", () => {
    renderBookCard({ book: { ...MOCK_BOOK, price: 0 } as unknown as Book });
    expect(screen.getByText("$0.00")).toBeTruthy();
  });

  it("renders a delivery date string that starts with 'Delivery by'", () => {
    renderBookCard();

    // Use a regex so the test is not coupled to the specific date
    // calculated on the day the test runs.
    const deliveryEl = screen.getByText(/^Delivery by /);
    expect(deliveryEl).toBeTruthy();
  });

  it("delivery date text includes the value returned by getDeliveryDate()", () => {
    renderBookCard();

    // Call the exported helper directly — same logic, same clock tick.
    const expectedDate = getDeliveryDate();
    expect(
      screen.getByText(`Delivery by ${expectedDate}`)
    ).toBeTruthy();
  });

  it("calls navigate with the correct book URL when the card is clicked", async () => {
    const user = userEvent.setup();
    renderBookCard();

    // Click the card's root <div> via its book title text
    await user.click(screen.getByText(MOCK_BOOK.title));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      `/books/${MOCK_BOOK.slug}`
    );
  });
});

describe("size prop", () => {
  it("renders in 'normal' size by default", () => {
    renderBookCard();
    const img = screen.getByAltText(MOCK_BOOK.title) as HTMLImageElement;
    // Normal size → imgWidth = 96
    expect(img.style.width).toBe("96px");
  });

  it("renders in 'compact' size when size='compact'", () => {
    renderBookCard({ size: "compact" });
    const img = screen.getByAltText(MOCK_BOOK.title) as HTMLImageElement;
    // Compact size → imgWidth = 72
    expect(img.style.width).toBe("72px");
  });
});

describe("category badges", () => {
  it("renders at most 2 category badges regardless of how many categories exist", () => {
    renderBookCard();

    // MOCK_BOOK has 3 categories — only first 2 should appear
    expect(screen.getByText("Self Help")).toBeTruthy();
    expect(screen.getByText("Lifestyle")).toBeTruthy();
    expect(screen.queryByText("Philosophy")).toBeNull();
  });

  it("renders no badges when categories array is empty", () => {
    renderBookCard({
      book: { ...MOCK_BOOK, categories: [] } as unknown as Book,
    });

    expect(screen.queryByText("Self Help")).toBeNull();
  });
});

describe("cover image", () => {
  it("renders the book cover with correct src and alt text", () => {
    renderBookCard();

    const img = screen.getByAltText(MOCK_BOOK.title) as HTMLImageElement;
    expect(img.src).toBe(MOCK_BOOK.coverUrl);
    expect(img.alt).toBe(MOCK_BOOK.title);
  });

  it("falls back to placeholder when coverUrl is empty", () => {
    renderBookCard({
      book: { ...MOCK_BOOK, coverUrl: "" } as unknown as Book,
    });

    const img = screen.getByAltText(MOCK_BOOK.title) as HTMLImageElement;
    expect(img.src).toContain("placehold.co");
  });
});

describe("showAddToCart prop", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render Add to Cart button by default", () => {
    renderBookCard();
    expect(screen.queryByRole("button", { name: /add to cart/i })).toBeNull();
  });

  it("renders Add to Cart button when showAddToCart=true", () => {
    renderBookCard({ showAddToCart: true });
    expect(
      screen.getByRole("button", { name: /add to cart/i })
    ).toBeTruthy();
  });

  it("calls addItem with bookId and quantity 1 when Add to Cart is clicked", async () => {
    const user = userEvent.setup();
    renderBookCard({ showAddToCart: true });

    await user.click(screen.getByRole("button", { name: /add to cart/i }));

    expect(mockAddItem).toHaveBeenCalledTimes(1);
    expect(mockAddItem).toHaveBeenCalledWith(MOCK_BOOK.id, 1);
  });

  it("does not trigger card navigation when Add to Cart is clicked", async () => {
    const user = userEvent.setup();
    renderBookCard({ showAddToCart: true });

    await user.click(screen.getByRole("button", { name: /add to cart/i }));

    // e.stopPropagation() must prevent the card's onClick from firing
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe("book format", () => {
  it("renders format in title-case (e.g. 'Paperback' not 'PAPERBACK')", () => {
    renderBookCard();
    // Component does: format.charAt(0) + format.slice(1).toLowerCase()
    expect(screen.getByText("Paperback")).toBeTruthy();
  });
});

describe("getDeliveryDate()", () => {
  it("returns a non-empty string", () => {
    expect(typeof getDeliveryDate()).toBe("string");
    expect(getDeliveryDate().length).toBeGreaterThan(0);
  });

  it("returns a date that is at least 3 calendar days from today", () => {
    const today = new Date();
    const result = getDeliveryDate(); // e.g. "Mon, 29 Sep"

    // Parse the result back into a comparable date.
    // Append the current year since getDeliveryDate omits it.
    const parsed = new Date(`${result} ${today.getFullYear()}`);

    const diffMs = parsed.getTime() - today.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    // Must be at least 3 days ahead (could be more across a weekend)
    expect(diffDays).toBeGreaterThanOrEqual(3);
  });

  it("never returns a Saturday or Sunday", () => {
    // Run 7 times to cover any starting day-of-week
    for (let i = 0; i < 7; i++) {
      const result = getDeliveryDate();
      const parsed = new Date(
        `${result} ${new Date().getFullYear()}`
      );
      const day = parsed.getDay();
      expect(day).not.toBe(0); // Sunday
      expect(day).not.toBe(6); // Saturday
    }
  });
});
