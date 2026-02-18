import ExcelJS from "exceljs";

export async function GET() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "HMS Nova";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Brukere", {
    headerFooter: {
      firstHeader: "Brukerimport – Last ned, fyll ut og importer",
    },
  });

  sheet.columns = [
    { header: "email", key: "email", width: 30 },
    { header: "navn", key: "navn", width: 25 },
    { header: "rolle", key: "rolle", width: 18 },
  ];

  sheet.addRow({
    email: "ola.nordmann@example.com",
    navn: "Ola Nordmann",
    rolle: "ANSATT",
  });
  sheet.addRow({
    email: "kari.leder@example.com",
    navn: "Kari Leder",
    rolle: "LEDER",
  });

  sheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="bruker-import-eksempel.xlsx"',
      "Cache-Control": "no-cache",
    },
  });
}
