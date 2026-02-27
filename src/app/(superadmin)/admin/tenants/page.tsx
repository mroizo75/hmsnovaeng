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
import Link from "next/link";
import { Plus, ExternalLink, CheckCircle2 } from "lucide-react";

export default async function TenantsPage() {
  // Fetch only tenants that have users (active companies)
  const tenants = await prisma.tenant.findMany({
    where: {
      users: {
        some: {}, // Must have at least one user
      },
    },
    include: {
      subscription: true,
      offers: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      invoices: {
        where: {
          status: "OVERDUE",
        },
      },
      _count: {
        select: {
          users: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-muted-foreground">
            Manage all registered companies
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/tenants/new">
            <Plus className="mr-2 h-4 w-4" />
            New company
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All companies ({tenants.length})</CardTitle>
          <CardDescription>
            Overview of companies, status, and subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Reg. No.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Agreement</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {tenant.slug}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{tenant.orgNumber || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tenant.status === "ACTIVE"
                          ? "default"
                          : tenant.status === "TRIAL"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {tenant.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const latestOffer = tenant.offers[0];
                      const isAccepted =
                        latestOffer?.status === "ACCEPTED" ||
                        (tenant.status === "ACTIVE" && !latestOffer);
                      if (isAccepted) {
                        return (
                          <Badge
                            variant="default"
                            className="flex w-fit items-center gap-1 bg-green-600 hover:bg-green-600"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Agreement approved
                          </Badge>
                        );
                      }
                      if (latestOffer?.status === "SENT") {
                        return (
                          <Badge variant="secondary">Offer sent</Badge>
                        );
                      }
                      return (
                        <span className="text-sm text-muted-foreground">-</span>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {tenant.subscription ? (
                      <div>
                        <p className="text-sm font-medium">
                          {tenant.subscription.plan}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${tenant.subscription.price}/{tenant.subscription.billingInterval === "MONTHLY" ? "mo" : "yr"}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{tenant._count.users}</TableCell>
                  <TableCell>
                    {tenant.invoices.length > 0 ? (
                      <Badge variant="destructive">
                        {tenant.invoices.length} overdue
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">OK</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/tenants/${tenant.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
