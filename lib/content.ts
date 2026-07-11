import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";

export type ContentStatus = "draft" | "published" | "private";

export type PostFrontmatter = {
  title: string;
  description: string;
  publishedAt?: string;
  updatedAt?: string;
  slug: string;
  tags: string[];
  readingTime: string;
  status: ContentStatus;
  thumbnail?: string;
};

export type CraftFrontmatter = {
  title: string;
  description: string;
  publishedAt?: string;
  slug: string;
  status: ContentStatus;
  tags?: string[];
  thumbnail?: string;
  externalUrl?: string;
};

export type Post = PostFrontmatter & {
  body: string;
};

export type Craft = CraftFrontmatter & {
  body: string;
};

const contentRoot = path.join(process.cwd(), "content");
type FrontmatterValue = string | string[];
type FrontmatterEntry = readonly [string, FrontmatterValue];

async function readMdxFiles(directory: string) {
  const absoluteDirectory = path.join(contentRoot, directory);
  const entries = await readdir(absoluteDirectory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => path.join(absoluteDirectory, entry.name));
}

function parseFrontmatter(raw: string) {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/u.exec(raw);
  if (!match) {
    throw new Error("MDX file is missing frontmatter.");
  }
  const [, frontmatterBlock, body] = match;
  return parseFrontmatterMatch(frontmatterBlock, body);
}

function parseFrontmatterMatch(frontmatterBlock: string, body: string) {
  const data = Object.fromEntries(
    frontmatterBlock.split("\n").map(parseFrontmatterLine).filter(isFrontmatterEntry),
  ) as Record<string, FrontmatterValue>;
  return { data, body: body.trim() };
}

function parseFrontmatterLine(line: string) {
  const separatorIndex = line.indexOf(":");

  if (separatorIndex === -1) {
    return undefined;
  }

  const key = line.slice(0, separatorIndex).trim();
  const rawValue = line.slice(separatorIndex + 1).trim();
  return [key, parseFrontmatterValue(rawValue)] as const;
}

function parseFrontmatterValue(rawValue: string): FrontmatterValue {
  if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
    return rawValue
      .slice(1, -1)
      .split(",")
      .map((value) => value.trim().replace(/^"|"$/g, ""))
      .filter(Boolean);
  }

  return rawValue.replace(/^"|"$/g, "");
}

function isFrontmatterEntry(value: FrontmatterEntry | undefined): value is FrontmatterEntry {
  return value !== undefined;
}

function assertString(value: string | string[] | undefined, field: string) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Invalid frontmatter field: ${field}`);
  }
  return value;
}

function assertStatus(value: string | string[] | undefined): ContentStatus {
  const status = assertString(value, "status");
  if (status !== "draft" && status !== "published" && status !== "private") {
    throw new Error(`Invalid content status: ${status}`);
  }
  return status;
}

function assertStringArray(value: string | string[] | undefined, field: string) {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid frontmatter field: ${field}`);
  }
  return value;
}

function optionalString(value: string | string[] | undefined) {
  if (typeof value !== "string") {
    return undefined;
  }

  return value;
}

function optionalStringArray(value: string | string[] | undefined) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value;
}

async function readPost(filePath: string): Promise<Post> {
  const raw = await readFile(filePath, "utf8");
  const { data, body } = parseFrontmatter(raw);
  return toPost(data, body);
}

function toBaseContent(data: Record<string, FrontmatterValue>) {
  return {
    title: assertString(data.title, "title"),
    description: assertString(data.description, "description"),
    publishedAt: optionalString(data.publishedAt),
    slug: assertString(data.slug, "slug"),
    status: assertStatus(data.status),
    thumbnail: optionalString(data.thumbnail),
  };
}

function toPost(data: Record<string, FrontmatterValue>, body: string): Post {
  return {
    ...toBaseContent(data),
    updatedAt: optionalString(data.updatedAt),
    tags: assertStringArray(data.tags, "tags"),
    readingTime: assertString(data.readingTime, "readingTime"),
    body,
  };
}

async function readCraft(filePath: string): Promise<Craft> {
  const raw = await readFile(filePath, "utf8");
  const { data, body } = parseFrontmatter(raw);
  return toCraft(data, body);
}

function toCraft(data: Record<string, FrontmatterValue>, body: string): Craft {
  return {
    ...toBaseContent(data),
    tags: optionalStringArray(data.tags),
    externalUrl: optionalString(data.externalUrl),
    body,
  };
}

function byPublishedAtDesc<T extends { publishedAt?: string }>(a: T, b: T) {
  return (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");
}

function isVisibleContentStatus(status: ContentStatus) {
  if (status === "published") {
    return true;
  }

  return process.env.NODE_ENV === "development";
}

function disableContentCacheInDevelopment() {
  if (process.env.NODE_ENV === "development" && process.env.VITEST !== "true") {
    noStore();
  }
}

export async function getAllPosts() {
  disableContentCacheInDevelopment();
  const files = await readMdxFiles("posts");
  const posts = await Promise.all(files.map(readPost));
  return posts.sort(byPublishedAtDesc);
}

export async function getPublishedPosts() {
  const posts = await getAllPosts();
  return posts.filter((post) => isVisibleContentStatus(post.status));
}

export async function getStrictPublishedPosts() {
  const posts = await getAllPosts();
  return posts.filter((post) => post.status === "published");
}

export async function getPostBySlug(slug: string) {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug && isVisibleContentStatus(post.status));
}

export async function getAllCraftItems() {
  disableContentCacheInDevelopment();
  const files = await readMdxFiles("craft");
  const craftItems = await Promise.all(files.map(readCraft));
  return craftItems.sort(byPublishedAtDesc);
}

export async function getPublishedCraftItems() {
  const craftItems = await getAllCraftItems();
  return craftItems.filter((item) => isVisibleContentStatus(item.status));
}

export async function getAllTags() {
  const posts = await getStrictPublishedPosts();
  return Array.from(new Set(posts.flatMap((post) => post.tags))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function formatDate(date?: string) {
  if (!date) return "날짜 미정";
  return date.replaceAll("-", ".");
}
