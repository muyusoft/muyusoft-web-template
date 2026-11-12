import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnnouncementList } from "@/features/announcements/components/AnnouncementList";
import type { Announcement } from "@/features/announcements/types/announcement.types";

// next-intl is mocked in vitest.setup.ts: t() returns the key and the locale is "en".
const ANNOUNCEMENTS: Announcement[] = [
  { id: "a1", title: "Launch", summary: "We are live", publishedAt: "2026-01-15T12:00:00Z" },
  { id: "a2", title: "Maintenance", summary: "Short downtime", publishedAt: "2026-02-01T12:00:00Z" },
];

describe("AnnouncementList", () => {
  it("renders one item per announcement", () => {
    render(<AnnouncementList announcements={ANNOUNCEMENTS} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "Launch" })).toBeDefined();
  });

  it("shows the publication date formatted for the locale", () => {
    render(<AnnouncementList announcements={ANNOUNCEMENTS.slice(0, 1)} />);
    expect(screen.getByText("Jan 15, 2026")).toBeDefined();
  });

  it("shows the empty state when there are no announcements", () => {
    render(<AnnouncementList announcements={[]} />);
    expect(screen.queryByRole("list")).toBeNull();
    expect(screen.getByText("empty")).toBeDefined();
  });
});
