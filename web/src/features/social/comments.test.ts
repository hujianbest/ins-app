import { expect, test } from "vitest";

import { createShowcaseSeedSnapshot } from "@/features/community/contracts";
import { createSqliteCommunityRepositoryBundle } from "@/features/community/sqlite";
import {
  modelProfiles,
  photographerProfiles,
  works,
} from "@/features/showcase/sample-data";

import {
  getWorkComments,
  saveWorkCommentForViewer,
} from "./comments";

test("comment service rejects empty and overlong comments", async () => {
  const snapshot = createShowcaseSeedSnapshot(
    [...photographerProfiles, ...modelProfiles],
    works,
  );
  const bundle = createSqliteCommunityRepositoryBundle({
    databasePath: ":memory:",
    seed: {
      profiles: snapshot.profiles,
      works: snapshot.works,
      curation: [],
    },
  });

  await expect(
    saveWorkCommentForViewer("demo-account:model", "neon-portrait-study", "   ", bundle),
  ).rejects.toThrow(/1\.\.500/i);

  await expect(
    saveWorkCommentForViewer(
      "demo-account:model",
      "neon-portrait-study",
      "x".repeat(501),
      bundle,
    ),
  ).rejects.toThrow(/1\.\.500/i);

  bundle.close();
});

test("comment service stores comments and returns them in latest-first order", async () => {
  const snapshot = createShowcaseSeedSnapshot(
    [...photographerProfiles, ...modelProfiles],
    works,
  );
  const bundle = createSqliteCommunityRepositoryBundle({
    databasePath: ":memory:",
    seed: {
      profiles: snapshot.profiles,
      works: snapshot.works,
      curation: [],
    },
  });

  await saveWorkCommentForViewer(
    "demo-account:model",
    "neon-portrait-study",
    "First comment",
    bundle,
  );
  await saveWorkCommentForViewer(
    "demo-account:photographer",
    "neon-portrait-study",
    "Newest comment",
    bundle,
  );

  await expect(getWorkComments("neon-portrait-study", bundle)).resolves.toMatchObject([
    {
      body: "Newest comment",
      authorLabel: "摄影师",
    },
    {
      body: "First comment",
      authorLabel: "模特",
    },
  ]);

  bundle.close();
});
