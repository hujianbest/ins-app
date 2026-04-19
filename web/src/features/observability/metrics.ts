export type LabelMap = Record<string, string>;

export type HistogramSnapshot = {
  count: number;
  sum: number;
  p50: number;
  p95: number;
  p99: number;
  max: number;
};

export type BusinessSnapshot = Record<string, { success: number; failure: number }>;

export type RecommendationsSectionSnapshot = {
  cards_rendered: number;
  empty: number;
};

export type RecommendationsSnapshot = {
  related_creators: RecommendationsSectionSnapshot;
  related_works: RecommendationsSectionSnapshot;
};

export type MetricsSnapshot = {
  http: {
    requests_total: number;
    errors_total: number;
    request_duration_ms: HistogramSnapshot;
  };
  sqlite: {
    queries_total: number;
    errors_total: number;
    slow_queries: number;
    query_duration_ms: HistogramSnapshot;
  };
  business: BusinessSnapshot;
  /**
   * Phase 2 — Discovery Intelligence V1 (ADR-3): purely additive
   * top-level namespace. Always emitted (zeroed at startup) so
   * consumers can rely on the field existing per FR-006 #1.
   */
  recommendations: RecommendationsSnapshot;
  gauges?: Record<string, number>;
  labels?: Record<string, Record<string, number>>;
};

const COUNTER_NAMES = [
  "http.requests_total",
  "http.errors_total",
  "sqlite.queries_total",
  "sqlite.errors_total",
  "sqlite.slow_queries",
] as const;

type CounterName = (typeof COUNTER_NAMES)[number];

/**
 * Phase 2 — Discovery Intelligence V1 (FR-006): pre-registered so
 * the snapshot reports zeroed values from process start, even if the
 * recommendations module never increments them.
 */
const RECOMMENDATIONS_COUNTER_NAMES = [
  "recommendations.related_creators.cards_rendered",
  "recommendations.related_creators.empty",
  "recommendations.related_works.cards_rendered",
  "recommendations.related_works.empty",
] as const;

type RecommendationsCounterName = (typeof RECOMMENDATIONS_COUNTER_NAMES)[number];

const HISTOGRAM_NAMES = [
  "http.request_duration_ms",
  "sqlite.query_duration_ms",
] as const;

type HistogramName = (typeof HISTOGRAM_NAMES)[number];

export interface MetricsRegistry {
  incrementCounter(name: string, labels?: LabelMap, by?: number): void;
  setGauge(name: string, value: number): void;
  observeHistogram(name: string, value: number): void;
  snapshot(): MetricsSnapshot;
}

function emptyHistogram(): { values: number[] } {
  return { values: [] };
}

function summarizeHistogram(values: number[]): HistogramSnapshot {
  if (values.length === 0) {
    return { count: 0, sum: 0, p50: 0, p95: 0, p99: 0, max: 0 };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const pickPercentile = (p: number): number => {
    const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
    return sorted[Math.max(0, idx)];
  };
  return {
    count: sorted.length,
    sum,
    p50: pickPercentile(50),
    p95: pickPercentile(95),
    p99: pickPercentile(99),
    max: sorted[sorted.length - 1],
  };
}

function labelKey(labels?: LabelMap): string | undefined {
  if (!labels) return undefined;
  const keys = Object.keys(labels).sort();
  if (keys.length === 0) return undefined;
  return keys.map((k) => `${k}=${labels[k]}`).join(",");
}

export function createMetricsRegistry(): MetricsRegistry {
  const counters = new Map<string, number>();
  const labelCounters = new Map<string, Record<string, number>>();
  const gauges = new Map<string, number>();
  const histograms = new Map<string, { values: number[] }>();
  const businessCounters = new Map<string, { success: number; failure: number }>();

  for (const name of COUNTER_NAMES) {
    counters.set(name, 0);
  }
  for (const name of RECOMMENDATIONS_COUNTER_NAMES) {
    counters.set(name, 0);
  }
  for (const name of HISTOGRAM_NAMES) {
    histograms.set(name, emptyHistogram());
  }

  return {
    incrementCounter(name, labels, by = 1) {
      counters.set(name, (counters.get(name) ?? 0) + by);
      const key = labelKey(labels);
      if (key) {
        const existing = labelCounters.get(name) ?? {};
        existing[key] = (existing[key] ?? 0) + by;
        labelCounters.set(name, existing);
      }
      if (name.startsWith("business.")) {
        const [, action, status] = name.split(".");
        if (action && (status === "success" || status === "failure")) {
          const entry = businessCounters.get(action) ?? { success: 0, failure: 0 };
          entry[status] += by;
          businessCounters.set(action, entry);
        }
      }
    },
    setGauge(name, value) {
      gauges.set(name, value);
    },
    observeHistogram(name, value) {
      const h = histograms.get(name) ?? emptyHistogram();
      h.values.push(value);
      histograms.set(name, h);
    },
    snapshot() {
      const business: BusinessSnapshot = {};
      for (const [k, v] of businessCounters.entries()) {
        business[k] = v;
      }

      const labels: Record<string, Record<string, number>> = {};
      for (const [k, v] of labelCounters.entries()) {
        labels[k] = { ...v };
      }

      const gaugesOut: Record<string, number> = {};
      for (const [k, v] of gauges.entries()) {
        gaugesOut[k] = v;
      }

      const counterValue = (name: CounterName) => counters.get(name) ?? 0;
      const histogramSummary = (name: HistogramName) =>
        summarizeHistogram(histograms.get(name)?.values ?? []);
      const recommendationsCounterValue = (name: RecommendationsCounterName) =>
        counters.get(name) ?? 0;

      return {
        http: {
          requests_total: counterValue("http.requests_total"),
          errors_total: counterValue("http.errors_total"),
          request_duration_ms: histogramSummary("http.request_duration_ms"),
        },
        sqlite: {
          queries_total: counterValue("sqlite.queries_total"),
          errors_total: counterValue("sqlite.errors_total"),
          slow_queries: counterValue("sqlite.slow_queries"),
          query_duration_ms: histogramSummary("sqlite.query_duration_ms"),
        },
        business,
        recommendations: {
          related_creators: {
            cards_rendered: recommendationsCounterValue(
              "recommendations.related_creators.cards_rendered",
            ),
            empty: recommendationsCounterValue(
              "recommendations.related_creators.empty",
            ),
          },
          related_works: {
            cards_rendered: recommendationsCounterValue(
              "recommendations.related_works.cards_rendered",
            ),
            empty: recommendationsCounterValue(
              "recommendations.related_works.empty",
            ),
          },
        },
        gauges: Object.keys(gaugesOut).length > 0 ? gaugesOut : undefined,
        labels: Object.keys(labels).length > 0 ? labels : undefined,
      };
    },
  };
}

export function recordBusinessAction(
  registry: MetricsRegistry,
  action: string,
  outcome: "success" | "failure",
): void {
  registry.incrementCounter(`business.${action}.${outcome}`);
}

export function recordSqliteQuery(
  registry: MetricsRegistry,
  durationMs: number,
  slowThresholdMs: number,
): void {
  registry.incrementCounter("sqlite.queries_total");
  registry.observeHistogram("sqlite.query_duration_ms", durationMs);
  if (durationMs > slowThresholdMs) {
    registry.incrementCounter("sqlite.slow_queries");
  }
}
