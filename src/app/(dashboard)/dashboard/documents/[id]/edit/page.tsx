import { getCurrentUser } from "@/lib/server-action";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DocumentEditForm } from "@/features/documents/components/document-edit-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) {
    redirect("/login");
  }

  const userTenant = user.tenants[0];
  if (!userTenant) {
    return <div>Ingen tilgang til tenant</div>;
  }

  const document = await prisma.document.findFirst({
    where: {
      id,
      tenantId: userTenant.tenantId,
    },
  });

  if (!document) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dokument ikke funnet</h1>
        <p className="text-muted-foreground">
          Dette dokumentet finnes ikke eller du har ikke tilgang til det.
        </p>
        <Button asChild>
          <Link href="/dashboard/documents">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbake til dokumenter
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/documents">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbake til dokumenter
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Rediger dokument</h1>
        <p className="text-muted-foreground">
          Oppdater metadata og tilgangskontroll for "{document.title}"
        </p>
      </div>

      <DocumentEditForm document={document} />
    </div>
  );
}

