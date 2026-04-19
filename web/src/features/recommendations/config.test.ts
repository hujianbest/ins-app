// @vitest-environment node
import { describe, expect, it } from "vitest";

import { readRecommendationsConfig } from "./config";

describe("recommendations/config", () => {
  it("defaults to relatedEnabled=true with no warnings when env unset", () => {
    const result = readRecommendationsConfig({});
    expect(result.config).toEqual({ relatedEnabled: true });
    expect(result.warnings).toEqual([]);
  });

  it("respects RECOMMENDATIONS_RELATED_ENABLED=false", () => {
    const result = readRecommendationsConfig({
      RECOMMENDATIONS_RELATED_ENABLED: "false",
    });
    expect(result.config.relatedEnabled).toBe(false);
    expect(result.warnings).toEqual([]);
  });

  it("accepts explicit RECOMMENDATIONS_RELATED_ENABLED=true", () => {
    const result = readRecommendationsConfig({
      RECOMMENDATIONS_RELATED_ENABLED: "true",
    });
    expect(result.config.relatedEnabled).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it("falls back to true + warning on invalid value", () => {
    const result = readRecommendationsConfig({
      RECOMMENDATIONS_RELATED_ENABLED: "maybe",
    });
    expect(result.config.relatedEnabled).toBe(true);
    expect(
      result.warnings.some(
        (w) => w.slug === "recommendations-related-enabled-invalid",
      ),
    ).toBe(true);
  });

  it("ignores leading/trailing whitespace and case", () => {
    const result = readRecommendationsConfig({
      RECOMMENDATIONS_RELATED_ENABLED: "  FALSE  ",
    });
    expect(result.config.relatedEnabled).toBe(false);
  });
});
