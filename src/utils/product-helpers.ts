/**
 * Product filtering and sorting utilities
 */

import { Product, ProductFilters } from '@/lib/types';

/**
 * Applies filters and sorting to products
 */
export function filterAndSortProducts(
  products: Product[],
  filters: ProductFilters
): Product[] {
  let filtered = [...products];

  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase().trim();
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  // Apply price range filter
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(p => p.discountedPrice >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(p => p.discountedPrice <= filters.maxPrice!);
  }

  // Apply stock filter
  if (filters.inStock === true) {
    filtered = filtered.filter(p => p.isInStock);
  }

  // Apply sorting
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'price':
          comparison = a.discountedPrice - b.discountedPrice;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'popularity':
          comparison = a.reviewsCount - b.reviewsCount;
          break;
        case 'newest':
          comparison = new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime();
          break;
        default:
          break;
      }

      // Apply sort order
      if (filters.sortOrder === 'desc') {
        comparison = -comparison;
      }

      return comparison;
    });
  }

  return filtered;
}

/**
 * Gets price range from products
 */
export function getPriceRange(products: Product[]): [number, number] {
  if (products.length === 0) return [0, 0];

  const prices = products.map(p => p.discountedPrice);
  return [
    Math.min(...prices),
    Math.max(...prices)
  ];
}

/**
 * Gets unique tags from products
 */
export function getUniqueTags(products: Product[]): string[] {
  const tags = new Set<string>();
  products.forEach(product => {
    product.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

/**
 * Gets products grouped by category/tag
 */
export function groupProductsByTag(products: Product[]): Record<string, Product[]> {
  const grouped: Record<string, Product[]> = {};

  products.forEach(product => {
    product.tags.forEach(tag => {
      if (!grouped[tag]) {
        grouped[tag] = [];
      }
      grouped[tag].push(product);
    });
  });

  return grouped;
}

/**
 * Calculates discount info for a product
 */
export function getDiscountInfo(product: Product): {
  originalPrice: number;
  discountedPrice: number;
  savingsAmount: number;
  savingsPercent: number;
} {
  return {
    originalPrice: product.originalPrice,
    discountedPrice: product.discountedPrice,
    savingsAmount: product.originalPrice - product.discountedPrice,
    savingsPercent: Math.round((product.discountPercent || 0))
  };
}

/**
 * Sorts products by relevance to search query
 */
export function sortByRelevance(products: Product[], query: string): Product[] {
  const queryLower = query.toLowerCase();

  return products.sort((a, b) => {
    // Exact match in name gets highest priority
    const aNameMatch = a.name.toLowerCase() === queryLower ? 2 : 0;
    const bNameMatch = b.name.toLowerCase() === queryLower ? 2 : 0;

    // Name includes query
    const aNameIncludes = a.name.toLowerCase().includes(queryLower) ? 1 : 0;
    const bNameIncludes = b.name.toLowerCase().includes(queryLower) ? 1 : 0;

    // Tag includes query
    const aTagMatch = a.tags.some(tag => tag.toLowerCase().includes(queryLower)) ? 0.5 : 0;
    const bTagMatch = b.tags.some(tag => tag.toLowerCase().includes(queryLower)) ? 0.5 : 0;

    const aScore = aNameMatch + aNameIncludes + aTagMatch;
    const bScore = bNameMatch + bNameIncludes + bTagMatch;

    return bScore - aScore;
  });
}
