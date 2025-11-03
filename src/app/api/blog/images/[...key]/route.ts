import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";

/**
 * GET /api/blog/images/[...key]
 * Serve blog images from R2 (public access)
 * This provides permanent URLs for blog images
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key: keyArray } = await params;
    const key = keyArray.join("/");

    // Only allow access to superadmin blog images
    if (!key.startsWith("superadmin/blog/images/")) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const storage = getStorage();
    
    // Get presigned URL (7 days max) and redirect
    const signedUrl = await storage.getUrl(key, 604800);
    
    // Redirect to the signed URL
    return NextResponse.redirect(signedUrl, 307);
  } catch (error) {
    console.error("Error serving blog image:", error);
    return NextResponse.json(
      { error: "Image not found" },
      { status: 404 }
    );
  }
}

