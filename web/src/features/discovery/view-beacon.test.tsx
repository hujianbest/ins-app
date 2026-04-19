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

test("DiscoveryViewBeacon delivers related_card_view via sendBeacon when available", async () => {
  const sendBeaconMock = vi.fn().mockReturnValue(true);
  Object.defineProperty(window.navigator, "sendBeacon", {
    configurable: true,
    value: sendBeaconMock,
  });
  const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);

  render(
    <DiscoveryViewBeacon
      eventType="related_card_view"
      targetType="profile"
      targetId="photographer:alpha"
      targetProfileId="photographer:alpha"
      surface="related_creators_section"
    />,
  );

  await waitFor(() => {
    expect(sendBeaconMock).toHaveBeenCalledTimes(1);
  });
  expect(sendBeaconMock.mock.calls[0]?.[0]).toBe("/api/discovery-events");
  expect(fetchMock).not.toHaveBeenCalled();
});

test("DiscoveryViewBeacon falls back to fetch when sendBeacon is unavailable for related_card_view", async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  Object.defineProperty(window.navigator, "sendBeacon", {
    configurable: true,
    value: undefined,
  });

  render(
    <DiscoveryViewBeacon
      eventType="related_card_view"
      targetType="work"
      targetId="work-fallback"
      targetProfileId="photographer:owner"
      surface="related_works_section"
    />,
  );

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  const [, init] = fetchMock.mock.calls[0] ?? [];
  expect((init as RequestInit | undefined)?.method).toBe("POST");
});

test("DiscoveryViewBeacon dedupes related_card_view events independently per surface", async () => {
  const sendBeaconMock = vi.fn().mockReturnValue(true);
  Object.defineProperty(window.navigator, "sendBeacon", {
    configurable: true,
    value: sendBeaconMock,
  });

  render(
    <DiscoveryViewBeacon
      eventType="related_card_view"
      targetType="profile"
      targetId="photographer:alpha"
      surface="related_creators_section"
    />,
  );

  await waitFor(() => {
    expect(sendBeaconMock).toHaveBeenCalledTimes(1);
  });

  cleanup();

  // Different surface — should still fire because dedupe key includes surface.
  render(
    <DiscoveryViewBeacon
      eventType="related_card_view"
      targetType="profile"
      targetId="photographer:alpha"
      surface="related_works_section"
    />,
  );

  await waitFor(() => {
    expect(sendBeaconMock).toHaveBeenCalledTimes(2);
  });
});
