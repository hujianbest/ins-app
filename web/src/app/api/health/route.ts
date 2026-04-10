import { getAppConfig } from "@/config/env";
import {
  createReadonlyCommunityRepositoryBundle,
  getCommunityRuntimeInfo,
} from "@/features/community/runtime";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = getAppConfig();

  if (!config.healthcheckEnabled) {
    return Response.json(
      {
        ok: false,
        reason: "healthcheck_disabled",
      },
      { status: 503 },
    );
  }

  const runtime = getCommunityRuntimeInfo();

  try {
    const bundle = createReadonlyCommunityRepositoryBundle();
    bundle.close();

    return Response.json({
      ok: true,
      service: "lens-archive",
      environment: config.nodeEnv,
      runtime,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown healthcheck failure";

    return Response.json(
      {
        ok: false,
        reason: "repository_unavailable",
        error: message,
        runtime,
      },
      { status: 503 },
    );
  }
}
