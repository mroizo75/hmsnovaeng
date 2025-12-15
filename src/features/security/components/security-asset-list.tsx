"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CIAValue, SecurityAssetType } from "@prisma/client";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SecurityAssetListProps {
  assets: Array<{
    id: string;
    name: string;
    description?: string | null;
    type: SecurityAssetType;
    confidentiality: CIAValue;
    integrity: CIAValue;
    availability: CIAValue;
    owner?: { name?: string | null; email?: string | null } | null;
    controls: Array<{ id: string }>;
  }>;
}

const ciaColor: Record<CIAValue, string> = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-900",
  HIGH: "bg-red-100 text-red-800",
};

export function SecurityAssetList({ assets }: SecurityAssetListProps) {
  if (assets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Ingen sikkerhetsobjekter registrert ennå.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Objekt</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>C · I · A</TableHead>
            <TableHead>Ansvarlig</TableHead>
            <TableHead>Kontroller</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">{asset.name}</p>
                  {asset.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{asset.description}</p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm">{asset.type.replaceAll("_", " ")}</TableCell>
              <TableCell className="text-xs space-x-1">
                <span className={cn("rounded px-2 py-0.5", ciaColor[asset.confidentiality])}>C {asset.confidentiality}</span>
                <span className={cn("rounded px-2 py-0.5", ciaColor[asset.integrity])}>I {asset.integrity}</span>
                <span className={cn("rounded px-2 py-0.5", ciaColor[asset.availability])}>A {asset.availability}</span>
              </TableCell>
              <TableCell className="text-sm">
                {asset.owner ? asset.owner.name || asset.owner.email : <span className="text-muted-foreground">Ikke satt</span>}
              </TableCell>
              <TableCell className="text-sm">
                <span className={badgeVariants({ variant: "secondary" })}>{asset.controls.length}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

