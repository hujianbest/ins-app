import { describe, expect, it } from "vitest";

import {
  getCurrentTraceId,
  isValidTraceId,
  runWithTrace,
} from "./trace";

describe("observability/trace", () => {
  describe("isValidTraceId", () => {
    it("accepts kebab + underscore alphanumeric in [8, 128]", () => {
      expect(isValidTraceId("abc-123_DEF")).toBe(true);
      expect(isValidTraceId("a".repeat(8))).toBe(true);
      expect(isValidTraceId("a".repeat(128))).toBe(true);
    });

    it("rejects too short, too long, whitespace, or unsupported chars", () => {
      expect(isValidTraceId("a".repeat(7))).toBe(false);
      expect(isValidTraceId("a".repeat(129))).toBe(false);
      expect(isValidTraceId("   ")).toBe(false);
      expect(isValidTraceId("abc def")).toBe(false);
      expect(isValidTraceId("abc/def")).toBe(false);
    });
  });

  describe("runWithTrace + getCurrentTraceId", () => {
    it("returns undefined outside any run", () => {
      expect(getCurrentTraceId()).toBeUndefined();
    });

    it("returns the current trace id inside run", () => {
      runWithTrace("trace-id-A", () => {
        expect(getCurrentTraceId()).toBe("trace-id-A");
      });
    });

    it("supports nested run, inner shadows outer, outer restored after inner", () => {
      runWithTrace("trace-A", () => {
        expect(getCurrentTraceId()).toBe("trace-A");
        runWithTrace("trace-B", () => {
          expect(getCurrentTraceId()).toBe("trace-B");
        });
        expect(getCurrentTraceId()).toBe("trace-A");
      });
      expect(getCurrentTraceId()).toBeUndefined();
    });

    it("supports async fn and propagates trace through await", async () => {
      const observed: Array<string | undefined> = [];

      await runWithTrace("trace-async", async () => {
        observed.push(getCurrentTraceId());
        await Promise.resolve();
        observed.push(getCurrentTraceId());
      });

      expect(observed).toEqual(["trace-async", "trace-async"]);
      expect(getCurrentTraceId()).toBeUndefined();
    });
  });
});
