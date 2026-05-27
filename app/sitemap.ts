import type { MetadataRoute } from "next";

const base = "https://rufus.exposql.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/proposals", "/rfp", "/contracts", "/pricing", "/about"];
  const now = new Date();
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
