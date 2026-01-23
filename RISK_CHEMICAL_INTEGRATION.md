# Risk → Chemical & Training Integration

## 📋 Oversikt

Dette systemet integrerer risikovurderinger med kjemikalier og opplæringskrav i henhold til ISO 45001 og ISO 14001.

### Hovedfunksjoner

1. **Kjemikalie → Risiko Kobling**
   - Koble farlige stoffer til risikovurderinger
   - Definere eksponeringsnivå (LOW, MEDIUM, HIGH, CRITICAL)
   - Dokumentere påkrevd verneutstyr
   
2. **Automatiske Risikoforslag**
   - AI analyserer kjemikaliedata
   - Genererer ISO-kompliant risikovurderinger
   - Foreslår sikkerhetstiltak og opplæringskrav

3. **Opplæringskrav per Risiko**
   - Koble påkrevde kurs til risikoer
   - Spore compliance
   - Automatisk varsling

---

## 🗄️ Database Schema

### RiskChemicalLink

Kobler kjemikalier til risikovurderinger med eksponeringsnivå.

```prisma
model RiskChemicalLink {
  id          String        @id @default(cuid())
  tenantId    String
  riskId      String
  chemicalId  String
  exposure    ExposureLevel @default(MEDIUM)
  ppRequired  Boolean       @default(false)
  note        String?       @db.Text
  
  @@unique([riskId, chemicalId])
}
```

**Eksponeringsnivåer:**
- `LOW` - Minimal eksponering, lav risiko
- `MEDIUM` - Moderat eksponering, standard tiltak
- `HIGH` - Høy eksponering, ekstra tiltak nødvendig
- `CRITICAL` - Kritisk eksponering (CMR, diisocyanater, SVHC)

### RiskTrainingRequirement

Definerer påkrevd opplæring for å håndtere en risiko.

```prisma
model RiskTrainingRequirement {
  id          String   @id @default(cuid())
  tenantId    String
  riskId      String
  courseKey   String
  isMandatory Boolean  @default(true)
  reason      String?  @db.Text
  
  @@unique([riskId, courseKey])
}
```

---

## 🚀 Bruk i Applikasjonen

### 1. Registrere Kjemikalie med Auto-Risikoforslag

Når et farlig kjemikalie registreres:

```typescript
// På chemical detail page
<ChemicalRiskSuggestions
  chemicalId={chemical.id}
  chemicalName={chemical.productName}
  isCMR={chemical.isCMR}
  isSVHC={chemical.isSVHC}
  containsIsocyanates={chemical.containsIsocyanates}
  hazardLevel={chemical.hazardLevel}
/>
```

**Automatiske forslag genereres for:**
- CMR-stoffer (Carcinogenic, Mutagenic, Reprotoxic)
- Diisocyanater (EU REACH Annex XVII krav)
- SVHC (Substance of Very High Concern)
- Høyrisiko kjemikalier (hazardLevel 4-5)

### 2. Vise Kjemikalier på Risiko-side

```typescript
// På risk detail page
<RiskChemicalLinks
  riskId={risk.id}
  links={risk.chemicalLinks}
  canEdit={userCanEdit}
/>
```

### 3. Vise Opplæringskrav på Risiko-side

```typescript
// På risk detail page
<RiskTrainingRequirements
  riskId={risk.id}
  requirements={risk.trainingRequirements}
  canEdit={userCanEdit}
/>
```

---

## 🔧 Server Actions

### Kjemikalie-Risiko Kobling

```typescript
// Koble kjemikalie til risiko
import { linkChemicalToRisk } from "@/server/actions/risk-chemical.actions";

const result = await linkChemicalToRisk({
  riskId: "risk_abc123",
  chemicalId: "chem_xyz789",
  exposure: "HIGH",
  ppRequired: true,
  note: "Bruk ved sprøyting av maling"
});

// Fjern kobling
import { unlinkChemicalFromRisk } from "@/server/actions/risk-chemical.actions";

await unlinkChemicalFromRisk(linkId);

// Hent alle koblinger for en risiko
import { getChemicalRiskLinks } from "@/server/actions/risk-chemical.actions";

const { data: links } = await getChemicalRiskLinks(riskId);

// Hent risikoer for et kjemikalie
import { getRiskLinksForChemical } from "@/server/actions/risk-chemical.actions";

const { data: risks } = await getRiskLinksForChemical(chemicalId);

// Generer automatiske forslag
import { suggestRiskForChemical } from "@/server/actions/risk-chemical.actions";

const { data: suggestions } = await suggestRiskForChemical(chemicalId);
```

### Opplæringskrav

```typescript
// Legg til opplæringskrav
import { addTrainingRequirementToRisk } from "@/server/actions/risk-training.actions";

const result = await addTrainingRequirementToRisk({
  riskId: "risk_abc123",
  courseKey: "diisocyanate-handling",
  isMandatory: true,
  reason: "EU REACH Annex XVII - Påkrevd for diisocyanater"
});

// Fjern opplæringskrav
import { removeTrainingRequirement } from "@/server/actions/risk-training.actions";

await removeTrainingRequirement(requirementId);

// Hent opplæringskrav for risiko
import { getTrainingRequirementsForRisk } from "@/server/actions/risk-training.actions";

const { data: requirements } = await getTrainingRequirementsForRisk(riskId);

// Sjekk compliance
import { checkTrainingComplianceForRisk } from "@/server/actions/risk-training.actions";

const { data } = await checkTrainingComplianceForRisk(riskId);
console.log(data.compliant); // true/false
console.log(data.missingTraining); // Liste over manglende opplæring
```

---

## 📊 ISO Compliance

### ISO 45001 (HMS)

**6.1.2 Fareidentifikasjon og risikovurdering**
- Alle farlige kjemikalier skal risikovurderes
- Eksponeringsveier skal dokumenteres
- Sikkerhetstiltak skal implementeres

**7.2 Kompetanse**
- Ansatte eksponert for farlige stoffer skal ha påkrevd opplæring
- Diisocyanater: Obligatorisk kurs (EU REACH Annex XVII)
- CMR-stoffer: Spesialisert opplæring

### ISO 14001 (Miljø)

**6.1.2 Miljøaspekter**
- Kjemikalier med miljøpåvirkning skal identifiseres
- SVHC-stoffer krever spesiell håndtering
- Substitusjonsvurdering for høyrisiko stoffer

---

## 🔄 Automatisk Risikoforslag - Logikk

### CMR-stoffer

```typescript
{
  title: "Eksponering for CMR-stoff: [Produktnavn]",
  category: "HEALTH",
  exposure: "CRITICAL",
  suggestedControls: [
    "Substitusjonsvurdering (erstatt hvis mulig)",
    "Lukket system / punktavsug",
    "Åndedrettsvern med rette filtertype",
    "Obligatorisk helsekontroll",
    "Begrens antall eksponerte"
  ],
  trainingRequired: ["cmr-handling", "respiratory-protection"]
}
```

### Diisocyanater

```typescript
{
  title: "Håndtering av diisocyanater: [Produktnavn]",
  category: "HEALTH",
  exposure: "HIGH",
  reason: "EU REACH Annex XVII - Obligatorisk opplæring",
  suggestedControls: [
    "Obligatorisk diisocyanat-opplæring (EU-krav)",
    "Åndedrettsvern under påføring",
    "Ventilert arbeidsområde",
    "Hudvern (hansker, verneklær)",
    "Helseundersøkelse"
  ],
  trainingRequired: ["diisocyanate-handling", "respiratory-protection"]
}
```

### SVHC (Substance of Very High Concern)

```typescript
{
  title: "SVHC-stoff: [Produktnavn]",
  category: "ENVIRONMENTAL",
  exposure: "HIGH",
  suggestedControls: [
    "Vurder substitusjon",
    "Minimer eksponering",
    "Kontrollert lagring",
    "Sporbarhet og dokumentasjon",
    "Regelmessig overvåking"
  ],
  trainingRequired: ["hazardous-substances"]
}
```

---

## 🧪 Testing

### Migrasjon

```bash
# Kjør migreringen
npx prisma migrate dev --name risk_chemical_training_links

# Generer Prisma Client
npx prisma generate
```

### Testscenarioer

1. **Registrer CMR-stoff**
   - Last opp sikkerhetsdatablad
   - Verifiser at AI detekterer CMR
   - Sjekk at automatiske risikoforslag vises
   - Opprett risiko fra forslag
   - Verifiser at kjemikalie er koblet
   - Sjekk at opplæringskrav er lagt til

2. **Registrer diisocyanat**
   - Last opp sikkerhetsdatablad med diisocyanat
   - Verifiser at `containsIsocyanates: true`
   - Sjekk at EU REACH-varsel vises
   - Verifiser at obligatorisk kurs foreslås

3. **Manuell kobling**
   - Opprett risiko
   - Legg til kjemikalie manuelt
   - Sett eksponeringsnivå
   - Legg til opplæringskrav

---

## 📝 Kommende Forbedringer

1. **Compliance Dashboard**
   - Oversikt over ansatte uten påkrevd opplæring
   - Automatiske varsler
   - Sertifikat-tracking

2. **Substitusjonsvurdering**
   - Automatisk forslag til mindre farlige alternativer
   - ECHA-database integrasjon

3. **Eksponeringskalkulator**
   - Beregn eksponeringsgrad basert på bruksfrekvens
   - Automatisk justering av risikoscore

4. **Batch-kobling**
   - Koble flere kjemikalier til samme risiko
   - Import fra Excel

---

## 🆘 Feilsøking

### Komponenten viser ikke risikoforslag

**Problem:** `ChemicalRiskSuggestions` vises ikke.

**Løsning:**
- Sjekk at kjemikaliet har `isCMR`, `isSVHC`, `containsIsocyanates`, eller `hazardLevel >= 4`
- Verifiser at `suggestRiskForChemical` returnerer data
- Sjekk console for errors

### Kan ikke legge til opplæringskrav

**Problem:** Får error ved opplæringskrav.

**Løsning:**
- Sjekk at `courseKey` eksisterer i `CourseTemplate`
- Verifiser at kurset ikke allerede er lagt til
- Sjekk tenant-tilgang

### Migreringsfeil

**Problem:** Prisma migrate feiler.

**Løsning:**
```bash
# Reset database (NB: Sletter data!)
npx prisma migrate reset

# Eller: Manuell fix
npx prisma db push --skip-generate
npx prisma generate
```

---

## 📚 Relaterte Dokumenter

- [Multi-tenant Settings Fix](./MULTI_TENANT_FIX_GUIDE.md)
- [Deployment Notes](./DEPLOYMENT_NOTES.md)
- [Chemical AI Features](./src/lib/sds-parser.ts)
- [ISO 45001 Compliance](./docs/ISO_45001_COMPLIANCE.md)

---

**Opprettet:** 22. januar 2026  
**Forfatter:** HMS Nova AI  
**Versjon:** 1.0
