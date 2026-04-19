// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";

import {
  type MetricsRegistry,
  createMetricsRegistry,
  recordBusinessAction,
  recordSqliteQuery,
} from "./metrics";

let registry: MetricsRegistry;

beforeEach(() => {
  registry = createMetricsRegistry();
});

describe("observability/metrics counter", () => {
  it("accumulates counter values", () => {
    registry.incrementCounter("http.requests_total");
    registry.incrementCounter("http.requests_total");
    registry.incrementCounter("http.requests_total", undefined, 3);
    expect(registry.snapshot().http.requests_total).toBe(5);
  });

  it("keeps label dimensions separate", () => {
    registry.incrementCounter("http.errors_total", { status: "500" });
    registry.incrementCounter("http.errors_total", { status: "500" });
    registry.incrementCounter("http.errors_total", { status: "404" });
    const snap = registry.snapshot();
    expect(snap.http.errors_total).toBe(3);
    expect(snap.labels?.["http.errors_total"]).toEqual({
      "status=500": 2,
      "status=404": 1,
    });
  });
});

describe("observability/metrics gauge", () => {
  it("overrides instead of accumulating", () => {
    registry.setGauge("system.foo", 10);
    registry.setGauge("system.foo", 4);
    expect(registry.snapshot().gauges?.["system.foo"]).toBe(4);
  });
});

describe("observability/metrics histogram", () => {
  it("aggregates count/sum/p50/p95", () => {
    for (const v of [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) {
      registry.observeHistogram("http.request_duration_ms", v);
    }
    const h = registry.snapshot().http.request_duration_ms;
    expect(h.count).toBe(10);
    expect(h.sum).toBe(550);
    expect(h.p50).toBeGreaterThanOrEqual(40);
    expect(h.p50).toBeLessThanOrEqual(60);
    expect(h.p95).toBeGreaterThanOrEqual(90);
  });

  it("returns count=0 when never observed", () => {
    expect(registry.snapshot().http.request_duration_ms.count).toBe(0);
    expect(registry.snapshot().sqlite.query_duration_ms.count).toBe(0);
  });
});

describe("observability/metrics business + sqlite helpers", () => {
  it("recordBusinessAction increments success / failure under business namespace", () => {
    recordBusinessAction(registry, "work_publish", "success");
    recordBusinessAction(registry, "work_publish", "success");
    recordBusinessAction(registry, "work_publish", "failure");
    const snap = registry.snapshot();
    expect(snap.business.work_publish).toEqual({ success: 2, failure: 1 });
  });

  it("recordSqliteQuery increments queries_total + slow_queries when over threshold", () => {
    recordSqliteQuery(registry, 50, 100);
    recordSqliteQuery(registry, 150, 100);
    recordSqliteQuery(registry, 250, 100);
    const snap = registry.snapshot();
    expect(snap.sqlite.queries_total).toBe(3);
    expect(snap.sqlite.slow_queries).toBe(2);
    expect(snap.sqlite.query_duration_ms.count).toBe(3);
  });
});

describe("observability/metrics snapshot completeness + safety", () => {
  it("returns full schema with zeroed defaults at startup", () => {
    const snap = createMetricsRegistry().snapshot();
    expect(snap.http.requests_total).toBe(0);
    expect(snap.http.errors_total).toBe(0);
    expect(snap.http.request_duration_ms).toEqual(
      expect.objectContaining({ count: 0, sum: 0 }),
    );
    expect(snap.sqlite.queries_total).toBe(0);
    expect(snap.sqlite.errors_total).toBe(0);
    expect(snap.sqlite.slow_queries).toBe(0);
    expect(snap.business).toEqual({});
  });

  it("does not contain sensitive substrings", () => {
    recordBusinessAction(registry, "work_publish", "success");
    const serialized = JSON.stringify(registry.snapshot());
    for (const forbidden of ["password", "Authorization", "Bearer ", "@example.com"]) {
      expect(serialized).not.toContain(forbidden);
    }
  });
});
