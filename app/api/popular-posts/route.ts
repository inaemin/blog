import { NextResponse } from "next/server";
import { getPopularPosts } from "@/lib/popular-posts";

export async function GET() {
  const posts = await getPopularPosts();
  return NextResponse.json({ posts });
}
