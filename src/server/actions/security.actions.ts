"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { z } from "zod";
import {
  AccessDecision,
  AccessReviewStatus,
  CIAValue,
  SecurityControlCategory,
  SecurityControlMaturity,
  SecurityControlStatus,
  SecurityAssetType,
} from "@prisma/client";
import { getActionContext } from "./action-context";

const sanitize = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const parseOptionalDate = (value?: string | null) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const revalidateSecurity = () => {
  revalidatePath("/dashboard/security");
  revalidatePath("/dashboard");
};

const createAssetSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional().nullable(),
  type: z.nativeEnum(SecurityAssetType).default("INFORMATION_SYSTEM"),
  ownerId: z.string().cuid().optional().nullable(),
  confidentiality: z.nativeEnum(CIAValue).default("MEDIUM"),
  integrity: z.nativeEnum(CIAValue).default("MEDIUM"),
  availability: z.nativeEnum(CIAValue).default("MEDIUM"),
  businessCriticality: z.coerce.number().int().min(1).max(5).optional().nullable(),
});

export async function createSecurityAsset(input: any) {
  try {
    const { tenantId } = await getActionContext();
    const validated = createAssetSchema.parse(input);

    const asset = await prisma.securityAsset.create({
      data: {
        tenantId,
        name: validated.name,
        description: sanitize(validated.description),
        type: validated.type,
        ownerId: validated.ownerId ?? null,
        confidentiality: validated.confidentiality,
        integrity: validated.integrity,
        availability: validated.availability,
        businessCriticality: validated.businessCriticality ?? null,
      },
    });

    revalidateSecurity();
    return { success: true, data: asset };
  } catch (error: any) {
    console.error("Create asset error:", error);
    return { success: false, error: error.message || "Kunne ikke opprette sikkerhetsobjekt" };
  }
}

const createControlSchema = z.object({
  code: z.string().min(2),
  title: z.string().min(3),
  annexReference: z.string().optional().nullable(),
  requirement: z.string().optional().nullable(),
  category: z.nativeEnum(SecurityControlCategory).default("ORGANIZATIONAL"),
  status: z.nativeEnum(SecurityControlStatus).default("PLANNED"),
  maturity: z.nativeEnum(SecurityControlMaturity).default("INITIAL"),
  ownerId: z.string().cuid().optional().nullable(),
  linkedAssetId: z.string().cuid().optional().nullable(),
  linkedRiskId: z.string().cuid().optional().nullable(),
  implementationNote: z.string().optional().nullable(),
  monitoring: z.string().optional().nullable(),
  nextReviewDate: z.string().optional().nullable(),
  lastTestDate: z.string().optional().nullable(),
  documentId: z.string().cuid().optional().nullable(),
});

export async function createSecurityControl(input: any) {
  try {
    const { tenantId } = await getActionContext();
    const validated = createControlSchema.parse(input);

    const control = await prisma.securityControl.create({
      data: {
        tenantId,
        code: validated.code,
        title: validated.title,
        annexReference: sanitize(validated.annexReference),
        requirement: sanitize(validated.requirement),
        category: validated.category,
        status: validated.status,
        maturity: validated.maturity,
        ownerId: validated.ownerId ?? null,
        linkedAssetId: validated.linkedAssetId ?? null,
        linkedRiskId: validated.linkedRiskId ?? null,
        implementationNote: sanitize(validated.implementationNote),
        monitoring: sanitize(validated.monitoring),
        lastTestDate: parseOptionalDate(validated.lastTestDate) ?? null,
        nextReviewDate: parseOptionalDate(validated.nextReviewDate) ?? null,
      },
    });

    if (validated.documentId) {
      await prisma.securityControlDocument.create({
        data: {
          tenantId,
          controlId: control.id,
          documentId: validated.documentId,
        },
      });
    }

    revalidateSecurity();
    return { success: true, data: control };
  } catch (error: any) {
    console.error("Create control error:", error);
    return { success: false, error: error.message || "Kunne ikke opprette kontroll" };
  }
}

const evidenceSchema = z.object({
  controlId: z.string().cuid(),
  title: z.string().min(3),
  description: z.string().optional().nullable(),
  attachmentKey: z.string().optional().nullable(),
  reviewResult: z.string().optional().nullable(),
});

export async function createSecurityEvidence(input: any) {
  try {
    const { tenantId, user } = await getActionContext();
    const validated = evidenceSchema.parse(input);

    const evidence = await prisma.securityEvidence.create({
      data: {
        tenantId,
        controlId: validated.controlId,
        title: validated.title,
        description: sanitize(validated.description),
        attachmentKey: sanitize(validated.attachmentKey),
        collectedById: user.id,
        reviewResult: sanitize(validated.reviewResult),
      },
    });

    revalidateSecurity();
    return { success: true, data: evidence };
  } catch (error: any) {
    console.error("Create evidence error:", error);
    return { success: false, error: error.message || "Kunne ikke lagre evidens" };
  }
}

const accessReviewSchema = z.object({
  title: z.string().min(3),
  systemName: z.string().optional().nullable(),
  scope: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

export async function createAccessReview(input: any) {
  try {
    const { tenantId, user } = await getActionContext();
    const validated = accessReviewSchema.parse(input);

    const review = await prisma.accessReview.create({
      data: {
        tenantId,
        title: validated.title,
        systemName: sanitize(validated.systemName),
        scope: sanitize(validated.scope),
        dueDate: parseOptionalDate(validated.dueDate) ?? null,
        ownerId: user.id,
      },
    });

    revalidateSecurity();
    return { success: true, data: review };
  } catch (error: any) {
    console.error("Create access review error:", error);
    return { success: false, error: error.message || "Kunne ikke opprette tilgangsgjennomgang" };
  }
}

const accessEntrySchema = z.object({
  reviewId: z.string().cuid(),
  userName: z.string().min(2),
  userEmail: z.string().email(),
  role: z.string().optional().nullable(),
  decision: z.nativeEnum(AccessDecision).default("REVIEW"),
  comment: z.string().optional().nullable(),
});

export async function createAccessReviewEntry(input: any) {
  try {
    const { tenantId, user } = await getActionContext();
    const validated = accessEntrySchema.parse(input);

    const entry = await prisma.accessReviewEntry.create({
      data: {
        tenantId,
        reviewId: validated.reviewId,
        userName: validated.userName,
        userEmail: validated.userEmail,
        role: sanitize(validated.role),
        decision: validated.decision,
        comment: sanitize(validated.comment),
        decidedById: validated.decision === "REVIEW" ? null : user.id,
        decidedAt: validated.decision === "REVIEW" ? null : new Date(),
      },
    });

    revalidateSecurity();
    return { success: true, data: entry };
  } catch (error: any) {
    console.error("Create access entry error:", error);
    return { success: false, error: error.message || "Kunne ikke legge til tilgangsvurdering" };
  }
}

export async function completeAccessReview(reviewId: string) {
  try {
    const { tenantId } = await getActionContext();

    const review = await prisma.accessReview.findFirst({
      where: { id: reviewId, tenantId },
    });

    if (!review) {
      return { success: false, error: "Tilgangsgjennomgang finnes ikke" };
    }

    await prisma.accessReview.update({
      where: { id: review.id },
      data: {
        status: AccessReviewStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    revalidateSecurity();
    return { success: true };
  } catch (error: any) {
    console.error("Complete access review error:", error);
    return { success: false, error: error.message || "Kunne ikke fullføre tilgangsgjennomgang" };
  }
}

