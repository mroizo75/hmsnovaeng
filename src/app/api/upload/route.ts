import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { generateFileKey } from "@/lib/storage";
import { validateDocumentFile, validateImageFile, validateFileSize } from "@/lib/file-validation";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || "hmsnova";

const ALLOWED_FOLDERS = new Set([
  "eap", "loto", "fall-protection", "ppe",
  "toolbox-talks", "confined-space", "osha",
  "workers-comp", "bbp", "incidents", "training",
]);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tenants: true },
    });

    if (!user || user.tenants.length === 0) {
      return NextResponse.json({ error: "No tenant access" }, { status: 403 });
    }

    const tenantId = user.tenants[0].tenantId;
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!folder || typeof folder !== "string" || !ALLOWED_FOLDERS.has(folder)) {
      return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 });
    }

    const sizeValidation = validateFileSize(file.size, 25);
    if (!sizeValidation.isValid) {
      return NextResponse.json({ error: sizeValidation.error }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || "file";

    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);
    const validation = isImage
      ? await validateImageFile(fileBuffer)
      : await validateDocumentFile(fileBuffer);

    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const key = generateFileKey(tenantId, folder, fileName);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: validation.detectedType || "application/octet-stream",
        Metadata: {
          "uploaded-by": user.id,
          "tenant-id": tenantId,
        },
      })
    );

    return NextResponse.json({ key, fileName, success: true });
  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
