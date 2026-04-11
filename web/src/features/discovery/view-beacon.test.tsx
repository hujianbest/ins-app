import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import { DiscoveryViewBeacon } from "./view-beacon";

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
  vi.unstubAllGlobals();
});

test("DiscoveryViewBeacon dedupes repeated view events in the same session", async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));

  vi.stubGlobal("fetch", fetchMock);
  Object.defineProperty(window.navigator, "sendBeacon", {
    configurable: true,
    value: undefined,
  });

  render(
    <DiscoveryViewBeacon
      eventType="work_view"
      targetType="work"
      targetId="repo-work"
      targetProfileId="photographer:repo-photographer"
      surface="work_detail"
    />,
  );

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  cleanup();

  render(
    <DiscoveryViewBeacon
      eventType="work_view"
      targetType="work"
      targetId="repo-work"
      targetProfileId="photographer:repo-photographer"
      surface="work_detail"
    />,
  );

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
