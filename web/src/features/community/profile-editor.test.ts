import { expect, test } from "vitest";

import {
  modelProfiles,
  photographerProfiles,
  works,
} from "@/features/showcase/sample-data";

import { createShowcaseSeedSnapshot } from "./contracts";
import {
  getPublicProfilePageModel,
} from "./public-read-model";
import {
  getStudioProfileEditorModel,
  saveCreatorProfileForRole,
} from "./profile-editor";
import { createSqliteCommunityRepositoryBundle } from "./sqlite";

test("saving a creator profile updates the subsequent public profile read model", async () => {
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
    saveCreatorProfileForRole(
      "photographer",
      {
        name: "Updated Avery",
        city: "南京",
        tagline: "updated by repository action",
        bio: "Updated biography from studio profile action.",
      },
      bundle,
    ),
  ).resolves.toMatchObject({
    role: "photographer",
    name: "Updated Avery",
    city: "南京",
  });

  await expect(
    getPublicProfilePageModel("photographer", "sample-photographer", bundle),
  ).resolves.toMatchObject({
    name: "Updated Avery",
    city: "南京",
    tagline: "updated by repository action",
    bio: "Updated biography from studio profile action.",
  });

  bundle.close();
});

test("studio profile editor resolves the repository-backed profile for the current creator role", async () => {
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
    getStudioProfileEditorModel("model", bundle),
  ).resolves.toMatchObject({
    id: "model:sample-model",
    slug: "sample-model",
    name: "Mika Rowan",
  });

  bundle.close();
});

test("saving a creator profile rejects when the current role has no repository-backed profile", async () => {
  const snapshot = createShowcaseSeedSnapshot(photographerProfiles, []);
  const bundle = createSqliteCommunityRepositoryBundle({
    databasePath: ":memory:",
    seed: {
      profiles: snapshot.profiles,
      works: [],
      curation: [],
    },
  });

  await expect(
    saveCreatorProfileForRole(
      "model",
      {
        name: "Missing Model",
        city: "上海",
        tagline: "should not save",
        bio: "missing profile",
      },
      bundle,
    ),
  ).rejects.toThrow(/creator profile/i);

  bundle.close();
});
