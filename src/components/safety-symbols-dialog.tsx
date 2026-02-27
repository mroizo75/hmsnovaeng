"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, AlertTriangle, Shield } from "lucide-react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Dialog explaining all hazard symbols and PPE icons
 * Used to give employees an overview of symbols
 */
export function SafetySymbolsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          Symbol guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Safety symbols and protective equipment
          </DialogTitle>
          <DialogDescription>
            Guide to GHS hazard symbols and ISO 7010 personal protective equipment
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="hazard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hazard" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Hazard symbols (GHS)
            </TabsTrigger>
            <TabsTrigger value="ppe" className="gap-2">
              <Shield className="h-4 w-4" />
              Protective equipment (PPE)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hazard" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              GHS (Globally Harmonized System) is an international system for classification and labeling of hazardous chemicals.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image src="/faremerker/brannfarlig.webp" alt="Flammable" fill className="object-contain" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Flammable</p>
                  <p className="text-xs text-muted-foreground">Can ignite easily from heat, sparks, or flames</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image src="/faremerker/explosive.webp" alt="Explosive" fill className="object-contain" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Explosive</p>
                  <p className="text-xs text-muted-foreground">Can explode from heat, impact, or friction</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image src="/faremerker/etsende.webp" alt="Corrosive" fill className="object-contain" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Corrosive</p>
                  <p className="text-xs text-muted-foreground">Can cause severe burns to skin and eyes</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image src="/faremerker/gass_under_trykk.webp" alt="Gas under pressure" fill className="object-contain" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Gas under pressure</p>
                  <p className="text-xs text-muted-foreground">Can explode when heated; risk of frostbite</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image src="/faremerker/giftig.webp" alt="Toxic" fill className="object-contain" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Toxic</p>
                  <p className="text-xs text-muted-foreground">Life-threatening if swallowed, inhaled, or on skin contact</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image src="/faremerker/helserisiko.webp" alt="Health hazard" fill className="object-contain" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Health hazard</p>
                  <p className="text-xs text-muted-foreground">Can irritate skin, eyes, or respiratory tract. Allergy possible</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image src="/faremerker/kronisk_helsefarlig.webp" alt="Serious health hazard" fill className="object-contain" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Serious health hazard</p>
                  <p className="text-xs text-muted-foreground">May damage organs, carcinogenic, or harmful to reproduction</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image src="/faremerker/miljofare.webp" alt="Environmental hazard" fill className="object-contain" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Environmental hazard</p>
                  <p className="text-xs text-muted-foreground">Harmful to aquatic organisms and the environment</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image src="/faremerker/oksiderende.webp" alt="Oxidizing" fill className="object-contain" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Oxidizing</p>
                  <p className="text-xs text-muted-foreground">May intensify fire in flammable materials</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ppe" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              ISO 7010 standardized safety signs for personal protective equipment (PPE).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                  <Image src="/ppe/ppe-vernebriller.webp" alt="Safety glasses" width={40} height={40} className="object-contain" unoptimized />
                </div>
                <div>
                  <p className="font-semibold text-sm">Safety glasses</p>
                  <p className="text-xs text-muted-foreground">Eye protection against splashes, dust, and hazardous substances</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                  <Image src="/ppe/ppe-vernehansker.webp" alt="Protective gloves" width={40} height={40} className="object-contain" unoptimized />
                </div>
                <div>
                  <p className="font-semibold text-sm">Protective gloves</p>
                  <p className="text-xs text-muted-foreground">Hand protection against chemicals and injuries</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                  <Image src="/ppe/ppe-aandedrettsvern.webp" alt="Respiratory protection" width={40} height={40} className="object-contain" unoptimized />
                </div>
                <div>
                  <p className="font-semibold text-sm">Respiratory protection</p>
                  <p className="text-xs text-muted-foreground">Protection against inhaling hazardous gases, vapors, or particles</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                  <Image src="/ppe/ppe-vernehjelm.webp" alt="Hard hat" width={40} height={40} className="object-contain" unoptimized />
                </div>
                <div>
                  <p className="font-semibold text-sm">Hard hat</p>
                  <p className="text-xs text-muted-foreground">Head protection against falling objects</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                  <Image src="/ppe/ppe-fotovern.webp" alt="Safety boots" width={40} height={40} className="object-contain" unoptimized />
                </div>
                <div>
                  <p className="font-semibold text-sm">Safety boots</p>
                  <p className="text-xs text-muted-foreground">Foot protection against heavy objects and chemicals</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                  <Image src="/ppe/ppe-hoerselsvern.webp" alt="Hearing protection" width={40} height={40} className="object-contain" unoptimized />
                </div>
                <div>
                  <p className="font-semibold text-sm">Hearing protection</p>
                  <p className="text-xs text-muted-foreground">Protection against harmful noise</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                  <Image src="/ppe/ppe-verneklr.webp" alt="Protective clothing" width={40} height={40} className="object-contain" unoptimized />
                </div>
                <div>
                  <p className="font-semibold text-sm">Protective clothing</p>
                  <p className="text-xs text-muted-foreground">Body protection against chemicals and contamination</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                  <Image src="/ppe/ppe-ansiktsvern.webp" alt="Face shield" width={40} height={40} className="object-contain" unoptimized />
                </div>
                <div>
                  <p className="font-semibold text-sm">Face shield</p>
                  <p className="text-xs text-muted-foreground">Full face protection against splashes and hazardous substances</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>⚠️ Important:</strong> Always read the Safety Data Sheet (SDS) before use! If in doubt, contact the EHS coordinator.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
