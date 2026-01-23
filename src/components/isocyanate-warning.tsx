"use client";

import { AlertTriangle, GraduationCap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface IsocyanateWarningProps {
  details?: string;
}

/**
 * Varsling om at produktet inneholder isocyanater
 * Viser kursanbefaling og viktig informasjon
 */
export function IsocyanateWarning({ details }: IsocyanateWarningProps) {
  return (
    <Alert variant="destructive" className="border-orange-500 bg-orange-50">
      <AlertTriangle className="h-5 w-5 text-orange-600" />
      <AlertTitle className="text-orange-900 font-semibold">
        ⚠️ Inneholder diisocyanater - Spesialkurs påkrevd
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="text-orange-800">
          {details || 
            "Dette produktet inneholder diisocyanater. I henhold til EU-forordning 2020/1149 krever arbeid med slike stoffer obligatorisk opplæring."}
        </p>
        
        <div className="bg-white p-4 rounded-md border border-orange-200">
          <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Påkrevd opplæring
          </h4>
          <ul className="text-sm text-orange-800 space-y-1 mb-3">
            <li>✅ Grunnleggende kurs i kjemikaliehåndtering</li>
            <li>✅ Spesialkurs i sikker bruk av diisocyanater</li>
            <li>✅ Oppfriskning hvert 5. år</li>
          </ul>
          
          <div className="flex gap-2 flex-wrap">
            <Link href="/dashboard/hms-kurs?filter=diisocyanater" target="_blank">
              <Button size="sm" variant="default" className="bg-orange-600 hover:bg-orange-700">
                <GraduationCap className="mr-2 h-4 w-4" />
                Se tilgjengelige kurs
              </Button>
            </Link>
            <Link href="/dashboard/training" target="_blank">
              <Button size="sm" variant="outline">
                Sjekk ansattes kurs
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-xs text-orange-700">
          <strong>Viktig:</strong> Alle ansatte som håndterer dette produktet må ha gjennomført 
          påkrevd opplæring før bruk. Dokumenter kursdeltakelse i opplæringsmodulen.
        </p>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Kompakt badge for kjemikalie-lister
 */
export function IsocyanateBadge() {
  return (
    <span 
      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 border border-orange-300"
      title="Inneholder diisocyanater - Krever spesialkurs"
    >
      <AlertTriangle className="h-3 w-3" />
      Diisocyanater
    </span>
  );
}
