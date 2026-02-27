"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, FileText, Calendar, DollarSign } from "lucide-react";
import type { Tenant, Subscription, Invoice } from "@prisma/client";

interface SubscriptionInfoProps {
  tenant: Tenant & {
    subscription: Subscription | null;
    invoices: Invoice[];
  };
}

export function SubscriptionInfo({ tenant }: SubscriptionInfoProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case "TRIAL":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Trial</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      case "SUSPENDED":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case "STARTER":
        return "Small companies (1-20 employees)";
      case "PROFESSIONAL":
        return "Medium companies (21-50 employees)";
      case "ENTERPRISE":
        return "Large companies (51+ employees)";
      // Legacy mappings
      case "BASIC":
        return "Small companies";
      default:
        return plan;
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case "SENT":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Sent</Badge>;
      case "OVERDUE":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Overdue</Badge>;
      case "DRAFT":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>
            Your current subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tenant.subscription ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="text-lg font-semibold">
                    {getPlanLabel(tenant.subscription.plan)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(tenant.subscription.status)}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-lg font-semibold">
                    {tenant.subscription.price} kr/
                    {tenant.subscription.billingInterval === "MONTHLY" ? "mo" : "yr"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Period start
                  </p>
                  <p className="font-medium">
                    {new Date(tenant.subscription.currentPeriodStart).toLocaleDateString("en-US")}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Period end
                  </p>
                  <p className="font-medium">
                    {new Date(tenant.subscription.currentPeriodEnd).toLocaleDateString("en-US")}
                  </p>
                </div>
              </div>

              {tenant.status === "TRIAL" && tenant.trialEndsAt && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <p className="text-sm text-blue-900">
                      ℹ️ Trial expires{" "}
                      {new Date(tenant.trialEndsAt).toLocaleDateString("en-US")}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No subscription found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoices
          </CardTitle>
          <CardDescription>
            Overview of your invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tenant.invoices.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No invoices found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenant.invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.period}</TableCell>
                      <TableCell>{invoice.description || "-"}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {invoice.amount} kr
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.dueDate).toLocaleDateString("en-US")}
                      </TableCell>
                      <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

