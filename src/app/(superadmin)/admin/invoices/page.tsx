import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SyncInvoicesButton } from "@/components/sync-invoices-button";

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: {
      tenant: true,
    },
    orderBy: {
      dueDate: "desc",
    },
    take: 100,
  });

  const stats = {
    total: invoices.length,
    pending: invoices.filter(inv => inv.status === "PENDING").length,
    sent: invoices.filter(inv => inv.status === "SENT").length,
    paid: invoices.filter(inv => inv.status === "PAID").length,
    overdue: invoices.filter(inv => inv.status === "OVERDUE").length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    overdueAmount: invoices
      .filter(inv => inv.status === "OVERDUE")
      .reduce((sum, inv) => sum + inv.amount, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            Overview of all invoices and payment status
          </p>
        </div>
        <SyncInvoicesButton />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.overdueAmount.toLocaleString("en-US")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalAmount.toLocaleString("en-US")}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All invoices ({invoices.length})</CardTitle>
          <CardDescription>
            Last 100 invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice no.</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead>Paid date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Period</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.invoiceNumber || "-"}
                  </TableCell>
                  <TableCell>{invoice.tenant.name}</TableCell>
                  <TableCell>
                    ${invoice.amount.toLocaleString("en-US")}
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.dueDate).toLocaleDateString("en-US")}
                  </TableCell>
                  <TableCell>
                    {invoice.paidDate
                      ? new Date(invoice.paidDate).toLocaleDateString("en-US")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.status === "PAID"
                          ? "default"
                          : invoice.status === "OVERDUE"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{invoice.period || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
