import { AsyncLocalStorage } from "node:async_hooks";

export type TraceContext = {
  traceId: string;
};

const traceStorage = new AsyncLocalStorage<TraceContext>();

const TRACE_ID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

export function isValidTraceId(value: string): boolean {
  if (typeof value !== "string") {
    return false;
  }

  return TRACE_ID_PATTERN.test(value);
}

export function runWithTrace<T>(traceId: string, fn: () => T): T {
  return traceStorage.run({ traceId }, fn);
}

export function getCurrentTraceId(): string | undefined {
  return traceStorage.getStore()?.traceId;
}
