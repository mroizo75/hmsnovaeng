import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/admin/blog
 * List all blog posts (superadmin only)
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.isSuperAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const posts = await db.blogPost.findMany({
      include: {
        author: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/blog
 * Create new blog post (superadmin only)
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.isSuperAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Handle publishedAt properly
    let publishedAt = null;
    if (data.status === "PUBLISHED") {
      if (data.publishedAt) {
        publishedAt = new Date(data.publishedAt).toISOString();
      } else {
        publishedAt = new Date().toISOString();
      }
    }

    // Handle scheduledFor properly
    let scheduledFor = null;
    if (data.status === "SCHEDULED" && data.scheduledFor) {
      scheduledFor = new Date(data.scheduledFor).toISOString();
    }

    const post = await db.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        keywords: data.keywords || null,
        status: data.status || "DRAFT",
        publishedAt,
        scheduledFor,
        authorId: session.user.id,
        categoryId: data.categoryId || null,
        tags: {
          connectOrCreate: data.tags?.map((tagName: string) => ({
            where: { name: tagName },
            create: {
              name: tagName,
              slug: tagName.toLowerCase().replace(/\s+/g, "-"),
            },
          })) || [],
        },
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
            color: true,
          },
        },
        tags: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}

