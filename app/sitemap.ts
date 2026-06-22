import type { MetadataRoute } from "next";
import { SITE } from "@/lib/links";

// Static, publicly-linkable routes. Per-handle /share pages are generated on
// demand (unbounded handle space) so they aren't enumerated here.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/chat", "/dossier", "/group", "/room"];
  return routes.map((r) => ({
    url: `${SITE}${r || "/"}`,
    changeFrequency: "weekly",
    priority: r === "" ? 1 : 0.7,
  }));
}
