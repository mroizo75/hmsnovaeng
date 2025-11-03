import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStorage } from "@/lib/storage";
import path from "path";

/**
 * POST /api/admin/blog/upload
 * Upload image for blog posts (superadmin only)
 * Stores in R2: superadmin/blog/images/
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.isSuperAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP and GIF are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }

    // Generate unique file key with superadmin prefix
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = path.extname(file.name);
    const base = path.basename(file.name, ext).replace(/[^a-z0-9]/gi, "-").toLowerCase();
    
    const key = `superadmin/blog/images/${timestamp}-${random}-${base}${ext}`;

    // Upload to R2
    const storage = getStorage();
    await storage.upload(key, file);

    // For blog images, we use our API route that never expires
    // This is better than presigned URLs that expire after 7 days
    const url = `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/blog/images/${encodeURIComponent(key)}`;

    return NextResponse.json({
      success: true,
      url,
      key,
      filename: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/blog/upload
 * Delete uploaded image
 */
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.isSuperAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { key } = await req.json();

    if (!key || !key.startsWith("superadmin/blog/images/")) {
      return NextResponse.json({ error: "Invalid image key" }, { status: 400 });
    }

    const storage = getStorage();
    await storage.delete(key);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}

