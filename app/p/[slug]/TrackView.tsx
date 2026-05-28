"use client";

import { useEffect } from "react";

/** Fire-and-forget POST to record that the client opened the hosted proposal.
 * Skipped if a previous view has already been recorded server-side. */
export function TrackView({ slug, alreadyViewed }: { slug: string; alreadyViewed: boolean }) {
  useEffect(() => {
    if (alreadyViewed) return;
    void fetch(`/p/${encodeURIComponent(slug)}/track`, { method: "POST" }).catch(() => {});
  }, [slug, alreadyViewed]);
  return null;
}
