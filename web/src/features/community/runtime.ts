import { getStorageConfig } from "@/config/env";

import {
  createReadonlySqliteCommunityRepositoryBundle,
  getDefaultSqliteCommunityRepositoryBundle,
  type SqliteCommunityRepositoryBundle,
} from "./sqlite";
import type { CommunityRepositoryBundle } from "./types";

export type CommunityRuntimeInfo = {
  databaseProvider: "sqlite";
  databasePath: string;
};

export function getCommunityRuntimeInfo(): CommunityRuntimeInfo {
  const config = getStorageConfig();

  return {
    databaseProvider: config.databaseProvider,
    databasePath: config.sqliteDatabasePath,
  };
}

export function getDefaultCommunityRepositoryBundle(): CommunityRepositoryBundle {
  const runtime = getCommunityRuntimeInfo();

  return getDefaultSqliteCommunityRepositoryBundle({
    databasePath: runtime.databasePath,
  });
}

export function createReadonlyCommunityRepositoryBundle(): SqliteCommunityRepositoryBundle {
  const runtime = getCommunityRuntimeInfo();

  return createReadonlySqliteCommunityRepositoryBundle({
    databasePath: runtime.databasePath,
  });
}
