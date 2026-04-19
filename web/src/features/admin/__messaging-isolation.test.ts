// @vitest-environment node
//
// Phase 2 — Threaded Messaging V1 (I-6 / NFR-002 privacy boundary).
//
// String-scan reverse assertion: admin module source files MUST NOT
// reference messaging repositories. If this test ever turns red, an
// admin code path has started touching message threads / messages,
// which violates the privacy boundary established by Ops Back Office
// V1 + Threaded Messaging V1.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ADMIN_ROOTS = [
  join(process.cwd(), "src/features/admin"),
  join(process.cwd(), "src/app/studio/admin"),
];

const FORBIDDEN_TOKENS = [
  "bundle.messaging",
  "messaging.threads",
  "messaging.messages",
  "messaging.participants",
];

function* walk(dir: string): Generator<string> {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      yield* walk(full);
    } else if (stat.isFile()) {
      yield full;
    }
  }
}

function shouldScan(file: string): boolean {
  if (file.includes(".test.")) return false;
  return file.endsWith(".ts") || file.endsWith(".tsx");
}

describe("admin module isolation from messaging (I-6)", () => {
  for (const root of ADMIN_ROOTS) {
    it(`grep ${root} → 0 messaging references`, () => {
      const hits: string[] = [];
      for (const file of walk(root)) {
        if (!shouldScan(file)) continue;
        const content = readFileSync(file, "utf8");
        for (const token of FORBIDDEN_TOKENS) {
          if (content.includes(token)) {
            hits.push(`${file} → ${token}`);
          }
        }
      }
      expect(hits).toEqual([]);
    });
  }
});
