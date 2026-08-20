import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NO_POD, deriveFilterOptions, deriveAvailableProducts, applyFilters } from "./filter-utils.js";

function makeService(overrides) {
  return {
    product: "Auth",
    component: "api",
    promotionType: "securePipelines",
    pod: "Account",
    repository: "repo-a",
    ...overrides,
  };
}

describe("NO_POD", () => {
  it("is the string 'No Pod'", () => {
    assert.equal(NO_POD, "No Pod");
  });
});

describe("deriveFilterOptions", () => {
  it("returns empty arrays for empty services", () => {
    const result = deriveFilterOptions([]);
    assert.deepEqual(result, { allPodValues: [], podOptionsWithNoPod: [] });
  });

  it("returns sorted unique pod values", () => {
    const services = [
      makeService({ pod: "Identity" }),
      makeService({ pod: "Account" }),
      makeService({ pod: "Identity" }),
    ];
    const result = deriveFilterOptions(services);
    assert.deepEqual(result.allPodValues, ["Account", "Identity"]);
  });

  it("excludes null/empty pod values from allPodValues", () => {
    const services = [
      makeService({ pod: "Account" }),
      makeService({ pod: null }),
      makeService({ pod: "" }),
    ];
    const result = deriveFilterOptions(services);
    assert.deepEqual(result.allPodValues, ["Account"]);
  });

  it("appends NO_POD to podOptionsWithNoPod when services with no pod exist", () => {
    const services = [
      makeService({ pod: "Account" }),
      makeService({ pod: null }),
    ];
    const result = deriveFilterOptions(services);
    assert.deepEqual(result.podOptionsWithNoPod, ["Account", NO_POD]);
  });

  it("does not include NO_POD when all services have a pod", () => {
    const services = [
      makeService({ pod: "Account" }),
      makeService({ pod: "Identity" }),
    ];
    const result = deriveFilterOptions(services);
    assert.deepEqual(result.podOptionsWithNoPod, ["Account", "Identity"]);
  });
});

describe("deriveAvailableProducts", () => {
  it("returns empty array for empty services", () => {
    const result = deriveAvailableProducts([], ["Account"]);
    assert.deepEqual(result, []);
  });

  it("returns products matching selected pods", () => {
    const services = [
      makeService({ product: "Auth", pod: "Account" }),
      makeService({ product: "IPV", pod: "Identity" }),
    ];
    const result = deriveAvailableProducts(services, ["Account"]);
    assert.deepEqual(result, ["Auth"]);
  });

  it("returns all products when all pods selected", () => {
    const services = [
      makeService({ product: "Auth", pod: "Account" }),
      makeService({ product: "IPV", pod: "Identity" }),
    ];
    const result = deriveAvailableProducts(services, ["Account", "Identity"]);
    assert.deepEqual(result, ["Auth", "IPV"]);
  });

  it("includes products with null pod when NO_POD is selected", () => {
    const services = [
      makeService({ product: "Auth", pod: "Account" }),
      makeService({ product: "Orphan", pod: null }),
    ];
    const result = deriveAvailableProducts(services, ["Account", NO_POD]);
    assert.deepEqual(result, ["Auth", "Orphan"]);
  });

  it("excludes products with null pod when NO_POD is not selected", () => {
    const services = [
      makeService({ product: "Auth", pod: "Account" }),
      makeService({ product: "Orphan", pod: null }),
    ];
    const result = deriveAvailableProducts(services, ["Account"]);
    assert.deepEqual(result, ["Auth"]);
  });

  it("returns sorted unique products", () => {
    const services = [
      makeService({ product: "Zebra", pod: "Account" }),
      makeService({ product: "Alpha", pod: "Account" }),
      makeService({ product: "Zebra", pod: "Account" }),
    ];
    const result = deriveAvailableProducts(services, ["Account"]);
    assert.deepEqual(result, ["Alpha", "Zebra"]);
  });
});

describe("applyFilters", () => {
  it("returns empty array for empty services", () => {
    const result = applyFilters([], { selectedPods: ["Account"], selectedProducts: ["Auth"] });
    assert.deepEqual(result, []);
  });

  it("filters by pod", () => {
    const services = [
      makeService({ product: "Auth", pod: "Account" }),
      makeService({ product: "IPV", pod: "Identity" }),
    ];
    const result = applyFilters(services, { selectedPods: ["Account"], selectedProducts: ["Auth", "IPV"] });
    assert.equal(result.length, 1);
    assert.equal(result[0].product, "Auth");
  });

  it("filters by product", () => {
    const services = [
      makeService({ product: "Auth", pod: "Account" }),
      makeService({ product: "Home", pod: "Account" }),
    ];
    const result = applyFilters(services, { selectedPods: ["Account"], selectedProducts: ["Auth"] });
    assert.equal(result.length, 1);
    assert.equal(result[0].product, "Auth");
  });

  it("includes null-pod services when NO_POD is in selectedPods", () => {
    const services = [
      makeService({ product: "Orphan", pod: null }),
    ];
    const result = applyFilters(services, { selectedPods: [NO_POD], selectedProducts: ["Orphan"] });
    assert.equal(result.length, 1);
  });

  it("excludes null-pod services when NO_POD is not in selectedPods", () => {
    const services = [
      makeService({ product: "Orphan", pod: null }),
    ];
    const result = applyFilters(services, { selectedPods: ["Account"], selectedProducts: ["Orphan"] });
    assert.equal(result.length, 0);
  });

  it("applies both filters as AND logic", () => {
    const services = [
      makeService({ product: "Auth", pod: "Account" }),
      makeService({ product: "IPV", pod: "Identity" }),
      makeService({ product: "Home", pod: "Account" }),
    ];
    const result = applyFilters(services, { selectedPods: ["Account"], selectedProducts: ["Auth"] });
    assert.equal(result.length, 1);
    assert.equal(result[0].product, "Auth");
  });

  it("returns all services when all pods and products selected", () => {
    const services = [
      makeService({ product: "Auth", pod: "Account" }),
      makeService({ product: "IPV", pod: "Identity" }),
    ];
    const result = applyFilters(services, { selectedPods: ["Account", "Identity"], selectedProducts: ["Auth", "IPV"] });
    assert.equal(result.length, 2);
  });
});
