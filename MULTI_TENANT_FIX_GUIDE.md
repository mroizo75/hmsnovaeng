# Multi-Tenant Settings Fix

## Problemet

Systemet hadde en alvorlig designfeil i multi-tenant arkitekturen:

### 1. **E-post var global**
- `User.email` er `@unique` og deles på tvers av alle tenants
- Når en admin endret e-posten på én bedrift, fikk den nye personen tilgang til ALLE tenants den gamle e-posten hadde

### 2. **Innstillinger var globale**
- Varslingsinnstillinger (`notifyByEmail`, `dailyDigest`, `reminderDaysBefore`, etc.) lå på `User`-modellen
- Når en bruker endret innstillinger i én bedrift, overskrev det innstillingene i alle andre bedrifter

### 3. **Konsekvenser**
- ❌ En person kunne få tilgang til andres tenants ved e-postendring
- ❌ Varslingsinnstillinger overskrev hverandre på tvers av bedrifter
- ❌ Forvirrende brukeropplevelse
- ❌ Potensiell sikkerhetstrussel

## Løsningen

### Arkitekturendring

Vi har flyttet tenant-spesifikke innstillinger fra `User` til `UserTenant`:

```prisma
model UserTenant {
  id         String   @id @default(cuid())
  userId     String
  tenantId   String
  role       Role
  department String?
  
  // ✅ NYE KOLONNER: Tenant-spesifikke brukerinnstillinger
  displayName         String?  // Visningsnavn i denne tenanten
  phone              String?  // Telefonnummer for denne tenanten
  
  // ✅ Varslingsinnstillinger (per tenant)
  notifyByEmail       Boolean  @default(true)
  notifyBySms         Boolean  @default(false)
  reminderDaysBefore  Int      @default(1)
  notifyMeetings      Boolean  @default(true)
  notifyInspections   Boolean  @default(true)
  notifyAudits        Boolean  @default(true)
  notifyMeasures      Boolean  @default(true)
  notifyIncidents     Boolean  @default(true)
  notifyDocuments     Boolean  @default(true)
  notifyTraining      Boolean  @default(true)
  notifyRisks         Boolean  @default(true)
  dailyDigest         Boolean  @default(false)
  weeklyDigest        Boolean  @default(true)
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([userId, tenantId])
  @@index([userId])
  @@index([tenantId])
}
```

### Fordeler

✅ **Separate innstillinger per tenant**
- En bruker kan ha ulike varslingsinnstillinger i hver bedrift

✅ **E-post forblir global**
- E-post brukes kun til pålogging
- Endring av e-post påvirker alle tenants (tydelig advart i UI)

✅ **Bedre sikkerhet**
- Ingen risiko for at nye brukere får tilgang til andres tenants

✅ **Enklere administrasjon**
- Hver tenant har full kontroll over sine egne brukerinnstillinger

## Implementerte Endringer

### 1. Database
- ✅ Migrasjon: `prisma/migrations/20260122_fix_multi_tenant_settings/migration.sql`
- ✅ Schema oppdatert: `prisma/schema.prisma`

### 2. Backend Actions
- ✅ `src/server/actions/notification-settings.actions.ts` - Lagrer nå på UserTenant
- ✅ `src/server/actions/settings.actions.ts` - Advarsel om e-postendring

### 3. Frontend Components
- ✅ `src/features/settings/components/notification-settings.tsx` - Bruker userTenant
- ✅ `src/features/settings/components/user-profile-form.tsx` - Advarsel om e-post
- ✅ `src/app/(dashboard)/dashboard/settings/page.tsx` - Sender userTenant

### 4. Services
- ✅ `src/lib/email-digest.ts` - Leser fra UserTenant
- ✅ `src/lib/reminder-service.ts` - Leser fra UserTenant

## Implementeringsplan

### Steg 1: Kjør Database Migrasjon

```bash
# 1. Backup database først!
mysqldump -u root -p hmsnova2 > backup_before_migration.sql

# 2. Kjør migrasjon
npx prisma migrate dev --name fix_multi_tenant_settings

# 3. Generer Prisma Client
npx prisma generate
```

### Steg 2: Test Migreringen

1. Logg inn i systemet
2. Gå til **Innstillinger → Varsler**
3. Endre noen varslingsinnstillinger
4. Hvis du har flere tenants:
   - Bytt tenant
   - Sjekk at innstillingene er separate
5. Test at varsler sendes korrekt

### Steg 3: Verifiser Data

```sql
-- Sjekk at data ble migrert korrekt
SELECT 
  ut.id,
  u.email,
  t.name as tenant_name,
  ut.notifyByEmail,
  ut.dailyDigest,
  ut.weeklyDigest
FROM UserTenant ut
JOIN User u ON ut.userId = u.id
JOIN Tenant t ON ut.tenantId = t.id
LIMIT 10;
```

## Fremtidige Forbedringer

### Kort sikt
- [ ] Legg til mulighet for å endre visningsnavn per tenant
- [ ] Legg til mulighet for å endre telefonnummer per tenant
- [ ] Migrer bort gamle kolonner fra User-tabellen (etter testing)

### Lang sikt
- [ ] Implementer "tenant switcher" for brukere med flere tenants
- [ ] Vis tydelig hvilken tenant brukeren er i
- [ ] Tenant-spesifikk profilbilde/avatar

## Rollback Plan

Hvis noe går galt:

```bash
# 1. Restore database backup
mysql -u root -p hmsnova2 < backup_before_migration.sql

# 2. Reverter koden
git revert HEAD

# 3. Generer Prisma Client
npx prisma generate
```

## Testing Checklist

- [ ] Database migrasjon kjører uten feil
- [ ] Data migreres korrekt fra User til UserTenant
- [ ] Varslingsinnstillinger kan endres per tenant
- [ ] E-post varsling fungerer
- [ ] SMS varsling fungerer (hvis aktivert)
- [ ] Daglige sammendrag sendes
- [ ] Ukentlige sammendrag sendes
- [ ] Påminnelser sendes basert på brukerpreferanser
- [ ] E-post endring viser advarsel
- [ ] Multi-tenant brukere har separate innstillinger

## Support

Hvis du opplever problemer:

1. Sjekk databaselogger: `SELECT * FROM AuditLog WHERE action LIKE '%SETTINGS%' ORDER BY createdAt DESC LIMIT 50;`
2. Sjekk applikasjonslogger for feilmeldinger
3. Verifiser at Prisma Client er generert: `npx prisma generate`
4. Kontakt utvikler hvis problemet vedvarer

---

**Utviklet av:** HMS Nova Team  
**Dato:** 22. januar 2026  
**Versjon:** 2.0.0
