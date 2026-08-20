/**
 * Shared filter utilities for the visualiser pages.
 *
 * These pure functions handle the logic for deriving filter options
 * and applying pod/product filters to service arrays.
 */

/** Sentinel value representing services with no pod assigned. */
export const NO_POD = "No Pod";

/**
 * Derives the pod filter options from a services array.
 *
 * @param {Array} services - Array of service objects with `pod` property
 * @returns {Object} { allPodValues: string[], podOptionsWithNoPod: string[] }
 */
export function deriveFilterOptions(services) {
  const allPodValues = [...new Set(services.map(s => s.pod).filter(Boolean))].sort();
  const hasNoPod = services.some(s => !s.pod);
  const podOptionsWithNoPod = hasNoPod ? [...allPodValues, NO_POD] : [...allPodValues];
  return { allPodValues, podOptionsWithNoPod };
}

/**
 * Derives the available product options based on selected pods.
 *
 * @param {Array} services - Array of service objects with `pod` and `product` properties
 * @param {Array} selectedPods - Currently selected pod values (may include NO_POD)
 * @returns {Array} Sorted unique product names matching the selected pods
 */
export function deriveAvailableProducts(services, selectedPods) {
  return [...new Set(
    services
      .filter(s => s.pod ? selectedPods.includes(s.pod) : selectedPods.includes(NO_POD))
      .map(s => s.product)
  )].sort();
}

/**
 * Applies pod and product filters to a services array.
 *
 * @param {Array} services - Array of service objects (already filtered by search if applicable)
 * @param {Object} filters - { selectedPods: string[], selectedProducts: string[] }
 * @returns {Array} Filtered services matching both pod and product selections
 */
export function applyFilters(services, { selectedPods, selectedProducts }) {
  return services
    .filter(s => s.pod ? selectedPods.includes(s.pod) : selectedPods.includes(NO_POD))
    .filter(s => selectedProducts.includes(s.product));
}
