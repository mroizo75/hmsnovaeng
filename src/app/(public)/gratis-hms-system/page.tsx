import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  Clock,
  FileText,
  Shield,
  TrendingUp,
  Users,
  Sparkles,
  ArrowRight,
  Gift,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Få ferdig HMS-startpakke GRATIS | HMS Nova Document Generator",
  description: "Svar på 10 spørsmål → Vi genererer HMS-håndbok, risikovurdering, opplæringsplan og prosedyrer. ISO 9001-struktur på 20 minutter. Helt gratis!",
  keywords: [
    "HMS system gratis",
    "HMS håndbok generator",
    "Risikovurdering gratis",
    "HMS dokumenter gratis",
    "ISO 9001 pakke gratis",
    "HMS mal",
  ],
  openGraph: {
    title: "Få ferdig HMS-startpakke GRATIS på 20 minutter",
    description: "Svar på 10 spørsmål → Vi genererer HMS-håndbok og prosedyrer. ISO 9001-struktur bransjespesifikt.",
    url: "https://hmsnova.no/gratis-hms-system",
    type: "website",
  },
};

export default function GratisHMSSystemPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 text-base px-4 py-2" variant="secondary">
            <Gift className="mr-2 h-5 w-5" />
            Verdi: 15.000 kr → Din pris: GRATIS
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Få ferdig HMS-startpakke på{" "}
            <span className="text-primary">20 minutter</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            Svar på 10 spørsmål → Vi genererer startpakken din
          </p>
          
          <p className="text-lg text-muted-foreground mb-8">
            HMS-håndbok, risikovurdering, opplæringsplan og prosedyrer (ISO 9001)<br />
            <strong>Bransjespesifikt for DIN bedrift</strong>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="text-lg" asChild>
              <Link href="/gratis-hms-system/start">
                <Zap className="mr-2 h-5 w-5" />
                Start nå - Helt gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg" asChild>
              <Link href="#hva-faar-du">Se hva du får</Link>
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>Ingen kredittkort</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>20 minutter</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>5000+ bedrifter</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-yellow-500 text-xl">★</span>
                      ))}
                    </div>
                    <span className="font-semibold">4.9/5 stjerner</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Basert på 1,247 bedrifter som har brukt HMS Document Generator
                  </p>
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background"
                    />
                  ))}
                  <div className="h-10 w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-semibold">
                    +1K
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Hva du får */}
      <section id="hva-faar-du" className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4">🎁 Komplett HMS-pakke</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Dette får du GRATIS
            </h2>
            <p className="text-xl text-muted-foreground">
              Verdi: 15.000 kr (konsulentpris for startdokumenter) → Din pris: <span className="text-primary font-bold">0 kr</span>
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FileText className="h-8 w-8 text-primary" />
                  <Badge variant="secondary">HMS-01</Badge>
                </div>
                <CardTitle>HMS-håndbok (Styrende dokument)</CardTitle>
                <CardDescription>
                  Hoveddokument med 11 punkter (ISO 9001-struktur)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Auto-utfylt med bedriftsnavn, roller, org.nr</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Definerer ansvar, roller og HMS-organisering</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>HMS-policy og målsettinger ferdig skrevet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Referanser til lover og standarder</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Shield className="h-8 w-8 text-primary" />
                  <Badge variant="secondary">HMS-02</Badge>
                </div>
                <CardTitle>Risikovurdering (Prosedyre)</CardTitle>
                <CardDescription>
                  Mal for 5x5-matrise med bransjespesifikke eksempler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Beskriver fremgangsmåte for risikovurdering</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Bransjespesifikke eksempler på risikoer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>5x5-matrise for sannsynlighet × konsekvens</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Fylles ut i HMS Nova systemet</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <Badge variant="secondary">HMS-03</Badge>
                </div>
                <CardTitle>Opplæringsplan (Prosedyre)</CardTitle>
                <CardDescription>
                  Mal for kompetansestyring og opplæringsbehov
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Beskriver fremgangsmåte for opplæring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Bransjespesifikke eksempler på kurs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Krav til dokumentasjon</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Administreres i HMS Nova systemet</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Sparkles className="h-8 w-8 text-primary" />
                  <Badge variant="secondary">HMS-00, 04, 05</Badge>
                </div>
                <CardTitle>+ 3 ekstra dokumenter</CardTitle>
                <CardDescription>
                  Støttedokumenter og maler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>HMS-00:</strong> Register over HMS-dokumenter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>HMS-04:</strong> Vernerunde sjekkliste og prosedyre</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>HMS-05:</strong> AMU møteprotokoll mal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Alle i Word-format (redigerbare)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Button size="lg" asChild>
              <Link href="/gratis-hms-system/start">
                <Gift className="mr-2 h-5 w-5" />
                Generer mitt HMS-system nå
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Slik fungerer det */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Slik fungerer det
            </h2>
            <p className="text-xl text-muted-foreground">
              3 enkle steg til ferdig HMS-system
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  1
                </div>
                <CardTitle>Fyll ut 5 skjemaer</CardTitle>
                <CardDescription>20 minutter</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Bedriftsinfo, bransje, HMS-roller, opplæring og bekreftelse.
                  Enkle spørsmål med forslag underveis.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  2
                </div>
                <CardTitle>Vi genererer dokumentene</CardTitle>
                <CardDescription>2 minutter</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Våre bransjemaler + dine svar = ferdig HMS-system.
                  AI fyller ut alt basert på din bransje.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  3
                </div>
                <CardTitle>Last ned og bruk</CardTitle>
                <CardDescription>Umiddelbart</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  PDF, Word, Excel – alt sendes til din e-post.
                  Klar til bruk med en gang!
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link href="/gratis-hms-system/start">
                Start nå - Kun 20 minutter
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-primary text-primary-foreground border-0">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl md:text-4xl">
                Klar til å få ditt HMS-system?
              </CardTitle>
              <CardDescription className="text-primary-foreground/80 text-lg">
                Over 5000 bedrifter har allerede generert sitt HMS-system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3 text-center">
                <div>
                  <div className="text-4xl font-bold">20</div>
                  <div className="text-sm text-primary-foreground/80">minutter</div>
                </div>
                <div>
                  <div className="text-4xl font-bold">6</div>
                  <div className="text-sm text-primary-foreground/80">startdokumenter</div>
                </div>
                <div>
                  <div className="text-4xl font-bold">0</div>
                  <div className="text-sm text-primary-foreground/80">kr</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/gratis-hms-system/start">
                    <Zap className="mr-2 h-5 w-5" />
                    Start gratis nå
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <p className="text-center text-sm text-primary-foreground/70">
                Ingen kredittkort påkrevd • Ingen skjulte kostnader • 100% gratis
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

