import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { generateFileKey } from "@/lib/storage";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || "hmsnova";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Ikke autentisert" },
        { status: 401 }
      );
    }

    // Hent brukerens tenant
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tenants: true },
    });

    if (!user || user.tenants.length === 0) {
      return NextResponse.json(
        { error: "Ingen tenant tilknyttet" },
        { status: 403 }
      );
    }

    const tenantId = user.tenants[0].tenantId;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Ingen fil lastet opp" },
        { status: 400 }
      );
    }

    // Hent fil-properties fra Blob
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || "unknown.pdf";
    const fileType = file.type || "application/pdf";
    const fileSize = fileBuffer.length;

    // Valider filtype (kun PDF)
    if (fileType !== "application/pdf") {
      return NextResponse.json(
        { error: "Ugyldig filtype. Kun PDF er tillatt for sikkerhetsdatablad." },
        { status: 400 }
      );
    }

    // Valider filstørrelse (maks 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (fileSize > maxSize) {
      return NextResponse.json(
        { error: "Filen er for stor. Maksimal størrelse er 10MB." },
        { status: 400 }
      );
    }

    // Generer tenant-spesifikk key
    const key = generateFileKey(tenantId, "chemicals/sds", fileName);

    // Last opp til R2
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: fileType,
      })
    );

    return NextResponse.json({
      key,
      success: true,
    });
  } catch (error) {
    console.error("[Chemical Upload] Error:", error);
    return NextResponse.json(
      { error: "Filopplasting feilet" },
      { status: 500 }
    );
  }
}

