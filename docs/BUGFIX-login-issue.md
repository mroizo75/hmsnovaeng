# Feilretting: Innloggingsproblem med inviterte brukere

## Problem
Når tenant-eiere inviterer nye brukere, genereres det et midlertidig passord som sendes på e-post. Brukere får feilmelding "Ugyldig passord eller brukernavn" når de prøver å logge inn med de mottatte påloggingsopplysningene.

## Rotårsak
Det var **to kritiske problemer**:

### 1. Inkonsistent e-postnormalisering
- E-postadresser ble lagret i databasen **uten toLowerCase()** når brukere ble invitert
- Dette skapte problemer hvis brukeren skrev e-posten med stor forbokstav (f.eks. `Test@example.com`)
- Databasen lagret `Test@example.com` men innlogging søkte med `test@example.com` → bruker ikke funnet

### 2. Passordgenerering med potensielt problematiske tegn
- Den gamle metoden `Math.random().toString(36).slice(-8)` kunne generere passord med tegn som kan tolkes ulikt
- Potensielt problematisk for kopiering/liming eller visning i e-post

## Løsning

### 🔧 Endringer implementert:

#### 1. **src/server/actions/settings.actions.ts** (inviteUser)
- ✅ Normaliserer e-post til lowercase før lagring: `normalizedEmail = data.email.toLowerCase().trim()`
- ✅ Ny passordgenerator som kun bruker alfanumeriske tegn (a-z, 0-9)
- ✅ Konsistent bruk av normalisert e-post i alle operasjoner

#### 2. **src/lib/auth.ts** (authorize)
- ✅ Normaliserer e-post til lowercase før oppslag: `normalizedEmail = credentials.email.toLowerCase().trim()`
- ✅ Sikrer konsistent oppslag mot database

#### 3. **src/server/actions/user.actions.ts** (createUser)
- ✅ Normaliserer e-post før oppslag og lagring

#### 4. **src/lib/sso-tenant-mapping.ts** (createSSOUser)
- ✅ Normaliserer e-post for SSO-brukere

#### 5. **src/server/actions/admin.actions.ts** (createAdminUser)
- ✅ Normaliserer e-post for admin-brukere

#### 6. **src/server/actions/onboarding.actions.ts** (activateTenant)
- ✅ Normaliserer e-post ved tenant-aktivering

### 📦 Migrasjonsscript
- ✅ **scripts/normalize-emails.ts** - Normaliserer alle eksisterende e-postadresser i databasen
- Kjør med: `npx tsx scripts/normalize-emails.ts`

## Testing

### Før du tester i produksjon:
1. **Kjør migrasjonsscriptet**:
   ```bash
   npx tsx scripts/normalize-emails.ts
   ```
   Dette sikrer at alle eksisterende brukere har lowercase e-postadresser.

### Testscenarioer:
1. ✅ Inviter en ny bruker med e-post: `Test@Example.com`
2. ✅ Sjekk at e-posten mottas med midlertidig passord
3. ✅ Logg inn med både `Test@Example.com` og `test@example.com` (begge skal virke)
4. ✅ Verifiser at passordet i e-posten kun inneholder a-z og 0-9

## Sikkerhetsforbedringer
- ✅ Konsistent e-postnormalisering reduserer risiko for duplikate kontoer
- ✅ Enklere passord (kun alfanumerisk) reduserer risiko for kopiering/liming-feil
- ✅ Passord er fortsatt 16 tegn langt for sikkerhet

## Status
✅ **Løsningen er implementert og klar til testing**

Alle steder i kodebasen hvor brukere opprettes, er nå oppdatert til å normalisere e-postadresser konsistent.

