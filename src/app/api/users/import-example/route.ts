export async function GET() {
  const content = [
    "email,name,role",
    "ola.nordmann@example.com,Ola Nordmann,ANSATT",
    "kari.leder@example.com,Kari Leder,LEDER",
  ].join("\n");

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="bruker-import-eksempel.csv"',
      "Cache-Control": "no-cache",
    },
  });
}

