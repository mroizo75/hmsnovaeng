"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type {
  SecurityControl,
  SecurityControlStatus,
  SecurityControlMaturity,
} from "@prisma/client";

interface SecurityControlListProps {
  controls: Array<
    SecurityControl & {
      owner?: { name?: string | null; email?: string | null } | null;
      linkedAsset?: { name: string } | null;
      documents: Array<{ document: { title: string } }>;
      evidences: Array<{ id: string }>;
    }
  >;
}

const statusBadge: Record<SecurityControlStatus, string> = {
  PLANNED: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  IMPLEMENTED: "bg-amber-100 text-amber-900",
  LIVE: "bg-green-100 text-green-800",
};

const maturityLabel: Record<SecurityControlMaturity, string> = {
  INITIAL: "Initial",
  MANAGED: "Styrt",
  DEFINED: "Definert",
  OPTIMIZED: "Optimalisert",
};

export function SecurityControlList({ controls }: SecurityControlListProps) {
  if (controls.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Ingen kontroller registrert ennå.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode</TableHead>
            <TableHead>Kontroll</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Modenhet</TableHead>
            <TableHead>Ansvarlig</TableHead>
            <TableHead>Evidens</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {controls.map((control) => (
            <TableRow key={control.id}>
              <TableCell className="font-medium">{control.code}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">{control.title}</p>
                  {control.annexReference && (
                    <p className="text-xs text-muted-foreground">{control.annexReference}</p>
                  )}
                  {control.documents.length > 0 && (
                    <p className="text-xs text-blue-600">
                      Dokument: {control.documents[0].document.title}
                      {control.documents.length > 1 ? ` +${control.documents.length - 1}` : ""}
                    </p>
                  )}
                  {control.linkedAsset && (
                    <p className="text-xs text-muted-foreground">Objekt: {control.linkedAsset.name}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={statusBadge[control.status]}>
                  {control.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">{maturityLabel[control.maturity]}</TableCell>
              <TableCell className="text-sm">
                {control.owner ? control.owner.name || control.owner.email : "Ikke satt"}
              </TableCell>
              <TableCell className="text-sm">{control.evidences.length}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

