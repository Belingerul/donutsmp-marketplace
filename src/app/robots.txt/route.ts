export const runtime = "nodejs";

export async function GET() {
  const body = `User-agent: *
Allow: /

Sitemap: https://www.donutsmpsellmarket.online/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
