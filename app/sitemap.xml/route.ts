import { getAllTags, getPublishedCraftItems, getPublishedPosts } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export async function GET() {
  const [posts, craftItems, tags] = await Promise.all([
    getPublishedPosts(),
    getPublishedCraftItems(),
    getAllTags(),
  ]);

  const staticPaths = ["", "/posts", "/craft"];
  const urls = [
    ...staticPaths.map((pathname) => `${siteConfig.url}${pathname}`),
    ...posts.map((post) => `${siteConfig.url}/posts/${post.slug}`),
    ...craftItems.map((item) => `${siteConfig.url}/craft#${item.slug}`),
    ...tags.map((tag) => `${siteConfig.url}/tags/${encodeURIComponent(tag)}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls.map((url) => `<url><loc>${url}</loc></url>`).join("")}
    </urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
