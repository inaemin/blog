import { getPublishedPosts } from "@/lib/content";
import { siteConfig } from "@/lib/site";

function renderPubDate(publishedAt?: string) {
  if (!publishedAt) {
    return "";
  }

  return `<pubDate>${new Date(publishedAt).toUTCString()}</pubDate>`;
}

export async function GET() {
  const posts = await getPublishedPosts();
  const items = posts
    .map((post) => {
      const url = `${siteConfig.url}/posts/${post.slug}`;
      return `
        <item>
          <title><![CDATA[${post.title}]]></title>
          <description><![CDATA[${post.description}]]></description>
          <link>${url}</link>
          <guid>${url}</guid>
          ${renderPubDate(post.publishedAt)}
        </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>${siteConfig.name}</title>
        <description>${siteConfig.description}</description>
        <link>${siteConfig.url}</link>
        ${items}
      </channel>
    </rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
