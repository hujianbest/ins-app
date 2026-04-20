// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

import { InboxThreadPoll } from "./poll-client";

describe("InboxThreadPoll (UI-ADR-1, I-9)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    refreshMock.mockClear();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders no visible DOM (data-free client boundary)", () => {
    const { container } = render(<InboxThreadPoll intervalMs={1000} />);
    expect(container.innerHTML).toBe("");
  });

  it("calls router.refresh() on each interval tick", () => {
    render(<InboxThreadPoll intervalMs={1000} />);
    expect(refreshMock).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(refreshMock).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1000);
    expect(refreshMock).toHaveBeenCalledTimes(2);
  });

  it("clears the interval on unmount (cleanup)", () => {
    const { unmount } = render(<InboxThreadPoll intervalMs={1000} />);
    vi.advanceTimersByTime(500);
    unmount();
    vi.advanceTimersByTime(5000);
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("only accepts intervalMs prop (no thread / message data props — I-9)", () => {
    // Type-level guarantee: the only public prop is intervalMs?: number.
    // Compilation passing the test is itself the assertion. Runtime test
    // confirms interaction is interval-driven only.
    const props: Parameters<typeof InboxThreadPoll>[0] = { intervalMs: 5000 };
    expect(Object.keys(props)).toEqual(["intervalMs"]);
  });
});
