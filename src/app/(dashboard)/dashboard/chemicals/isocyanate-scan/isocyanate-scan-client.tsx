"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Search, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Info,
  FileWarning
} from "lucide-react";
import { 
  scanStoffkartotekForIsocyanates, 
  getIsocyanateStats,
  type IsocyanateScanResult 
} from "@/server/actions/chemical-isocyanate-scan.actions";
import { useToast } from "@/hooks/use-toast";

export function IsocyanateScanClient() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<IsocyanateScanResult | null>(null);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  // Last statistikk ved innlasting
  useState(() => {
    loadStats();
  });

  async function loadStats() {
    try {
      const data = await getIsocyanateStats();
      setStats(data);
    } catch (error) {
      console.error("Kunne ikke laste statistikk:", error);
    }
  }

  async function handleScan() {
    setIsScanning(true);
    setScanResult(null);

    try {
      const result = await scanStoffkartotekForIsocyanates();
      setScanResult(result);
      
      if (result.updated > 0) {
        toast({
          title: "Skanning fullført",
          description: `Fant og merket ${result.foundIsocyanates} kjemikalier med diisocyanater`,
        });
      } else {
        toast({
          title: "Skanning fullført",
          description: "Ingen nye kjemikalier med diisocyanater funnet",
        });
      }

      // Oppdater statistikk
      await loadStats();
    } catch (error: any) {
      toast({
        title: "Skanning feilet",
        description: error.message || "Noe gikk galt",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Isocyanat-skanning</h1>
        <p className="text-muted-foreground mt-2">
          Skann stoffkartoteket for å identifisere kjemikalier med diisocyanater
        </p>
      </div>

      {/* Informasjon om isocyanater */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Hvorfor er dette viktig?</AlertTitle>
        <AlertDescription>
          <strong>EU-forordning 2020/1149</strong> krever at alle arbeidstakere som håndterer
          produkter med &gt;0.1% diisocyanater må ha gjennomført obligatorisk kurs.
          <br />
          Vanlige diisocyanater: MDI, TDI, HDI, IPDI (brukes i lakk, lim, skum, isolasjon).
        </AlertDescription>
      </Alert>

      {/* Statistikk */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Totalt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Kjemikalier i stoffkartotek</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Med isocyanater</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.withIsocyanates}</div>
              <p className="text-xs text-muted-foreground">
                {stats.percentage}% av stoffkartoteket
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.withIsocyanates > 0 ? (
                <Badge variant="outline" className="text-orange-600">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Krever oppfølging
                </Badge>
              ) : (
                <Badge variant="outline" className="text-green-600">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Ingen funnet
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Skann-knapp */}
      <Card>
        <CardHeader>
          <CardTitle>Skann stoffkartotek</CardTitle>
          <CardDescription>
            Systemet vil automatisk søke gjennom alle registrerte kjemikalier og
            identifisere produkter som inneholder diisocyanater basert på produktnavn,
            CAS-nummer og innhold.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleScan} 
            disabled={isScanning}
            size="lg"
          >
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Skanner...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Start skanning
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultater */}
      {scanResult && (
        <Card>
          <CardHeader>
            <CardTitle>Skanneresultater</CardTitle>
            <CardDescription>
              {scanResult.success ? "Skanning fullført" : "Skanning feilet"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sammendrag */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Skannet</p>
                <p className="text-2xl font-bold">{scanResult.totalScanned}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Funnet</p>
                <p className="text-2xl font-bold text-orange-600">
                  {scanResult.foundIsocyanates}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Oppdatert</p>
                <p className="text-2xl font-bold text-green-600">
                  {scanResult.updated}
                </p>
              </div>
            </div>

            {/* Liste over funnet kjemikalier */}
            {scanResult.chemicals.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">
                  Kjemikalier med diisocyanater ({scanResult.chemicals.length})
                </h3>
                <div className="border rounded-lg divide-y">
                  {scanResult.chemicals.map((chemical) => (
                    <div 
                      key={chemical.id} 
                      className="p-4 hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <FileWarning className="h-4 w-4 text-orange-600" />
                            <span className="font-medium">{chemical.productName}</span>
                            {chemical.wasUpdated && (
                              <Badge variant="outline" className="text-green-600">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Oppdatert
                              </Badge>
                            )}
                          </div>
                          {chemical.supplier && (
                            <p className="text-sm text-muted-foreground">
                              Leverandør: {chemical.supplier}
                            </p>
                          )}
                          {chemical.casNumber && (
                            <p className="text-sm text-muted-foreground">
                              CAS: {chemical.casNumber}
                            </p>
                          )}
                          {chemical.isocyanateDetails && (
                            <Alert className="mt-2">
                              <AlertDescription className="text-sm">
                                {chemical.isocyanateDetails}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {scanResult.foundIsocyanates === 0 && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Ingen isocyanater funnet</AlertTitle>
                <AlertDescription>
                  Stoffkartoteket inneholder ingen kjemikalier med diisocyanater.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Liste over eksisterende kjemikalier med isocyanater */}
      {stats?.chemicals && stats.chemicals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Registrerte kjemikalier med diisocyanater</CardTitle>
            <CardDescription>
              Kjemikalier som allerede er merket som inneholder diisocyanater
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg divide-y">
              {stats.chemicals.map((chemical: any) => (
                <div 
                  key={chemical.id} 
                  className="p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">{chemical.productName}</span>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {chemical.supplier && <span>Leverandør: {chemical.supplier}</span>}
                        {chemical.casNumber && <span>CAS: {chemical.casNumber}</span>}
                        {chemical.quantity && <span>Mengde: {chemical.quantity}</span>}
                        {chemical.location && <span>Lokasjon: {chemical.location}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
