import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const matrixDataSchema = z.object({
  matrixData: z.array(
    z.object({
      userName: z.string(),
      courses: z.array(
        z.object({
          courseTitle: z.string(),
          status: z.string(),
          completedAt: z.string().optional(),
          validUntil: z.string().optional(),
          isRequired: z.boolean(),
        })
      ),
    })
  ),
  courseHeaders: z.array(z.string()),
  tenantId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
    }

    const body = await request.json();
    const { matrixData, courseHeaders, tenantId } = matrixDataSchema.parse(body);

    // Verifiser at brukeren har tilgang til denne tenanten
    if (session.user.tenantId !== tenantId) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
    }

    // Generer PDF med jsPDF som fallback (Adobe PDF Services krever templates)
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Tittel
    doc.setFontSize(16);
    doc.text("Kompetansematrise", 148, 12, { align: "center" });

    doc.setFontSize(10);
    doc.text(
      `Generert: ${new Date().toLocaleDateString("nb-NO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`,
      148,
      20,
      { align: "center" }
    );

    // Forkorte lange kursnavn for bedre plass
    const shortCourseHeaders = courseHeaders.map((title) => {
      if (title.length > 20) {
        return title.substring(0, 17) + "...";
      }
      return title;
    });

    const tableHead = [["Ansatt", ...shortCourseHeaders]];
    const tableBody = matrixData.map((row) => {
      return [
        row.userName,
        ...row.courses.map((course) => {
          let statusText = "-";
          
          if (course.status === "MISSING_REQUIRED") {
            statusText = "✗ (Påkrevd)";
          } else if (course.status === "NOT_TAKEN") {
            statusText = "-";
          } else if (course.status === "VALID" || course.status === "COMPLETED") {
            statusText = "✓";
            if (course.validUntil) {
              const date = new Date(course.validUntil).toLocaleDateString("nb-NO", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              });
              statusText += `\n${date}`;
            }
          } else if (course.status === "EXPIRING_SOON") {
            statusText = "⚠";
            if (course.validUntil) {
              const date = new Date(course.validUntil).toLocaleDateString("nb-NO", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              });
              statusText += `\n${date}`;
            }
          } else if (course.status === "EXPIRED") {
            statusText = "✗";
            if (course.validUntil) {
              const date = new Date(course.validUntil).toLocaleDateString("nb-NO", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              });
              statusText += `\n${date}`;
            }
          }

          return statusText;
        }),
      ];
    });

    // Beregn kolonne-bredde dynamisk
    const pageWidth = doc.internal.pageSize.width - 20;
    const nameColWidth = 35;
    const availableWidth = pageWidth - nameColWidth;
    const courseColWidth = Math.max(10, Math.min(20, availableWidth / courseHeaders.length));

    const columnStyles: any = { 0: { cellWidth: nameColWidth, fontStyle: "bold" } };
    for (let i = 1; i <= courseHeaders.length; i++) {
      columnStyles[i] = { cellWidth: courseColWidth, halign: "center" };
    }

    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: 28,
      margin: { left: 10, right: 10 },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: "linebreak",
        halign: "center",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles,
      didParseCell: function (data) {
        // Fargekoding av celler basert på status
        if (data.section === "body" && data.column.index > 0) {
          const cellText = data.cell.text[0];
          if (cellText.includes("✓")) {
            data.cell.styles.fillColor = [212, 237, 218]; // Grønn
            data.cell.styles.textColor = [21, 87, 36];
          } else if (cellText.includes("⚠")) {
            data.cell.styles.fillColor = [255, 243, 205]; // Gul
            data.cell.styles.textColor = [133, 100, 4];
          } else if (cellText.includes("✗")) {
            data.cell.styles.fillColor = [248, 215, 218]; // Rød
            data.cell.styles.textColor = [114, 28, 36];
          }
        }
      },
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Side ${i} av ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    // Generer PDF som buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="kompetansematrise-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ugyldig input", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Kunne ikke generere PDF" },
      { status: 500 }
    );
  }
}
