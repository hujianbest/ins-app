import { expect, test } from "vitest";

import {
  modelProfiles,
  photographerProfiles,
  works,
} from "@/features/showcase/sample-data";

import { createShowcaseSeedSnapshot } from "./contracts";
import {
  getPublicProfilePageModel,
  getPublicWorkPageModel,
  listPublicWorkPageParams,
} from "./public-read-model";
import {
  getStudioWorksEditorModel,
  saveCreatorWorkForRole,
} from "./work-editor";
import { createSqliteCommunityRepositoryBundle } from "./sqlite";

test("saving a draft work keeps it out of public work params and detail reads", async () => {
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

  const draftWork = await saveCreatorWorkForRole(
    "photographer",
    {
      title: "New Draft Work",
      category: "概念人像",
      description: "Draft work description",
      detailNote: "Draft detail note",
      coverAsset: "work:new-draft-work:cover",
      intent: "save_draft",
    },
    bundle,
  );

  expect(draftWork.status).toBe("draft");
  await expect(getPublicWorkPageModel(draftWork.id, bundle)).resolves.toBeNull();
  await expect(listPublicWorkPageParams(bundle)).resolves.not.toContainEqual({
    workId: draftWork.id,
  });

  bundle.close();
});

test("publishing a work makes it visible in public work and profile reads", async () => {
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

  const publishedWork = await saveCreatorWorkForRole(
    "model",
    {
      title: "Published Model Story",
      category: "概念人像",
      description: "Published work description",
      detailNote: "Published work detail note",
      coverAsset: "work:published-model-story:cover",
      intent: "publish",
    },
    bundle,
  );

  await expect(getPublicWorkPageModel(publishedWork.id, bundle)).resolves.toMatchObject({
    id: publishedWork.id,
    title: "Published Model Story",
    ownerRole: "model",
  });
  await expect(
    getPublicProfilePageModel("model", "sample-model", bundle),
  ).resolves.toMatchObject({
    showcaseItems: expect.arrayContaining([
      expect.objectContaining({
        workId: publishedWork.id,
        title: "Published Model Story",
      }),
    ]),
  });

  bundle.close();
});

test("editing a published work keeps it public until it is explicitly reverted to draft", async () => {
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

  const updatedWork = await saveCreatorWorkForRole(
    "photographer",
    {
      workId: "neon-portrait-study",
      title: "Updated Neon Portrait",
      category: "编辑人像",
      description: "Updated published description",
      detailNote: "Updated published detail note",
      coverAsset: "work:neon-portrait-study:cover",
      intent: "publish",
    },
    bundle,
  );

  expect(updatedWork.status).toBe("published");
  await expect(getPublicWorkPageModel("neon-portrait-study", bundle)).resolves.toMatchObject({
    title: "Updated Neon Portrait",
    description: "Updated published description",
  });

  await expect(
    saveCreatorWorkForRole(
      "photographer",
      {
        workId: "neon-portrait-study",
        title: "Saved Without Unpublishing",
        category: "编辑人像",
        description: "Published work stays visible",
        detailNote: "Still visible after save_draft on published work",
        coverAsset: "work:neon-portrait-study:cover",
        intent: "save_draft",
      },
      bundle,
    ),
  ).resolves.toMatchObject({
    id: "neon-portrait-study",
    status: "published",
  });
  await expect(getPublicWorkPageModel("neon-portrait-study", bundle)).resolves.toMatchObject({
    title: "Saved Without Unpublishing",
    description: "Published work stays visible",
  });

  await saveCreatorWorkForRole(
    "photographer",
    {
      workId: "neon-portrait-study",
      title: "Updated Neon Portrait",
      category: "编辑人像",
      description: "Updated published description",
      detailNote: "Updated published detail note",
      coverAsset: "work:neon-portrait-study:cover",
      intent: "revert_to_draft",
    },
    bundle,
  );

  await expect(getPublicWorkPageModel("neon-portrait-study", bundle)).resolves.toBeNull();
  await expect(
    getPublicProfilePageModel("photographer", "sample-photographer", bundle),
  ).resolves.toMatchObject({
    showcaseItems: expect.not.arrayContaining([
      expect.objectContaining({ workId: "neon-portrait-study" }),
    ]),
  });

  bundle.close();
});

test("studio works editor resolves repository-backed works for the current creator role", async () => {
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

  await expect(getStudioWorksEditorModel("photographer", bundle)).resolves.toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: "neon-portrait-study",
        status: "published",
      }),
    ]),
  );

  bundle.close();
});

test("owner cannot mutate moderated works via any save intent (Phase 2 §3.2 FR-004 #6 / I-14)", async () => {
  const snapshot = createShowcaseSeedSnapshot(
    [...photographerProfiles, ...modelProfiles],
    works,
  );
  // Pick the first published work belonging to a photographer and force it to moderated
  const targetWork = snapshot.works.find(
    (w) => w.ownerRole === "photographer" && w.status === "published",
  );
  if (!targetWork) throw new Error("expected at least one published photographer work in seed");
  const moderatedWork = { ...targetWork, status: "moderated" as const };
  const bundle = createSqliteCommunityRepositoryBundle({
    databasePath: ":memory:",
    seed: {
      profiles: snapshot.profiles,
      works: [
        moderatedWork,
        ...snapshot.works.filter((w) => w.id !== targetWork.id),
      ],
      curation: [],
    },
  });

  for (const intent of ["save_draft", "publish", "revert_to_draft"] as const) {
    await expect(
      saveCreatorWorkForRole(
        "photographer",
        {
          workId: targetWork.id,
          title: targetWork.title,
          category: targetWork.category,
          description: targetWork.description,
          detailNote: targetWork.detailNote,
          coverAsset: targetWork.coverAsset ?? "x",
          intent,
        },
        bundle,
      ),
    ).rejects.toMatchObject({
      code: "moderated_work_owner_locked",
      status: 403,
    });
  }

  // Confirm the work status is still moderated after the failed attempts
  const after = await bundle.works.getById(targetWork.id);
  expect(after?.status).toBe("moderated");

  bundle.close();
});
