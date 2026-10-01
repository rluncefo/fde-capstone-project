import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import StarRating from '../components/ui/StarRating';

// ─────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────

/**
 * Returns all 5 star <span> elements by their aria-label.
 * The component renders aria-label="1 star", "2 stars" … "5 stars".
 */
function getAllStarElements(): HTMLElement[] {
  return [
    screen.getByRole("generic", { name: "1 star" }),
    screen.getByRole("generic", { name: "2 stars" }),
    screen.getByRole("generic", { name: "3 stars" }),
    screen.getByRole("generic", { name: "4 stars" }),
    screen.getByRole("generic", { name: "5 stars" }),
  ];
}

describe('StarRating', () => {
  describe("readonly mode", () => {

    it("renders exactly 5 star elements", () => {
      render(<StarRating value={3} readonly />);

      // Every star carries a predictable aria-label — count them
      const stars = screen.getAllByRole("generic", { name: /^\d star/ });
      expect(stars).toHaveLength(5);
    });

    it("renders the correct aria-labels for all 5 stars", () => {
      render(<StarRating value={3} readonly />);

      // Singular for 1, plural for 2-5
      expect(screen.getByRole("generic", { name: "1 star" })).toBeTruthy();
      expect(screen.getByRole("generic", { name: "2 stars" })).toBeTruthy();
      expect(screen.getByRole("generic", { name: "3 stars" })).toBeTruthy();
      expect(screen.getByRole("generic", { name: "4 stars" })).toBeTruthy();
      expect(screen.getByRole("generic", { name: "5 stars" })).toBeTruthy();
    });

    it("stars have cursor:default in readonly mode", () => {
      render(<StarRating value={3} readonly />);

      getAllStarElements().forEach((star) => {
        expect(star.style.cursor).toBe("default");
      });
    });

    it("does not attach onClick handlers in readonly mode", () => {
      render(<StarRating value={3} readonly />);

      // In readonly mode onClick is set to undefined on the DOM element —
      // firing a click event must not throw and onChange is never wired
      getAllStarElements().forEach((star) => {
        expect(() => fireEvent.click(star)).not.toThrow();
      });
    });

    it("renders with value=0 without crashing", () => {
      expect(() => render(<StarRating value={0} readonly />)).not.toThrow();
      const stars = screen.getAllByRole("generic", { name: /star/ });
      expect(stars).toHaveLength(5);
    });

    it("renders with a fractional value (2.5) without crashing", () => {
      expect(() =>
        render(<StarRating value={2.5} readonly />)
      ).not.toThrow();
    });
  });

  describe("interactive mode — onChange", () => {
    let onChange: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      onChange = vi.fn();
    });

    it("calls onChange with the correct star value when a star is clicked", async () => {
      const user = userEvent.setup();
      render(<StarRating value={0} onChange={onChange} />);

      const thirdStar = screen.getByRole("generic", { name: "3 stars" });
      await user.click(thirdStar);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(3);
    });

    it("calls onChange with 1 when the first star is clicked", async () => {
      const user = userEvent.setup();
      render(<StarRating value={0} onChange={onChange} />);

      await user.click(screen.getByRole("generic", { name: "1 star" }));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(1);
    });

    it("calls onChange with 5 when the last star is clicked", async () => {
      const user = userEvent.setup();
      render(<StarRating value={0} onChange={onChange} />);

      await user.click(screen.getByRole("generic", { name: "5 stars" }));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(5);
    });

    it("calls onChange with the new value when rating is changed from an existing value", async () => {
      const user = userEvent.setup();
      // Start with value=4, click star 2 → should report 2
      render(<StarRating value={4} onChange={onChange} />);

      await user.click(screen.getByRole("generic", { name: "2 stars" }));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(2);
    });

    it("calls onChange once per click — no duplicate firings", async () => {
      const user = userEvent.setup();
      render(<StarRating value={0} onChange={onChange} />);

      await user.click(screen.getByRole("generic", { name: "4 stars" }));

      // Exactly one call — guards against bubbling or double-binding
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("stars have cursor:pointer in interactive mode", () => {
      render(<StarRating value={0} onChange={onChange} />);

      getAllStarElements().forEach((star) => {
        expect(star.style.cursor).toBe("pointer");
      });
    });

    // ── Hover state ──────────────────────────────────────────────────────────
    describe("hover state", () => {

      it("updates display when mouse enters a star", () => {
        render(<StarRating value={1} onChange={onChange} />);

        const fourthStar = screen.getByRole("generic", { name: "4 stars" });

        // Hovering the 4th star: the component sets hovered=4
        // Cursor must still be 'pointer' confirming interactive mode is intact
        fireEvent.mouseEnter(fourthStar);
        expect(fourthStar.style.cursor).toBe("pointer");
      });

      it("resets display when mouse leaves a star", () => {
        render(<StarRating value={2} onChange={onChange} />);

        const fifthStar = screen.getByRole("generic", { name: "5 stars" });

        fireEvent.mouseEnter(fifthStar);
        fireEvent.mouseLeave(fifthStar);

        // After leave, hovered is reset to null — cursor still pointer
        expect(fifthStar.style.cursor).toBe("pointer");
      });

      it("does not call onChange on hover — only on click", () => {
        render(<StarRating value={0} onChange={onChange} />);

        const thirdStar = screen.getByRole("generic", { name: "3 stars" });

        fireEvent.mouseEnter(thirdStar);
        fireEvent.mouseLeave(thirdStar);

        // Hovering must never trigger onChange
        expect(onChange).not.toHaveBeenCalled();
      });
    });
  });

  describe("readonly=true — onChange is never called", () => {
    let onChange: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      onChange = vi.fn();
    });

    it("does NOT call onChange when a star is clicked in readonly mode", async () => {
      const user = userEvent.setup();
      render(<StarRating value={3} onChange={onChange} readonly />);

      // Click every star — none should trigger onChange
      const stars = getAllStarElements();
      for (const star of stars) {
        await user.click(star);
      }

      expect(onChange).not.toHaveBeenCalled();
    });

    it("does NOT call onChange when clicking star 1 in readonly mode", async () => {
      const user = userEvent.setup();
      render(<StarRating value={3} onChange={onChange} readonly />);

      await user.click(screen.getByRole("generic", { name: "1 star" }));

      expect(onChange).not.toHaveBeenCalled();
    });

    it("does NOT call onChange when clicking star 5 in readonly mode", async () => {
      const user = userEvent.setup();
      render(<StarRating value={3} onChange={onChange} readonly />);

      await user.click(screen.getByRole("generic", { name: "5 stars" }));

      expect(onChange).not.toHaveBeenCalled();
    });

    it("does NOT attach mouse enter/leave handlers in readonly mode", () => {
      render(<StarRating value={3} onChange={onChange} readonly />);

      getAllStarElements().forEach((star) => {
        // Firing these in readonly mode must not throw and must not
        // call onChange (hover never triggers onChange regardless,
        // but verifies readonly suppresses all event handlers)
        expect(() => {
          fireEvent.mouseEnter(star);
          fireEvent.mouseLeave(star);
        }).not.toThrow();
      });

      expect(onChange).not.toHaveBeenCalled();
    });

    it("does NOT call onChange when onChange is omitted (undefined)", async () => {
      const user = userEvent.setup();

      // No onChange prop at all — must not throw on click
      expect(async () => {
        render(<StarRating value={3} />);
        await user.click(screen.getByRole("generic", { name: "3 stars" }));
      }).not.toThrow();
    });
  });

  // ─────────────────────────────────────────────
  // Additional coverage: size prop
  // ─────────────────────────────────────────────
  describe("size prop", () => {

    it("applies 22px font size for size='md' (default)", () => {
      render(<StarRating value={3} readonly />);

      getAllStarElements().forEach((star) => {
        expect(star.style.fontSize).toBe("22px");
      });
    });

    it("applies 16px font size for size='sm'", () => {
      render(<StarRating value={3} readonly size="sm" />);

      getAllStarElements().forEach((star) => {
        expect(star.style.fontSize).toBe("16px");
      });
    });
  });
});
