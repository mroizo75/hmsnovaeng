import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ExcelJS from "exceljs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await prisma.formTemplate.findUnique({
      where: { id, tenantId: session.user.tenantId! },
      include: {
        fields: {
          orderBy: { order: "asc" },
        },
        submissions: {
          include: {
            fieldValues: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Opprett workbook med ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Svar");

    // Header-rad med styling
    const headers = [
      "Dato",
      "Status",
      ...form.fields.map((f) => f.label),
    ];

    worksheet.addRow(headers);
    
    // Style headers
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };
    
    // Auto-fit columns
    worksheet.columns = headers.map((header) => ({
      header,
      key: header,
      width: Math.max(header.length + 2, 15),
    }));

    // Data-rader
    for (const submission of form.submissions) {
      const row: any[] = [
        new Date(submission.createdAt).toLocaleString("nb-NO"),
        getStatusLabel(submission.status),
      ];

      // Legg til feltverdier
      for (const field of form.fields) {
        const fieldValue = submission.fieldValues.find((fv) => fv.fieldId === field.id);
        if (fieldValue) {
          if (fieldValue.fileKey) {
            row.push(`[Fil: ${fieldValue.fileKey}]`);
          } else {
            row.push(fieldValue.value || "");
          }
        } else {
          row.push("");
        }
      }

      worksheet.addRow(row);
    }

    // Generer Excel-fil
    const excelBuffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${form.title.replace(/[^a-z0-9]/gi, "_")}_svar.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error("Export Excel error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: "Kladd",
    SUBMITTED: "Innsendt",
    APPROVED: "Godkjent",
    REJECTED: "Avvist",
  };
  return labels[status] || status;
}

