# 📋 Vernerunde-skjema integrasjon

## 🎯 Funksjonalitet

Nå kan du opprette egne vernerunde-skjemaer i skjemabyggeren og bruke dem som maler for vernerunder!

---

## ✨ Hvordan det fungerer

### 1️⃣ Opprett et vernerunde-skjema

1. Gå til **Skjemaer** → **Nytt skjema**
2. Gi skjemaet en tittel, f.eks. "Månedlig vernerunde - Kontor"
3. **Viktig:** Velg kategori **"🔍 Inspeksjon / Vernerunde"**
4. Bygg skjemaet med feltene du trenger:
   - Avkrysningsbokser for sjekkliste-punkter
   - Tekstfelt for kommentarer
   - Filopplasting for bilder
   - Signatur for godkjenning
5. Lagre skjemaet

### 2️⃣ Bruk skjemaet i en vernerunde

1. Gå til **Vernerunder** → **Ny inspeksjon**
2. Under **"📋 Vernerunde-skjema (ny type)"** velger du skjemaet du opprettet
3. Skjemaets tittel og beskrivelse fylles automatisk inn
4. Opprett vernerunden

### 3️⃣ Fyll ut skjemaet under vernerunden

Når vernerunden gjennomføres, kan du fylle ut det tilknyttede skjemaet digitalt!

---

## 🔧 Database-endringer

### Nye felter i `Inspection`-tabellen:

```prisma
model Inspection {
  // ... eksisterende felter ...
  
  templateId       String?           // Gammelt system: InspectionTemplate
  formTemplateId   String?           // Nytt system: FormTemplate (skjemabygger)
  formSubmissionId String?           // Kobling til utfylt skjema
  
  // Relasjoner
  template        InspectionTemplate? @relation(...)
  formTemplate    FormTemplate?       @relation("InspectionFormTemplates", ...)
  formSubmission  FormSubmission?     @relation("InspectionFormSubmission", ...)
}
```

### Oppdatert `FormTemplate`:

```prisma
model FormTemplate {
  // ... eksisterende felter ...
  
  inspections Inspection[] @relation("InspectionFormTemplates")
}
```

### Oppdatert `FormSubmission`:

```prisma
model FormSubmission {
  // ... eksisterende felter ...
  
  inspections Inspection[] @relation("InspectionFormSubmission")
}
```

---

## 📊 FormCategory enum

Oppdatert med tydelig beskrivelse:

```prisma
enum FormCategory {
  MEETING       // Møtereferater
  INSPECTION    // Inspeksjoner / Vernerunder ✅ BRUKES FOR VERNERUNDER
  INCIDENT      // Hendelsesrapporter
  RISK          // Risikovurderinger
  TRAINING      // Opplæring
  CHECKLIST     // Sjekklister
  WELLBEING     // Psykososiale skjemaer (ISO 45003)
  BCM           // Beredskaps- og kontinuitetsplaner (ISO 22301)
  COMPLAINT     // Kundeklager (ISO 10002)
  CUSTOM        // Egendefinert
}
```

---

## 🚀 Brukseksempler

### Eksempel 1: Kontor-vernerunde

**Skjema:**
- ✅ Ergonomi - riktig stol- og skjermhøyde
- ✅ Orden og rydding - fri gangvei
- ✅ Elektrisk utstyr - ingen slitte kabler
- ✅ Brannvern - rømningsveier frie
- 📝 Kommentarer (tekstfelt)
- 📷 Last opp bilder (filopplasting)
- ✍️ Signatur (verneombud)

### Eksempel 2: Lager-vernerunde

**Skjema:**
- ✅ Orden og ryddighet - gangveier frie
- ✅ Bruk av verneutstyr - tilgjengelig og i god stand
- ✅ Sikring av høyder - rekkverk og fallsikring
- ✅ Maskiner og utstyr - fungerende vern
- ✅ Stablingsregler - sikker stabling av gods
- ✅ Nødutganger - fri adgang og merking
- 📝 Avvik funnet (tekstområde)
- 🔢 Antall avvik (tall)
- ✍️ Signatur (HMS-ansvarlig)

### Eksempel 3: Byggeplass-vernerunde

**Skjema:**
- ✅ Adgangskontroll - kun autorisert personell
- ✅ Verneutstyr - hjelm, vest, vernesko i bruk
- ✅ Stillas - godkjent og sikret
- ✅ Gravearbeider - gravesikring OK
- ✅ Løfteoperasjoner - sertifisert personell
- ✅ Elektrisk anlegg - godkjent og sikret
- ✅ Kjemi og farlig avfall - forsvarlig lagring
- ✅ SHA-plan - oppdatert og tilgjengelig
- 📷 Bilder av avvik
- 📝 Tiltak som må iverksettes
- ✍️ Signatur (prosjektleder)

---

## 🔄 Migreringskommando

For å oppdatere databasen med de nye feltene:

```bash
# Generer Prisma client
npx prisma generate

# Push endringer til database
npx prisma db push
```

---

## 🎨 UI-forbedringer

### I skjemabyggeren:

- ✅ Kategori "🔍 Inspeksjon / Vernerunde" er tydelig merket
- ✅ Hjelpetekst vises når kategori velges
- ✅ Alle FormCategory-verdier er nå tilgjengelige

### I vernerunde-opprettelse:

- ✅ To separate dropdown-menyer:
  - **Inspeksjonsmal (gammel type)** - For gamle InspectionTemplate-maler
  - **📋 Vernerunde-skjema (ny type)** - For nye FormTemplate-skjemaer
- ✅ Automatisk utfylling av tittel og beskrivelse fra valgt skjema
- ✅ Tydelige meldinger når ingen skjemaer finnes
- ✅ Viser antall tilgjengelige skjemaer

---

## 📝 API-endringer

### GET `/api/forms?category=INSPECTION`

Henter alle skjemaer med kategori "INSPECTION" for bruk i vernerunder.

### POST `/api/inspections`

Støtter nå `formTemplateId` i tillegg til `templateId`:

```json
{
  "title": "Kvartalsvis vernerunde",
  "type": "VERNERUNDE",
  "scheduledDate": "2025-01-15T10:00:00",
  "conductedBy": "userId",
  "formTemplateId": "clxxx...",  // ✅ Nytt felt
  "templateId": null              // Gammelt felt (valgfritt)
}
```

---

## 🔮 Fremtidige forbedringer

### 1. Automatisk skjemautfylling under vernerunde
Når en vernerunde gjennomføres, åpne det tilknyttede skjemaet automatisk for utfylling.

### 2. Koble skjemainnsendelse til vernerunde
Når skjemaet sendes inn, oppdater vernerunden med `formSubmissionId`.

### 3. Vis skjemadata i vernerunde-rapporten
Inkluder skjemadata i PDF-rapporten for vernerunden.

### 4. Mal-bibliotek
Lag et bibliotek med forhåndsdefinerte vernerunde-skjemaer som brukere kan kopiere og tilpasse.

### 5. Mobilapp-støtte
Optimaliser skjemautfylling for mobil under vernerunder på stedet.

---

## ✅ Status

**Implementert:**
- ✅ Database-skjema oppdatert
- ✅ Skjemabygger støtter INSPECTION-kategori
- ✅ Vernerunde-opprettelse kan velge skjemamaler
- ✅ API støtter formTemplateId
- ✅ UI viser tydelig forskjell mellom gamle og nye maler

**Gjenstår:**
- ⏳ Automatisk åpning av skjema under vernerunde
- ⏳ Kobling av skjemainnsendelse til vernerunde
- ⏳ Inkludering av skjemadata i rapporter

---

## 📚 Relaterte filer

- `prisma/schema.prisma` - Database-skjema
- `src/components/forms/form-builder.tsx` - Skjemabygger
- `src/app/(dashboard)/dashboard/inspections/new/page.tsx` - Ny vernerunde
- `src/app/api/inspections/route.ts` - Vernerunde API
- `src/app/api/forms/route.ts` - Skjema API

---

**Opprettet:** 29. desember 2025  
**Versjon:** 1.0

