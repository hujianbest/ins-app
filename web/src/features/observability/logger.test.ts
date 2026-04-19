import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  type LogRecord,
  createInMemoryLogger,
} from "./logger";
import { runWithTrace } from "./trace";

describe("observability/logger", () => {
  let logger: ReturnType<typeof createInMemoryLogger>;

  beforeEach(() => {
    logger = createInMemoryLogger({ level: "info" });
  });

  afterEach(() => {
    logger.reset();
  });

  describe("level filtering", () => {
    it("emits info when level=info", () => {
      logger.info("event.x", { module: "m" });
      expect(logger.records).toHaveLength(1);
    });

    it("drops info when level=warn", () => {
      const warnLogger = createInMemoryLogger({ level: "warn" });
      warnLogger.info("event.x", { module: "m" });
      expect(warnLogger.records).toHaveLength(0);
      warnLogger.warn("event.x", { module: "m" });
      expect(warnLogger.records).toHaveLength(1);
    });
  });

  describe("trace id auto-injection", () => {
    it("uses 'unknown' when no active trace", () => {
      logger.info("event.x", { module: "m" });
      expect(logger.records[0].traceId).toBe("unknown");
    });

    it("inherits current trace id when inside runWithTrace", () => {
      runWithTrace("test-trace-1", () => {
        logger.info("event.x", { module: "m" });
      });
      expect(logger.records[0].traceId).toBe("test-trace-1");
    });
  });

  describe("controlled key whitelist", () => {
    it("drops keys outside the controlled set", () => {
      logger.info("event.x", {
        module: "m",
        forbiddenKey: "x",
        password: "secret",
      } as never);
      const record = logger.records[0];
      expect(record).not.toHaveProperty("forbiddenKey");
      expect(record).not.toHaveProperty("password");
      expect(record.module).toBe("m");
    });

    it("keeps known controlled keys", () => {
      logger.info("event.x", {
        module: "m",
        workId: "w-1",
        creatorId: "c-2",
        postId: "p-3",
        slowQueryMs: 123,
      });
      const record = logger.records[0];
      expect(record.workId).toBe("w-1");
      expect(record.creatorId).toBe("c-2");
      expect(record.postId).toBe("p-3");
      expect(record.slowQueryMs).toBe(123);
    });
  });

  describe("size truncation (8 KiB)", () => {
    it("truncates oversized error.stack and marks truncated=true", () => {
      const huge = "x".repeat(20_000);
      logger.error("event.x", {
        module: "m",
        error: { name: "Boom", message: "oops", stack: huge },
      });
      const record = logger.records[0];
      const serialized = JSON.stringify(record);
      expect(serialized.length).toBeLessThanOrEqual(8 * 1024);
      expect(record.truncated).toBe(true);
    });

    it("does not mark truncated for normal-size payloads", () => {
      logger.info("event.x", { module: "m" });
      expect(logger.records[0].truncated).toBeUndefined();
    });
  });

  describe("JSON serializability (production mode)", () => {
    it("serializes each record into single-line JSON", () => {
      logger.info("event.x", { module: "m" });
      const serialized = JSON.stringify(logger.records[0]);
      expect(() => JSON.parse(serialized)).not.toThrow();
      expect(serialized.includes("\n")).toBe(false);
      const parsed: LogRecord = JSON.parse(serialized);
      expect(parsed.event).toBe("event.x");
      expect(parsed.level).toBe("info");
      expect(parsed.timestamp).toEqual(expect.any(String));
    });
  });
});
