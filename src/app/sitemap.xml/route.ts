export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const base = "https://www.donutsmpsellmarket.online";

  const staticUrls = [
    "",
    "/signin",
    "/signup",
    "/terms",
    "/privacy",
  ];

  // We do NOT include /admin or /offer/* in sitemap.

  const urls = staticUrls
    .map((p) => `${base}${p}`)
    .map((loc) => ({ loc }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
  </url>`
  )
  .join("\n")}
</urlset>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
