import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Prisma } from "@prisma/client";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type SubmissionWithValues = Prisma.FormSubmissionGetPayload<{
  include: {
    fieldValues: {
      include: {
        field: true;
      };
    };
  };
}>;

export default async function WellbeingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { tenants: true },
  });

  if (!user || user.tenants.length === 0) {
    redirect("/login");
  }

  const tenantId = user.tenants[0].tenantId;

  const wellbeingTemplate = await prisma.formTemplate.findFirst({
    where: {
      tenantId,
      category: "WELLBEING",
      isActive: true,
    },
    include: {
      fields: {
        orderBy: { order: "asc" },
      },
    },
  });

  const submissions: SubmissionWithValues[] = wellbeingTemplate
    ? await prisma.formSubmission.findMany({
        where: { tenantId, formTemplateId: wellbeingTemplate.id },
        include: {
          fieldValues: {
            include: {
              field: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  const numericAverage = (label: string) => {
    if (!wellbeingTemplate) return null;
    const fieldIds = wellbeingTemplate.fields
      .filter((field) => field.label === label)
      .map((field) => field.id);

    if (fieldIds.length === 0) return null;

    const values: number[] = [];
    submissions.forEach((submission) => {
      submission.fieldValues.forEach((value) => {
        if (fieldIds.includes(value.fieldId) && value.value) {
          const parsed = Number(value.value);
          if (!Number.isNaN(parsed)) {
            values.push(parsed);
          }
        }
      });
    });

    if (values.length === 0) return null;
    return values.reduce((sum, current) => sum + current, 0) / values.length;
  };

  const comments = wellbeingTemplate
    ? submissions.flatMap((submission) =>
        submission.fieldValues
          .filter((value) => value.field.fieldType === "TEXTAREA" && value.value?.trim())
          .map((value) => ({
            text: value.value!,
            date: submission.createdAt,
          })),
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Psykososial puls</h1>
          <p className="text-muted-foreground">
            ISO 45003: Oversikt over trivsel, arbeidsbelastning og støtte i organisasjonen
          </p>
        </div>
        {wellbeingTemplate && (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/forms/${wellbeingTemplate.id}`}>Administrer skjema</Link>
            </Button>
            <Button asChild>
              <Link href={`/dashboard/forms/${wellbeingTemplate.id}/fill`}>Start ny puls</Link>
            </Button>
          </div>
        )}
      </div>

      {!wellbeingTemplate ? (
        <Card>
          <CardHeader>
            <CardTitle>Ingen puls registrert</CardTitle>
            <CardDescription>
              Opprett et skjema i skjema-modulen og velg kategorien <strong>Psykososial puls (WELLBEING)</strong> for å
              starte pulsmåling av arbeidsmiljøet.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Totalt svar</CardTitle>
                <CardDescription>Siste 50 innsendinger</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{submissions.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Trivsel</CardTitle>
                <CardDescription>Snittscore (1-5)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {numericAverage("Hvordan har du det i dag? (1-5)")?.toFixed(1) ?? "—"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Arbeidsbelastning</CardTitle>
                <CardDescription>Snittscore (1-5)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {numericAverage("Hvordan oppleves arbeidsbelastningen? (1-5)")?.toFixed(1) ?? "—"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Støtte</CardTitle>
                <CardDescription>Snittscore (1-5)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {numericAverage("Føler du deg ivaretatt av leder/kollegaer? (1-5)")?.toFixed(1) ?? "—"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Siste innsendelser</CardTitle>
                <CardDescription>Et utdrag av de siste pulsene</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {submissions.slice(0, 6).map((submission) => {
                  const moodValue = submission.fieldValues.find((value) =>
                    value.field.label.startsWith("Hvordan har du det"),
                  );
                  const workloadValue = submission.fieldValues.find((value) =>
                    value.field.label.startsWith("Hvordan oppleves arbeidsbelastningen"),
                  );
                  return (
                    <div key={submission.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-b-0">
                      <div>
                        <p className="font-medium">{formatDate(submission.createdAt)}</p>
                        <p className="text-xs text-muted-foreground">
                          Trivsel {moodValue?.value ?? "-"} · Belastning {workloadValue?.value ?? "-"}
                        </p>
                      </div>
                      {submission.status === "APPROVED" && (
                        <Badge variant="outline" className="text-green-700 border-green-200">
                          Godkjent
                        </Badge>
                      )}
                    </div>
                  );
                })}
                {submissions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">Ingen pulsmålinger ennå</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tilbakemeldinger</CardTitle>
                <CardDescription>Seneste fritekstsvar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {comments.slice(0, 5).map((comment, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <p className="text-sm">{comment.text}</p>
                    {comment.date && (
                      <p className="text-xs text-muted-foreground mt-2">{formatDate(comment.date)}</p>
                    )}
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Ingen kommentarer registrert ennå
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

