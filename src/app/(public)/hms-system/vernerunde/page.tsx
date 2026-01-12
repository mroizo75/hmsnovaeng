import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Smartphone, CheckCircle2, Calendar, ArrowRight, ArrowLeft } from "lucide-react";
import { FAQSection } from "@/components/faq-section";

export const metadata: Metadata = {
  title: "Vernerunde - Digital Vernerunde på Mobil | HMS Nova",
  description: "📱 Digital vernerunde · Fungerer offline · Mobilapp for byggeplasser · Automatisk rapportering · Lovpålagt · Spar timer · Prøv gratis →",
  keywords: "vernerunde, digital vernerunde, vernerunde mal, sikkerhetsinspeksjon, verneombud, hms vernerunde",
};

const faqs = [
  {
    question: "Hva er en vernerunde?",
    answer: `En vernerunde er en systematisk gjennomgang av arbeidsplassen for å identifisere HMS-utfordringer og farer. 
    Verneombudet og arbeidsgiver går sammen rundt på arbeidsplassen og observerer arbeidsmiljøet. 
    Dette er lovpålagt og skal gjennomføres minimum hver 3. måned (4 ganger årlig).`,
  },
  {
    question: "Hvor ofte skal vi gjennomføre vernerunde?",
    answer: `Minimum 4 ganger per år (hver 3. måned) ifølge Arbeidsmiljøloven. 
    På byggeplasser og risikoarbeidsplasser anbefales månedlige vernerunder. 
    HMS Nova sender automatiske påminnelser så dere aldri glemmer det.`,
  },
  {
    question: "Hvem skal delta på vernerunden?",
    answer: `Verneombud og arbeidsgiver (eller leder) skal delta. 
    Ofte er det også lurt å ha med HMS-koordinator og tillitsvalgt. 
    På større arbeidsplasser kan dere dele opp i soner og ha flere vernerunder.`,
  },
  {
    question: "Hvorfor digital vernerunde?",
    answer: `Digital vernerunde er mye mer effektivt enn papir:
    • Registrer observasjoner direkte på mobilen
    • Ta bilder av avvik på stedet
    • Fungerer offline på byggeplasser
    • Automatisk rapport genereres
    • Oppfølging av tiltak med påminnelser
    • Full historikk og dokumentasjon`,
  },
];

export default function VernerundePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Breadcrumb */}
      <section className="container mx-auto px-4 pt-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Hjem</Link>
          <span>/</span>
          <Link href="/hms-system" className="hover:text-foreground">HMS-system</Link>
          <span>/</span>
          <span className="text-foreground">Vernerunde</span>
        </div>
      </section>

      {/* Hero */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-green-700 text-white border-green-800" variant="default">
            Lovpålagt
          </Badge>
          <h1 className="text-5xl font-bold mb-6">
            Vernerunde - Digital på mobil
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Gjennomfør vernerunder digitalt med mobilappen. Fungerer offline på byggeplasser. 
            Automatisk rapportering og oppfølging. Lovpålagt 4 ganger årlig.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <Link href="/registrer-bedrift">
                Prøv gratis i 14 dager
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/hms-system">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Tilbake til HMS-system
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Hva er vernerunde */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold mb-4">Hva er en vernerunde?</h2>
              <p>
                En <strong>vernerunde</strong> (også kalt sikkerhetsinspeksjon) er en systematisk 
                gjennomgang av arbeidsplassen der verneombud og arbeidsgiver sammen identifiserer 
                HMS-utfordringer, farer og forbedringsmuligheter.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Hvorfor er vernerunde viktig?</h3>
              <ul>
                <li><strong>Lovpålagt</strong> - Minimum 4 ganger årlig (Arbeidsmiljøloven §6-5)</li>
                <li><strong>Forebygg ulykker</strong> - Oppdage farer før noe skjer</li>
                <li><strong>Involver ansatte</strong> - Verneombudet representerer de ansatte</li>
                <li><strong>Kontinuerlig forbedring</strong> - Systematisk oppfølging av tiltak</li>
                <li><strong>Dokumentasjon</strong> - Vis Arbeidstilsynet at dere tar HMS på alvor</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Hva skal sjekkes på vernerunden?</h3>
              <div className="bg-muted p-6 rounded-lg">
                <ul className="space-y-2 mb-0">
                  <li>✓ Arbeidsmiljø og orden/rydding</li>
                  <li>✓ Maskiner og utstyr (fungerer det? er det vedlikeholdt?)</li>
                  <li>✓ Personlig verneutstyr (finnes det? brukes det?)</li>
                  <li>✓ Kjemikalier og farlige stoffer</li>
                  <li>✓ Ergonomi og arbeidsstillinger</li>
                  <li>✓ Psykososialt arbeidsmiljø</li>
                  <li>✓ Belysning, temperatur, støy</li>
                  <li>✓ Oppfølging av tidligere avvik</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Digital vernerunde */}
      <section className="container mx-auto px-4 py-12 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Slik gjør du vernerunde med HMS Nova
          </h2>

          <div className="space-y-6">
            {[
              {
                step: 1,
                title: "Åpne mobilappen",
                desc: "Start vernerunde direkte fra HMS Nova-appen. Fungerer offline hvis dere ikke har nett på byggeplassen.",
              },
              {
                step: 2,
                title: "Gå gjennom arbeidsplassen",
                desc: "Følg sjekklisten og registrer observasjoner underveis. Ta bilder av avvik direkte i appen.",
              },
              {
                step: 3,
                title: "Registrer avvik og tiltak",
                desc: "Fant dere noe som må utbedres? Registrer avvik, tildel ansvarlig og sett frist - alt på stedet.",
              },
              {
                step: 4,
                title: "Automatisk rapport",
                desc: "Når vernerunden er ferdig, generer HMS Nova automatisk rapport med bilder. Send til ledelsen med ett klikk.",
              },
            ].map((item) => (
              <Card key={item.step}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                      {item.step}
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fordeler */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Hvorfor velge digital vernerunde?
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Smartphone className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Mobil og offline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Perfekt for byggeplasser uten internett. 
                  Registrer alt på mobil, synkroniseres automatisk når du får nett.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle2 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Automatisk oppfølging</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Avvik fra vernerunden følges opp automatisk. 
                  Ansvarlig får påminnelser. Du får oversikt over hva som er gjort.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Calendar className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Påminnelser</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Glem aldri vernerunden. HMS Nova sender varsel når det er tid 
                  (hver 3. måned eller oftere hvis dere ønsker).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Full dokumentasjon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Historikk på alle vernerunder. Vis Arbeidstilsynet at dere 
                  gjennomfører vernerunder systematisk og lovlig.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Relaterte emner */}
      <section className="container mx-auto px-4 py-12 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-6">Del av HMS Nova HMS-system</h3>
          <p className="text-muted-foreground mb-6">
            Vernerunde er en sentral del av vårt <Link href="/hms-system" className="text-primary hover:underline">komplette HMS-system</Link>. 
            Se også:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/hms-system/avvikshandtering">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-base">Avvikshåndtering</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Følg opp avvik →</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/hms-system/risikovurdering">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-base">Risikovurdering</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">5x5 matrise →</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/hms-system/digital-signatur">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-base">Digital signatur</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Godkjenning →</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection 
        faqs={faqs}
        title="Ofte stilte spørsmål om vernerunde"
      />

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-3xl mx-auto bg-primary text-primary-foreground border-0">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Digitalisér vernerundene i dag
            </h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Test HMS Nova gratis i 14 dager. Mobilapp inkludert.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
                <Link href="/registrer-bedrift">
                  Kom i gang gratis
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                className="border-2 border-white text-white hover:bg-white/10"
              >
                <Link href="/priser">
                  Se priser
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
