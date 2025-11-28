import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, ArrowRight, Trophy, Medal, Award, FileCheck, Shield } from 'lucide-react';
import { FAQSection } from '@/components/faq-section';

export const metadata: Metadata = {
  title: 'Beste HMS-system for ISO 9001 sertifisering 2025',
  description:
    'HMS Nova er det beste HMS-systemet for ISO 9001 sertifisering. 100% compliant, alle påkrevde dokumenter inkludert, og gjennomsnittlig 3-6 måneder til sertifisering.',
  keywords:
    'iso 9001 hms system, iso 9001 sertifisering, kvalitetsledelse, iso 9001 compliant, hms nova iso 9001',
  openGraph: {
    title: 'Beste HMS-system for ISO 9001 sertifisering',
    description: 'HMS Nova - 100% ISO 9001 compliant fra dag 1',
    type: 'article',
  },
};

export default function BesteHMSSystemISO9001Page() {
  const faqs = [
    {
      question: 'Er HMS Nova ISO 9001 compliant?',
      answer:
        'Ja, HMS Nova er <strong>100% ISO 9001:2015 compliant</strong>. Systemet dekker alle krav inkludert dokumenthåndtering, risikovurderinger, korrigerende tiltak, internrevisjoner, ledelsens gjennomgang, og kontinuerlig forbedring.',
    },
    {
      question: 'Hvor lang tid tar det å få ISO 9001 med HMS Nova?',
      answer:
        'Gjennomsnittlig <strong>3-6 måneder</strong> med HMS Nova, sammenlignet med 12-18 måneder tradisjonelt. Over 150 av våre kunder har fått ISO 9001 sertifisering, med 95% suksessrate på første revisjon.',
    },
    {
      question: 'Hva inkluderer HMS Nova for ISO 9001?',
      answer:
        'HMS Nova inkluderer: Dokumenthåndtering med versjonskontroll, digital godkjenning, risikovurderinger, avvikshåndtering, korrigerende tiltak, internrevisjon-modul, ledelsens gjennomgang, mål og KPI-sporing, og alle påkrevde prosedyrer.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            <Shield className="h-4 w-4 mr-2" />
            ISO 9001:2015
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Beste HMS-system for ISO 9001 sertifisering
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            HMS Nova er 100% ISO 9001 compliant fra dag 1. Alle påkrevde dokumenter inkludert, og
            gjennomsnittlig 3-6 måneder til sertifisering.
          </p>
        </div>
      </section>

      {/* Winner */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <Card className="border-primary border-2 shadow-xl">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="h-8 w-8 text-primary" />
                <Badge variant="default" className="text-lg px-4 py-1">
                  🏆 Beste valg for ISO 9001
                </Badge>
              </div>
              <CardTitle className="text-3xl">HMS Nova</CardTitle>
              <CardDescription className="text-lg">
                100% ISO 9001:2015 compliant • 3-6 måneder til sertifisering
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    Hvorfor HMS Nova er best for ISO 9001:
                  </h3>
                  <ul className="space-y-3">
                    {[
                      '100% ISO 9001:2015 compliant ut av boksen',
                      'Alle påkrevde dokumenter inkludert',
                      'Automatisk versjonskontroll (krav 7.5)',
                      'Digital godkjenning og signatur',
                      'Ledelsens gjennomgang-modul (krav 9.3)',
                      'Internrevisjon-modul (krav 9.2)',
                      'Korrigerende tiltak-sporing (krav 10.2)',
                      'Risikobasert tilnærming (krav 6.1)',
                      'Mål og KPI-sporing (krav 6.2)',
                      'Kompetansestyring (krav 7.2)',
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="p-6 bg-primary/10 rounded-lg mb-6">
                    <h3 className="font-semibold text-lg mb-4">Statistikk fra våre kunder:</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Gjennomsnittlig tid til ISO 9001:</span>
                        <span className="font-bold text-2xl">3-6 mnd</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Suksessrate første revisjon:</span>
                        <span className="font-bold text-2xl text-green-600">95%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Totalt ISO 9001 sertifiseringer:</span>
                        <span className="font-bold text-2xl">150+</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      Kilde: HMS Nova kundedata, januar 2025
                    </p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg mb-4">
                    <div className="text-2xl font-bold mb-1">8.000 - 18.000 kr/år</div>
                    <div className="text-sm text-muted-foreground">
                      Avhengig av bedriftsstørrelse • Alt inkludert
                    </div>
                  </div>

                  <Link href="/registrer-bedrift" className="block">
                    <Button size="lg" className="w-full">
                      Start ISO 9001-reisen
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ISO 9001 Requirements Coverage */}
      <section className="container mx-auto px-4 py-12 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            ISO 9001:2015 krav dekket av HMS Nova
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                clause: '4. Organisasjonens kontekst',
                requirements: [
                  'Interessentanalyse',
                  'Kvalitetsstyringssystem omfang',
                  'Prosesser og interaksjoner',
                ],
              },
              {
                clause: '5. Ledelse',
                requirements: [
                  'Ledelses forpliktelse',
                  'Kvalitetspolitikk',
                  'Roller og ansvar',
                ],
              },
              {
                clause: '6. Planlegging',
                requirements: [
                  'Risikovurdering og muligheter',
                  'Kvalitetsmål',
                  'Planlegging av endringer',
                ],
              },
              {
                clause: '7. Støtte',
                requirements: [
                  'Ressurser og kompetanse',
                  'Dokumentert informasjon',
                  'Kommunikasjon',
                ],
              },
              {
                clause: '8. Drift',
                requirements: [
                  'Driftsplanlegging',
                  'Produkt/tjeneste krav',
                  'Endringsstyring',
                ],
              },
              {
                clause: '9. Evaluering',
                requirements: [
                  'Overvåking og måling',
                  'Internrevisjon',
                  'Ledelsens gjennomgang',
                ],
              },
              {
                clause: '10. Forbedring',
                requirements: [
                  'Avvik og korrigerende tiltak',
                  'Kontinuerlig forbedring',
                  'Forebyggende tiltak',
                ],
              },
            ].map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    {section.clause}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Sammenligning for ISO 9001</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* HMS Nova */}
            <Card className="border-primary border-2">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  <Badge variant="default">Beste valg</Badge>
                </div>
                <CardTitle>HMS Nova</CardTitle>
                <CardDescription>100% compliant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">100% ISO 9001 compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">3-6 måneder til sertifisering</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Digital godkjenning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Automatisk versjonskontroll</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Ledelsens gjennomgang</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-primary/10 rounded">
                  <div className="font-bold">8.000 kr/år</div>
                  <div className="text-xs text-muted-foreground">0-20 ansatte</div>
                </div>
              </CardContent>
            </Card>

            {/* Avonova */}
            <Card className="border-orange-500/50">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Medal className="h-6 w-6 text-orange-500" />
                  <Badge variant="outline" className="border-orange-500 text-orange-500">
                    Andreplassen
                  </Badge>
                </div>
                <CardTitle>Avonova</CardTitle>
                <CardDescription>Også 100% compliant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">100% ISO 9001 compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Omfattende konsulent-støtte</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Mye dyrere (15.000+ kr/år)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Lengre implementeringstid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Mer komplekst</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-muted rounded">
                  <div className="font-bold">15.000+ kr/år</div>
                  <div className="text-xs text-muted-foreground">Små bedrifter</div>
                </div>
              </CardContent>
            </Card>

            {/* Grønn Jobb */}
            <Card className="border-amber-600/50">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-6 w-6 text-amber-600" />
                  <Badge variant="outline" className="border-amber-600 text-amber-600">
                    Tredjeplassen
                  </Badge>
                </div>
                <CardTitle>Grønn Jobb</CardTitle>
                <CardDescription>Delvis compliant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm">Kun delvis ISO 9001 compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm">Mangler digital signatur</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm">Begrenset versjonskontroll</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Rimelig pris</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">BHT tilgjengelig</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-muted rounded">
                  <div className="font-bold">7.890 kr/år</div>
                  <div className="text-xs text-muted-foreground">0-20 ansatte</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection
        faqs={faqs}
        title="Ofte stilte spørsmål om ISO 9001"
        description="Svar på vanlige spørsmål om ISO 9001 sertifisering med HMS Nova"
      />

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-3xl mx-auto bg-primary text-primary-foreground border-0">
          <CardContent className="p-12 text-center">
            <Shield className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Klar for ISO 9001 sertifisering?</h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Start med HMS Nova i dag og få ISO 9001 på 3-6 måneder. 95% suksessrate på første
              revisjon.
            </p>
            <Link href="/registrer-bedrift">
              <Button size="lg" variant="secondary">
                Start gratis prøveperiode
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm mt-6 text-primary-foreground/70">
              14 dagers gratis test • Ingen binding • Norsk support
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

