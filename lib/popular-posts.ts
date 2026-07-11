import { getStrictPublishedPosts } from "./content";

export async function getPopularPosts() {
  const posts = await getStrictPublishedPosts();
  return posts.slice(0, 3).map((post, index) => ({
    slug: post.slug,
    title: post.title,
    tag: post.tags[0] ?? "Blog",
    rank: index + 1,
    score: 0,
  }));
}
