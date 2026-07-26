import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    // The operator panel is staff-only and 404s for everyone else.
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/*/admin"] },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
