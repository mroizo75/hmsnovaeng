"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GraduationCap, Upload, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NyKompetansePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    provider: "",
    completedAt: "",
    certificateFile: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Sjekk filstørrelse (maks 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Filen er for stor. Maks 10MB.");
        return;
      }
      setFormData({ ...formData, certificateFile: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Valider
      if (!formData.title || !formData.completedAt) {
        toast.error("Fyll ut alle obligatoriske felt");
        setIsLoading(false);
        return;
      }

      // Hvis det er en fil, last den opp først
      let proofDocKey = null;
      if (formData.certificateFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", formData.certificateFile);
        uploadFormData.append("folder", "training");

        const uploadRes = await fetch("/api/training/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          throw new Error("Feil ved opplasting av fil");
        }

        const uploadData = await uploadRes.json();
        proofDocKey = uploadData.fileKey;
      }

      // Opprett opplæring
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        provider: formData.provider || undefined,
        completedAt: new Date(formData.completedAt).toISOString(),
        proofDocKey: proofDocKey || undefined,
        isRequired: false,
        effectiveness: null, // Venter på godkjenning
      };

      const res = await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Feil ved registrering");
      }

      toast.success("Kompetansen er registrert! Venter på godkjenning fra leder.");
      router.push("/ansatt/opplaering");
      router.refresh();
    } catch (error: any) {
      console.error("Feil:", error);
      toast.error(error.message || "Noe gikk galt. Prøv igjen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <Link href="/ansatt/opplaering">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbake til min opplæring
          </Button>
        </Link>
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-blue-600" />
          Legg til egen kompetanse
        </h1>
        <p className="text-muted-foreground">
          Registrer kurs, sertifikater eller annen kompetanse du har oppnådd
        </p>
      </div>

      {/* Info */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
        <CardContent className="p-4">
          <p className="text-sm text-blue-900">
            <strong>💡 Viktig:</strong> Kompetansen må godkjennes av din leder før den 
            blir aktiv i HMS-systemet. Du vil få en bekreftelse når den er godkjent.
          </p>
        </CardContent>
      </Card>

      {/* Skjema */}
      <Card>
        <CardHeader>
          <CardTitle>Registrer kompetanse</CardTitle>
          <CardDescription>
            Fyll ut informasjon om kurset eller sertifikatet du har gjennomført
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kurstittel */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Kurstittel / Sertifikat <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                required
                placeholder="F.eks. Førstehjelp, HMS-kurs, Verneombud, etc."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Beskrivelse */}
            <div className="space-y-2">
              <Label htmlFor="description">Beskrivelse</Label>
              <Textarea
                id="description"
                placeholder="Kort beskrivelse av hva kurset omfattet..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Kursholder/Leverandør */}
            <div className="space-y-2">
              <Label htmlFor="provider">Kursholder / Leverandør</Label>
              <Input
                id="provider"
                placeholder="F.eks. Norsk Førstehjelpsråd, Arbeidstilsynet, etc."
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              />
            </div>

            {/* Gjennomført dato */}
            <div className="space-y-2">
              <Label htmlFor="completedAt">
                Gjennomført dato <span className="text-red-500">*</span>
              </Label>
              <Input
                id="completedAt"
                type="date"
                required
                value={formData.completedAt}
                onChange={(e) => setFormData({ ...formData, completedAt: e.target.value })}
              />
            </div>

            {/* Last opp sertifikat */}
            <div className="space-y-2">
              <Label htmlFor="certificate">Last opp bevis (sertifikat, diplom, etc.)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <Input
                  id="certificate"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Label htmlFor="certificate" className="cursor-pointer">
                  <span className="text-sm text-blue-600 hover:underline">
                    {formData.certificateFile
                      ? formData.certificateFile.name
                      : "Klikk for å laste opp fil"}
                  </span>
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG eller PNG (maks 10MB)
                </p>
              </div>
            </div>

            {/* Knapper */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registrerer...
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Registrer kompetanse
                  </>
                )}
              </Button>
              <Link href="/ansatt/opplaering" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Avbryt
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Hjelp */}
      <Card className="border-l-4 border-l-green-500 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">📚 Hva kan registreres?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-green-900">
          <p>✅ HMS-relaterte kurs (førstehjelp, brannvern, etc.)</p>
          <p>✅ Faglige sertifiseringer og kompetansebevis</p>
          <p>✅ Sikkerhetskurs og opplæring</p>
          <p>✅ Verneombudopplæring</p>
          <p>✅ Annen relevant kompetanse for din stilling</p>
        </CardContent>
      </Card>
    </div>
  );
}
