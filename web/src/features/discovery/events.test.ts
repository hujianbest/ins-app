import { expect, test } from "vitest";

import { createShowcaseSeedSnapshot } from "@/features/community/contracts";
import { createSqliteCommunityRepositoryBundle } from "@/features/community/sqlite";
import {
  modelProfiles,
  photographerProfiles,
  works,
} from "@/features/showcase/sample-data";

import { recordDiscoveryEvent } from "./events";

test("recordDiscoveryEvent persists success and failure discovery events in sqlite", async () => {
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

  await recordDiscoveryEvent(
    {
      eventType: "profile_view",
      actorAccountId: null,
      targetType: "profile",
      targetId: "photographer:sample-photographer",
      targetProfileId: "photographer:sample-photographer",
      surface: "profile_page",
      query: " 上海  ",
      success: true,
    },
    bundle,
  );

  await recordDiscoveryEvent(
    {
      eventType: "contact_start",
      actorAccountId: null,
      targetType: "profile",
      targetId: "photographer:sample-photographer",
      targetProfileId: "photographer:sample-photographer",
      surface: "contact:profile",
      query: "",
      success: false,
      failureReason: "unauthenticated",
    },
    bundle,
  );

  await expect(bundle.discovery.listAll()).resolves.toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        eventType: "profile_view",
        actorAccountId: null,
        targetId: "photographer:sample-photographer",
        query: "上海",
        success: true,
      }),
      expect.objectContaining({
        eventType: "contact_start",
        actorAccountId: null,
        targetId: "photographer:sample-photographer",
        success: false,
        failureReason: "unauthenticated",
      }),
    ]),
  );

  bundle.close();
});
