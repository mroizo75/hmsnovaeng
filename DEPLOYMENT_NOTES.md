# Deployment Notes - Multi-Tenant Settings Fix

## 🚨 Kritisk Oppdatering - Les Nøye

Denne oppdateringen fikser et **kritisk sikkerhetsproblem** i multi-tenant arkitekturen.

## Hva fikses?

### Problem
- Når en admin endret e-posten til en bruker i én bedrift, fikk den nye personen tilgang til ALLE bedrifter den gamle e-posten var med i
- Varslingsinnstillinger overskrev hverandre på tvers av bedrifter

### Løsning
- Varslingsinnstillinger er nå lagret per tenant (ikke globalt)
- E-post er fortsatt global (for pålogging), men med tydelig advarsel i UI
- Hver bruker kan ha ulike innstillinger i hver bedrift

## Pre-Deployment Checklist

- [ ] **BACKUP DATABASE** - Dette er kritisk!
  ```bash
  mysqldump -u root -p hmsnova2 > backup_$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] Verifiser at backup er vellykket
  ```bash
  ls -lh backup_*.sql
  ```

- [ ] Test migreringen på staging/dev miljø først

## Deployment Steps

### 1. Stop applikasjonen (valgfritt, anbefalt)
```bash
pm2 stop hmsnova2
```

### 2. Pull latest code
```bash
git pull origin master
```

### 3. Install dependencies
```bash
npm install
```

### 4. Kjør database migrasjon
```bash
npx prisma migrate deploy
```

**Forventet output:**
```
Applying migration `20260122_fix_multi_tenant_settings`
✓ Generated Prisma Client
```

### 5. Generer Prisma Client
```bash
npx prisma generate
```

### 6. Build applikasjonen
```bash
npm run build
```

### 7. Start applikasjonen
```bash
pm2 start ecosystem.config.js
# eller
pm2 restart hmsnova2
```

### 8. Verifiser at alt fungerer
```bash
pm2 logs hmsnova2 --lines 50
```

## Post-Deployment Verification

### 1. Test Database Migrasjon
```sql
-- Sjekk at nye kolonner eksisterer
DESCRIBE UserTenant;

-- Verifiser at data ble migrert
SELECT 
  COUNT(*) as total_users,
  SUM(CASE WHEN notifyByEmail = 1 THEN 1 ELSE 0 END) as email_enabled,
  SUM(CASE WHEN notifyBySms = 1 THEN 1 ELSE 0 END) as sms_enabled
FROM UserTenant;
```

### 2. Test i UI
1. Logg inn som admin
2. Gå til **Innstillinger → Varsler**
3. Endre noen innstillinger
4. Verifiser at endringene lagres
5. Hvis du har tilgang til flere tenants:
   - Bytt tenant
   - Sjekk at innstillingene er separate

### 3. Test Varslingssystem
1. Gå til **Innstillinger → Varsler → Test e-postvarsling**
2. Send en test-epost
3. Verifiser at du mottar e-posten

## Rollback Plan

Hvis noe går galt:

### Metode 1: Database Restore (Raskest)
```bash
# 1. Stop applikasjonen
pm2 stop hmsnova2

# 2. Restore database
mysql -u root -p hmsnova2 < backup_YYYYMMDD_HHMMSS.sql

# 3. Revert koden
git revert HEAD

# 4. Reinstall dependencies
npm install

# 5. Rebuild
npm run build

# 6. Restart
pm2 restart hmsnova2
```

### Metode 2: Rollback Migrasjon
```bash
# Prisma støtter ikke automatisk rollback
# Bruk backup-metoden over
```

## Vanlige Problemer og Løsninger

### Problem: Migrasjon feiler med "Column already exists"
**Løsning:**
```sql
-- Sjekk om kolonnene allerede eksisterer
DESCRIBE UserTenant;

-- Hvis de eksisterer, hopp over migreringen
npx prisma migrate resolve --applied 20260122_fix_multi_tenant_settings
```

### Problem: "Prisma Client out of sync"
**Løsning:**
```bash
npx prisma generate
npm run build
pm2 restart hmsnova2
```

### Problem: Brukere ser ikke nye innstillinger
**Løsning:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
3. Logg ut og inn igjen

## Performance Impact

- **Database:** Minimal impact - nye kolonner på eksisterende tabell
- **Application:** Ingen merkbar endring
- **Migration Time:** < 1 minutt for de fleste databaser

## Breaking Changes

### For Utviklere

Hvis du har custom kode som leser varslingsinnstillinger:

**Før:**
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
});
console.log(user.notifyByEmail); // ❌ Gammel måte
```

**Etter:**
```typescript
const userTenant = await prisma.userTenant.findUnique({
  where: {
    userId_tenantId: {
      userId: userId,
      tenantId: tenantId,
    },
  },
});
console.log(userTenant.notifyByEmail); // ✅ Ny måte
```

## Monitoring

Etter deployment, overvåk:

1. **Feillogger**
   ```bash
   pm2 logs hmsnova2 --err
   ```

2. **Database performance**
   ```sql
   SHOW PROCESSLIST;
   ```

3. **Bruker-aktivitet**
   ```sql
   SELECT COUNT(*) as logins_last_hour
   FROM AuditLog
   WHERE action = 'USER_LOGIN'
   AND createdAt > DATE_SUB(NOW(), INTERVAL 1 HOUR);
   ```

## Support Kontakt

Ved problemer:
- **E-post:** support@hmsnova.no
- **Telefon:** +47 XXX XX XXX
- **Slack:** #hmsnova-support

## Dokumentasjon

Fullstendig dokumentasjon: `MULTI_TENANT_FIX_GUIDE.md`

---

**Utviklet av:** HMS Nova Team  
**Deployment Dato:** [FYLL INN VED DEPLOYMENT]  
**Godkjent av:** [FYLL INN]
