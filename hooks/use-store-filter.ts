import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export interface StoreFilters {
  priceRange: [number, number];
  distance: number;
  sortBy: string;
  selectedCategories: string[];
  searchQuery: string;
  bakeryName: string;
}

const DEFAULT_FILTERS: StoreFilters = {
  priceRange: [15000, 120000],
  distance: 5,
  sortBy: "desc",
  selectedCategories: [],
  searchQuery: "",
  bakeryName: "",
};

interface UseStoreFiltersProps {
  useUrlParams?: boolean;
}

export const useStoreFilters = ({
  useUrlParams = true,
}: UseStoreFiltersProps = {}) => {
  const [filters, setFilters] = useState<StoreFilters>(DEFAULT_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const activeFiltersCount = useMemo(() => {
    return [
      filters.selectedCategories.length,
      filters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0] ||
      filters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1],
      filters.distance !== DEFAULT_FILTERS.distance,
      filters.searchQuery,
      filters.sortBy !== DEFAULT_FILTERS.sortBy,
    ].filter(Boolean).length;
  }, [filters]);

  useEffect(() => {
    if (!useUrlParams) return;
    if (!searchParams) return;

    const newFilters: StoreFilters = { ...DEFAULT_FILTERS };

    searchParams.forEach((value, key) => {
      switch (key) {
        case "minPrice":
        case "maxPrice":
          newFilters.priceRange[key === "minPrice" ? 0 : 1] = parseInt(
            value,
            10
          );
          break;
        case "distance":
          newFilters.distance = parseInt(value, 10);
          break;
        case "sortBy":
          newFilters.sortBy = value;
          break;
        case "categories":
          newFilters.selectedCategories = value.split(",");
          break;
        case "query":
          newFilters.searchQuery = value;
          break;
      }
    });

    setFilters(newFilters);
  }, [useUrlParams, searchParams]);

  const updateUrlParams = useCallback(() => {
    if (!useUrlParams) return;

    const params = new URLSearchParams();
    const { priceRange, distance, sortBy, selectedCategories, searchQuery } =
      filters;

    if (priceRange[0] !== DEFAULT_FILTERS.priceRange[0])
      params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] !== DEFAULT_FILTERS.priceRange[1])
      params.set("maxPrice", priceRange[1].toString());
    if (distance !== DEFAULT_FILTERS.distance)
      params.set("distance", distance.toString());
    if (sortBy !== DEFAULT_FILTERS.sortBy) params.set("sortBy", sortBy);
    if (selectedCategories.length > 0)
      params.set("categories", selectedCategories.join(","));
    if (searchQuery) params.set("query", searchQuery);

    router.push(`?${params.toString()}`, { scroll: false });
  }, [filters, router, useUrlParams]);

  useEffect(() => {
    updateUrlParams();
  }, [filters, updateUrlParams]);

  const updateFilters = useCallback((key: keyof StoreFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setSortBy = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, sortBy: value }));
  }, []);

  const setSearchQuery = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: value }));
  }, []);

  const setPriceRange = useCallback((value: [number, number]) => {
    setFilters((prev) => ({ ...prev, priceRange: value }));
  }, []);

  const setDistance = useCallback((value: number) => {
    setFilters((prev) => ({ ...prev, distance: value }));
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setFilters((prev) => {
      const updatedCategories = prev.selectedCategories.includes(category)
        ? prev.selectedCategories.filter((c) => c !== category)
        : [...prev.selectedCategories, category];
      return { ...prev, selectedCategories: updatedCategories };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const setBakeryName = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, bakeryName: value }));
  }, []);

  return {
    filters,
    isFilterOpen,
    activeFiltersCount,
    setIsFilterOpen,
    updateFilters,
    setSortBy,
    setSearchQuery,
    setPriceRange,
    setDistance,
    toggleCategory,
    resetFilters,
    setBakeryName,
  };
};
