import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createErrorResponse, createSuccessResponse, ErrorCodes } from "@/lib/validations/api";
import { buildInspectionImageKey } from "@/lib/inspection-image-upload";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || process.env.S3_BUCKET || "hmsnova";

/**
 * POST /api/inspections/upload
 * Upload images for inspection findings
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.tenantId) {
      return createErrorResponse(ErrorCodes.UNAUTHORIZED, "Ikke autentisert", 401);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const inspectionIdValue = formData.get("inspectionId");

    if (!(file instanceof File)) {
      return createErrorResponse(ErrorCodes.VALIDATION_ERROR, "Ingen fil lastet opp", 400);
    }

    if (typeof inspectionIdValue !== "string" || inspectionIdValue.trim().length === 0) {
      return createErrorResponse(ErrorCodes.VALIDATION_ERROR, "InspectionId mangler", 400);
    }

    const inspectionId = inspectionIdValue.trim();

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        "Ugyldig filtype. Kun JPG, PNG og WebP er tillatt",
        400
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        "Filen er for stor. Maks 10MB",
        400
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const tenantId = session.user.tenantId;
    const key = buildInspectionImageKey({
      tenantId,
      inspectionId,
      fileName: file.name || `${timestamp}.jpg`,
      timestamp,
    });

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const url = `/api/inspections/images/${encodeURIComponent(key)}`;

    return createSuccessResponse({ key, url }, "Bilde lastet opp", 201);
  } catch (error) {
    console.error("[Inspection Upload] Error:", error);
    return createErrorResponse(ErrorCodes.INTERNAL_ERROR, "Kunne ikke laste opp bilde", 500);
  }
}

/**
 * DELETE /api/inspections/upload
 * Delete uploaded image
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.tenantId) {
      return createErrorResponse(ErrorCodes.UNAUTHORIZED, "Ikke autentisert", 401);
    }

    const { searchParams } = new URL(request.url);
    let key = searchParams.get("key");

    if (!key) {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          const body = await request.json();
          if (body?.key && typeof body.key === "string") {
            key = body.key;
          }
        } catch {
          // Ignorer JSON-feil for å kunne feilhåndtere under
        }
      }
    }

    if (!key) {
      return createErrorResponse(ErrorCodes.VALIDATION_ERROR, "Ingen nøkkel spesifisert", 400);
    }

    const decodedKey = key.includes("%") ? decodeURIComponent(key) : key;
    const tenantPrefix = `tenants/${session.user.tenantId}/`;

    if (!decodedKey.startsWith(tenantPrefix)) {
      return createErrorResponse(ErrorCodes.FORBIDDEN, "Ugyldig nøkkel", 403);
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: decodedKey,
      })
    );

    return createSuccessResponse(undefined, "Bilde slettet");
  } catch (error) {
    console.error("[Inspection Upload DELETE] Error:", error);
    return createErrorResponse(ErrorCodes.INTERNAL_ERROR, "Kunne ikke slette bilde", 500);
  }
}

