// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  CARDS_LIMIT,
  RELATED_CREATORS_WEIGHTS,
  RELATED_WORKS_WEIGHTS,
} from "./signals";

describe("recommendations/signals weights", () => {
  it("CARDS_LIMIT is 4", () => {
    expect(CARDS_LIMIT).toBe(4);
  });

  it("related-creators weights satisfy SRS §8.3 invariant: city >= shootingFocus > 0", () => {
    expect(RELATED_CREATORS_WEIGHTS.shootingFocus).toBeGreaterThan(0);
    expect(RELATED_CREATORS_WEIGHTS.city).toBeGreaterThanOrEqual(
      RELATED_CREATORS_WEIGHTS.shootingFocus,
    );
  });

  it("related-creators weights sum <= 1.0", () => {
    const sum =
      RELATED_CREATORS_WEIGHTS.city + RELATED_CREATORS_WEIGHTS.shootingFocus;
    expect(sum).toBeLessThanOrEqual(1.0 + 1e-9);
  });

  it("related-works weights satisfy SRS §8.3 invariant: sameOwner > ownerCity >= category > 0", () => {
    expect(RELATED_WORKS_WEIGHTS.category).toBeGreaterThan(0);
    expect(RELATED_WORKS_WEIGHTS.ownerCity).toBeGreaterThanOrEqual(
      RELATED_WORKS_WEIGHTS.category,
    );
    expect(RELATED_WORKS_WEIGHTS.sameOwner).toBeGreaterThan(
      RELATED_WORKS_WEIGHTS.ownerCity,
    );
  });

  it("related-works weights sum <= 1.0", () => {
    const sum =
      RELATED_WORKS_WEIGHTS.sameOwner +
      RELATED_WORKS_WEIGHTS.ownerCity +
      RELATED_WORKS_WEIGHTS.category;
    expect(sum).toBeLessThanOrEqual(1.0 + 1e-9);
  });
});
