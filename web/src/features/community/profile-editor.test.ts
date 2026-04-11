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
        shootingFocus: "品牌人像",
        discoveryContext: "希望被华东品牌团队与长期合作模特看到",
        tagline: "updated by repository action",
        bio: "Updated biography from studio profile action.",
        externalHandoffUrl: "https://portfolio.example.com/avery",
      },
      bundle,
    ),
  ).resolves.toMatchObject({
    role: "photographer",
    name: "Updated Avery",
    city: "南京",
    shootingFocus: "品牌人像",
    discoveryContext: "希望被华东品牌团队与长期合作模特看到",
    externalHandoffUrl: "https://portfolio.example.com/avery",
  });

  await expect(
    getPublicProfilePageModel("photographer", "sample-photographer", bundle),
  ).resolves.toMatchObject({
    name: "Updated Avery",
    city: "南京",
    shootingFocus: "品牌人像",
    discoveryContext: "希望被华东品牌团队与长期合作模特看到",
    tagline: "updated by repository action",
    bio: "Updated biography from studio profile action.",
    externalHandoffUrl: "https://portfolio.example.com/avery",
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
    shootingFocus: "编辑与品牌形象",
    discoveryContext: "希望被杭州及周边的摄影师与品牌样片团队看到",
    externalHandoffUrl: "https://portfolio.example.com/mika",
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
        shootingFocus: "商业肖像",
        discoveryContext: "希望被本地合作团队看到",
        tagline: "should not save",
        bio: "missing profile",
        externalHandoffUrl: "https://portfolio.example.com/missing-model",
      },
      bundle,
    ),
  ).rejects.toThrow(/creator profile/i);

  bundle.close();
});

test("saving a creator profile rejects an invalid external handoff url", async () => {
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
        city: "上海",
        shootingFocus: "编辑人像",
        discoveryContext: "希望被高匹配观众看到",
        tagline: "",
        bio: "",
        externalHandoffUrl: "not-a-url",
      },
      bundle,
    ),
  ).rejects.toThrow(/external handoff url/i);

  bundle.close();
});

test("saving a creator profile allows optional discovery fields to be blank", async () => {
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
        city: "上海",
        shootingFocus: "   ",
        discoveryContext: "",
        tagline: "",
        bio: "   ",
        externalHandoffUrl: "",
      },
      bundle,
    ),
  ).resolves.toMatchObject({
    shootingFocus: "",
    discoveryContext: "",
    tagline: "",
    bio: "",
    externalHandoffUrl: "",
  });

  bundle.close();
});
