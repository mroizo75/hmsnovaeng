# Feilretting: Manglende vernerundemaler

## Problem
Når brukere skal opprette en ny vernerunde i skjema/inspeksjonssystemet, får de ikke valgt noen maler. Dropdown-menyen for "Inspeksjonsmal" er tom.

## Rotårsak
Det finnes **ingen globale inspeksjonsmaler** i databasen. Seed-scriptene (`prisma/seed.ts` og `prisma/seed-demo.ts`) opprettet kun tenant-spesifikke maler med `isGlobal: false`. Dette betyr at:

1. Nye tenanter som ikke har kjørt seed-scriptet, har **ingen maler tilgjengelig**
2. Det finnes ingen administrasjonsside for å **opprette** nye maler
3. API-endepunktet `/api/inspection-templates` henter kun:
   - Maler som tilhører brukerens tenant
   - Globale maler (`isGlobal: true, tenantId: null`)

## Løsning

### 🔧 Endringer implementert:

#### 1. **Opprettet globale standardmaler**
Nytt script: `scripts/create-global-inspection-templates.ts`

Oppretter 7 globale vernerundemaler som alle tenanter kan bruke:
- ✅ Månedlig vernerunde - Kontor
- ✅ Månedlig vernerunde - Lager/Verksted
- ✅ Kvartalsvis vernerunde - Byggeplass
- ✅ Kjemikaliekontroll
- ✅ Brannøvelse
- ✅ Sikkerhetsvandring (STOP-runde)
- ✅ Psykososial arbeidsmiljø

Kjør med:
```bash
npx tsx scripts/create-global-inspection-templates.ts
```

#### 2. **Forbedret UI**
Oppdatert `src/app/(dashboard)/dashboard/inspections/new/page.tsx`:
- ✅ Viser tydelig melding når det ikke finnes maler
- ✅ Gir brukeren beskjed om å kontakte support
- ✅ Bedre visuell indikasjon for globale maler (🌐 ikon)

## Hvordan fungerer malsystemet?

### Database-struktur (InspectionTemplate)
```typescript
{
  id: string
  tenantId: string | null  // null for globale maler
  name: string
  description: string | null
  category: string | null
  riskCategory: RiskCategory | null
  checklist: Json | null   // Strukturert JSON med sjekkliste-items
  isGlobal: boolean        // true = tilgjengelig for alle
  createdAt: DateTime
  updatedAt: DateTime
}
```

### API-logikk
`/api/inspection-templates` returnerer:
```typescript
OR: [
  { tenantId: userTenant.tenantId },  // Tenant-spesifikke maler
  { tenantId: null, isGlobal: true }  // Globale maler
]
```

### Checklist-struktur
Maler kan inneholde forhåndsdefinerte sjekklister i JSON-format:
```json
{
  "items": [
    { "title": "Orden og ryddighet", "type": "checkbox" },
    { "title": "Bruk av verneutstyr", "type": "checkbox" },
    { "title": "Kommentarer", "type": "textarea" }
  ]
}
```

## Testing

### Før du tester:
1. **Kjør mal-scriptet**:
   ```bash
   npx tsx scripts/create-global-inspection-templates.ts
   ```

### Testscenarioer:
1. ✅ Gå til "Ny inspeksjon" (`/dashboard/inspections/new`)
2. ✅ Sjekk at dropdown "Inspeksjonsmal" nå har 7 globale maler
3. ✅ Velg en mal og se at tittel, beskrivelse og risikokategori fylles ut automatisk
4. ✅ Opprett en vernerunde og verifiser at `templateId` lagres i databasen

## Fremtidige forbedringer

### 1. Administrasjonsside for maler
Lag en side hvor ADMIN/HMS-ansvarlig kan:
- 📝 Opprette egne maler for sin tenant
- ✏️ Redigere eksisterende maler
- 🗑️ Slette maler
- 📋 Forhåndsvise sjekklister

**Foreslått plassering:** `/dashboard/settings/inspection-templates`

### 2. Mal-builder
Lag en drag-and-drop interface for å bygge sjekklister:
- Legge til/fjerne felter
- Velge felttyper (checkbox, textarea, radio, etc.)
- Sette standardverdier
- Betinget logikk (vis felt X hvis Y = Ja)

### 3. Mal-deling
La tenanter dele sine maler med andre:
- Eksporter mal som JSON
- Importer mal fra fil
- Mal-bibliotek i HMS Nova Marketplace

## Status
✅ **Løsningen er implementert og klar til testing**

Alle tenanter vil nå ha tilgang til 7 profesjonelle vernerundemaler som dekker de vanligste bruksområdene.

## Relaterte filer
- `src/app/(dashboard)/dashboard/inspections/new/page.tsx` - UI for ny inspeksjon
- `src/app/api/inspection-templates/route.ts` - API for henting av maler
- `prisma/schema.prisma` - Database-schema (InspectionTemplate)
- `scripts/create-global-inspection-templates.ts` - Script for å opprette maler

