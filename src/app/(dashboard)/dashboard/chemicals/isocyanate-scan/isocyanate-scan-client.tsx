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
  Loader2,
  Info,
  FileWarning,
  ExternalLink,
  Edit
} from "lucide-react";
import Link from "next/link";
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

  // Load stats on mount
  useState(() => {
    loadStats();
  });

  async function loadStats() {
    try {
      const data = await getIsocyanateStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
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
          title: "Scan completed",
          description: `Found and flagged ${result.foundIsocyanates} chemicals containing diisocyanates`,
        });
      } else {
        toast({
          title: "Scan completed",
          description: "No new chemicals containing diisocyanates found",
        });
      }

      // Refresh stats
      await loadStats();
    } catch (error: any) {
      toast({
        title: "Scan failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Isocyanate Scan</h1>
        <p className="text-muted-foreground mt-2">
          Scan the chemical registry to identify chemicals containing diisocyanates
        </p>
      </div>

      {/* Information about isocyanates */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Why is this important?</AlertTitle>
        <AlertDescription>
          <strong>EU Regulation 2020/1149</strong> requires that all workers handling
          products with &gt;0.1% diisocyanates must have completed mandatory training.
          <br />
          Common diisocyanates: MDI, TDI, HDI, IPDI (used in paint, adhesives, foam, insulation).
        </AlertDescription>
      </Alert>

      {/* Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Chemicals in registry</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">With isocyanates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.withIsocyanates}</div>
              <p className="text-xs text-muted-foreground">
                {stats.percentage}% of the chemical registry
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
                  Requires follow-up
                </Badge>
              ) : (
                <Badge variant="outline" className="text-green-600">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  None found
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scan button */}
      <Card>
        <CardHeader>
          <CardTitle>Scan Chemical Registry</CardTitle>
          <CardDescription>
            The system will automatically search through all registered chemicals and
            identify products containing diisocyanates based on product name,
            CAS number, and contents.
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
                Scanning...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Start Scan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {scanResult && (
        <Card>
          <CardHeader>
            <CardTitle>Scan Results</CardTitle>
            <CardDescription>
              {scanResult.success ? "Scan completed" : "Scan failed"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Scanned</p>
                <p className="text-2xl font-bold">{scanResult.totalScanned}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Found</p>
                <p className="text-2xl font-bold text-orange-600">
                  {scanResult.foundIsocyanates}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Updated</p>
                <p className="text-2xl font-bold text-green-600">
                  {scanResult.updated}
                </p>
              </div>
            </div>

            {/* List of found chemicals */}
            {scanResult.chemicals.length > 0 && (
              <div className="space-y-2">
                <div>
                  <h3 className="text-sm font-medium">
                    Chemicals with diisocyanates ({scanResult.chemicals.length})
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click the product name or "Open" to open in a new tab – edit, perform a risk assessment, or add notes for employees.
                  </p>
                </div>
                <div className="border rounded-lg divide-y">
                  {scanResult.chemicals.map((chemical) => (
                    <div 
                      key={chemical.id} 
                      className="p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <FileWarning className="h-4 w-4 text-orange-600 shrink-0" />
                            <Link
                              href={`/dashboard/chemicals/${chemical.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium hover:underline text-primary"
                            >
                              {chemical.productName}
                            </Link>
                            {chemical.wasUpdated && (
                              <Badge variant="outline" className="text-green-600">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Updated
                              </Badge>
                            )}
                          </div>
                          {chemical.supplier && (
                            <p className="text-sm text-muted-foreground">
                              Supplier: {chemical.supplier}
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
                        <div className="flex flex-col gap-1 shrink-0">
                          <Link
                            href={`/dashboard/chemicals/${chemical.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                              Open
                            </Button>
                          </Link>
                          <Link
                            href={`/dashboard/chemicals/${chemical.id}/edit`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                              <Edit className="mr-1.5 h-3.5 w-3.5" />
                              Edit
                            </Button>
                          </Link>
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
                <AlertTitle>No isocyanates found</AlertTitle>
                <AlertDescription>
                  The chemical registry contains no chemicals with diisocyanates.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* List of existing chemicals with isocyanates */}
      {stats?.chemicals && stats.chemicals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Registered chemicals with diisocyanates</CardTitle>
            <CardDescription>
              Chemicals already flagged as containing diisocyanates. Open in a new tab to edit, perform a risk assessment, or add notes for employees.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg divide-y">
              {stats.chemicals.map((chemical: any) => (
                <div 
                  key={chemical.id} 
                  className="p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />
                        <Link
                          href={`/dashboard/chemicals/${chemical.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:underline text-primary"
                        >
                          {chemical.productName}
                        </Link>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
                        {chemical.supplier && <span>Supplier: {chemical.supplier}</span>}
                        {chemical.casNumber && <span>CAS: {chemical.casNumber}</span>}
                        {chemical.quantity && <span>Quantity: {chemical.quantity}</span>}
                        {chemical.location && <span>Location: {chemical.location}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Link
                        href={`/dashboard/chemicals/${chemical.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                          Open
                        </Button>
                      </Link>
                      <Link
                        href={`/dashboard/chemicals/${chemical.id}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <Edit className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </Link>
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
