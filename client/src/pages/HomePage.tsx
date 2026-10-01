import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Book } from '../types';
import { getBooks } from '../api/books';
import { PageWithSidebar } from '../components/layout';
import { SearchBar, FilterBar, BookGrid } from '../components/ecommerce';
import type { FilterState } from '../components/ecommerce';

function priceRangeToParams(priceRange: string): { minPrice?: number; maxPrice?: number } {
  if (priceRange === 'under5') return { maxPrice: 5 };
  if (priceRange === '5to10') return { minPrice: 5, maxPrice: 10 };
  if (priceRange === 'over10') return { minPrice: 10 };
  return {};
}

// Extend BookListParams to accept feature flags the backend supports
type ExtendedParams = Parameters<typeof getBooks>[0] & {
  isRecommended?: boolean;
  isBestseller?: boolean;
  isNewLaunch?: boolean;
};

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') ?? '';
  const searchParam = searchParams.get('search') ?? '';
  const languageParam = searchParams.get('language') ?? '';
  const formatParam = searchParams.get('format') ?? '';
  const priceRangeParam = searchParams.get('priceRange') ?? '';
  const sortParam = searchParams.get('sort') ?? '';

  const [searchInput, setSearchInput] = useState(searchParam);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [recommended, setRecommended] = useState<Book[]>([]);
  const [bestsellers, setBestsellers] = useState<Book[]>([]);
  const [newLaunches, setNewLaunches] = useState<Book[]>([]);
  const [searchResults, setSearchResults] = useState<Book[]>([]);

  const [loadingRec, setLoadingRec] = useState(false);
  const [loadingBest, setLoadingBest] = useState(false);
  const [loadingNew, setLoadingNew] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const filters: FilterState = {
    language: languageParam,
    format: formatParam,
    priceRange: priceRangeParam,
    sort: sortParam,
  };

  const isFiltered = !!(category || searchParam || languageParam || formatParam || priceRangeParam || sortParam);

  // Fetch filtered / search results
  const fetchFiltered = useCallback(async () => {
    setLoadingSearch(true);
    try {
      const results = await getBooks({
        category: category || undefined,
        search: searchParam || undefined,
        language: languageParam || undefined,
        format: formatParam || undefined,
        sort: sortParam || undefined,
        ...priceRangeToParams(priceRangeParam),
        limit: 30,
      } as ExtendedParams);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, searchParam, languageParam, formatParam, priceRangeParam, sortParam]);

  // Fetch home-page sections
  const fetchSections = useCallback(async () => {
    setLoadingRec(true);
    setLoadingBest(true);
    setLoadingNew(true);
    try {
      const [rec, best, newL] = await Promise.all([
        getBooks({ category: category || undefined, isRecommended: true, limit: 6 } as ExtendedParams),
        getBooks({ category: category || undefined, isBestseller: true, limit: 6 } as ExtendedParams),
        getBooks({ category: category || undefined, isNewLaunch: true, limit: 6 } as ExtendedParams),
      ]);
      setRecommended(rec);
      setBestsellers(best);
      setNewLaunches(newL);
    } catch {
      setRecommended([]);
      setBestsellers([]);
      setNewLaunches([]);
    } finally {
      setLoadingRec(false);
      setLoadingBest(false);
      setLoadingNew(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  useEffect(() => {
    if (isFiltered) {
      fetchFiltered();
    } else {
      fetchSections();
    }
  }, [isFiltered, fetchFiltered, fetchSections]);

  // Keep local search input in sync with URL param
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set('search', value);
        else next.delete('search');
        return next;
      });
    }, 300);
  }

  function handleSearchSubmit() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (searchInput) next.set('search', searchInput);
      else next.delete('search');
      return next;
    });
  }

  function handleFilterChange(partial: Partial<FilterState>) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(partial).forEach(([key, val]) => {
        if (val) next.set(key, val);
        else next.delete(key);
      });
      return next;
    });
  }

  return (
    <PageWithSidebar>
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '28px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '0 0 40%', minWidth: '200px' }}>
          <SearchBar
            value={searchInput}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />
        </div>
        <div style={{ flex: 1 }}>
          <FilterBar filters={filters} onChange={handleFilterChange} />
        </div>
      </div>

      {/* Book sections */}
      {isFiltered ? (
        <BookGrid
          title="Search Results"
          books={searchResults}
          isLoading={loadingSearch}
          emptyMessage="No books match your search or filters."
        />
      ) : (
        <>
          <BookGrid title="Recommended for You" books={recommended} isLoading={loadingRec} />
          <BookGrid title="Bestsellers this Month" books={bestsellers} isLoading={loadingBest} />
          <BookGrid title="New Launches" books={newLaunches} isLoading={loadingNew} />
        </>
      )}
    </PageWithSidebar>
  );
}
