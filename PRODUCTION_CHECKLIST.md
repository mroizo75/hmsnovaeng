# 🚀 HMS Nova - Produksjonssjekkliste

## ✅ Fullført

### SEO & Synlighet
- [x] **Metadata**: Komplett OpenGraph og Twitter Cards på alle sider
- [x] **Structured Data**: JSON-LD schema for Organization og Software
- [x] **Sitemap**: Dynamisk sitemap.xml med blogginnlegg
- [x] **Robots.txt**: Konfigurert for Google, ChatGPT og Perplexity AI
- [x] **Keywords**: Optimalisert for HMS-bransjen i Norge
- [x] **Canonical URLs**: Alle sider har canonical tags
- [x] **AI Crawlers**: Spesialregler for GPTBot og PerplexityBot

### Sikkerhet
- [x] **NextAuth.js**: Autentisering med session management
- [x] **Role-Based Access Control (RBAC)**: 7 roller implementert
- [x] **Rate Limiting**: Beskyttelse mot brute force (signin, API)
- [x] **Environment Variables**: Alle secrets i .env
- [x] **CORS**: Konfigurert i middleware
- [x] **Input Validation**: Zod schemas på kritiske punkter
- [x] **SQL Injection**: Prisma ORM forebygger dette
- [x] **XSS Protection**: React's innebygde sanitering + DOMPurify for blogg
- [x] **CSRF Protection**: Next.js innebygd
- [x] **File Upload**: Validering av filtype, størrelse og navn
- [x] **Signed URLs**: R2 sikret med tidsbegrensede URLer (7 dager)

### Performance
- [x] **Image Optimization**: Next.js Image component brukes
- [x] **Code Splitting**: Automatisk via Next.js App Router
- [x] **Lazy Loading**: React.lazy() der aktuelt
- [x] **Database Indexing**: Prisma schema har indexer
- [x] **Caching**: 
  - Next.js cache og revalidatePath
  - R2 signed URLs cachet i 7 dager
  - Static pages pre-rendered
- [x] **Compression**: Next.js automatisk gzip/brotli

### Database
- [x] **Prisma ORM**: Type-safe queries
- [x] **Multi-tenancy**: Alle data isolert per tenant
- [x] **Migrations**: Schema versjonert
- [x] **Audit Logging**: Kritiske handlinger logges
- [x] **Backup**: (Sørg for at VPS har automatisk backup)

### Integrasjoner
- [x] **R2 Storage**: Cloudflare for filer og bilder
- [x] **Resend Email**: Transaksjonelle e-poster
- [x] **Fiken API**: Fakturering (webhook implementert)
- [x] **Brønnøysund**: Bedriftsdata (optional)

### Funksjonalitet
- [x] **Blogg**: Med TipTap editor, SEO, tags, kategori
- [x] **Forms**: Dynamisk skjemabygger med signatur
- [x] **Documents**: Versjonering og tilgangskontroll
- [x] **Chemicals**: Stoffkartotek med SDS
- [x] **Incidents**: Avviksrapportering
- [x] **Training**: Opplæringsstyring
- [x] **Meetings**: Møtereferat med deltakere
- [x] **Whistleblowing**: Anonym varsling per tenant
- [x] **Inspections**: Vernerunder med bilder
- [x] **Risk Assessment**: Risikovurdering
- [x] **Goals**: Målstyring

## ⚠️ Gjenstår før produksjon

### Console Logs & Debug
- [ ] **Rydd console.logs**: 308 console.log() funnet - MÅ FJERNES!
  - Kjør: `npm run cleanup:logs` (se under)
  - Manuelt sjekk kritiske filer
  - Bruk logger utility i stedet

### Environment Variables (VPS)
- [ ] **NEXT_PUBLIC_URL**: Sett til `https://hmsnova.no`
- [ ] **DATABASE_URL**: MySQL connection string
- [ ] **NEXTAUTH_SECRET**: Generer med `openssl rand -base64 32`
- [ ] **NEXTAUTH_URL**: `https://hmsnova.no`
- [ ] **R2_ENDPOINT**: Cloudflare R2 endpoint
- [ ] **R2_ACCESS_KEY_ID**: R2 access key
- [ ] **R2_SECRET_ACCESS_KEY**: R2 secret
- [ ] **R2_BUCKET_NAME**: Bucket navn
- [ ] **RESEND_API_KEY**: Resend API nøkkel
- [ ] **RESEND_FROM_EMAIL**: `HMS Nova <noreply@hmsnova.no>`
- [ ] **FIKEN_CLIENT_ID**: (hvis Fiken brukes)
- [ ] **FIKEN_CLIENT_SECRET**: (hvis Fiken brukes)

### Google Services
- [ ] **Google Search Console**: Verifiser domene
- [ ] **Google Analytics**: Legg til tracking (GDPR-compliant)
- [ ] **Google Tag Manager**: (optional)
- [ ] **Structured Data Testing**: Test schema.org markup

### Monitoring & Error Tracking
- [ ] **Sentry**: Installer for error tracking
  ```bash
  npm install @sentry/nextjs
  ```
- [ ] **Logging**: Sett opp strukturert logging (Winston/Pino)
- [ ] **Uptime Monitoring**: UptimeRobot eller Pingdom
- [ ] **Performance Monitoring**: Vercel Analytics eller Sentry

### SSL & Domain
- [ ] **SSL Certificate**: Sørg for at HTTPS fungerer
- [ ] **Domain**: hmsnova.no peker til riktig server
- [ ] **Redirects**: www -> non-www (eller omvendt)
- [ ] **HSTS**: HTTP Strict Transport Security header

### Testing før Launch
- [ ] **Lighthouse Score**: 
  - Performance: > 90
  - Accessibility: > 95
  - Best Practices: 100
  - SEO: 100
- [ ] **Cross-browser**: Test Chrome, Firefox, Safari, Edge
- [ ] **Mobile**: Test iOS og Android
- [ ] **Load Testing**: Simuler 100+ samtidige brukere
- [ ] **Security Scan**: OWASP ZAP eller lignende

### Juridisk & GDPR
- [ ] **Personvernerklæring**: Oppdatert og korrekt
- [ ] **Vilkår**: Gjennomgått av juridisk
- [ ] **Cookie Consent**: Fungerer korrekt
- [ ] **GDPR**: Data sletting, eksport, rett til innsyn
- [ ] **Databehandleravtaler**: Med Cloudflare, Resend, etc.

### Backup & Disaster Recovery
- [ ] **Database Backup**: Daglig backup konfigurert
- [ ] **R2 Backup**: Versjonering aktivert
- [ ] **Recovery Plan**: Dokumentert prosedyre
- [ ] **Test Restore**: Kjør en testgjenoppretting

### Documentation
- [ ] **API Documentation**: Hvis eksternt API
- [ ] **User Manual**: For admins
- [ ] **Onboarding**: Guide for nye kunder
- [ ] **Support**: Helpdocs eller FAQ

## 🔧 Oppryddingsscript

### Fjern Console Logs
Opprett fil: `scripts/cleanup-logs.js`

\`\`\`javascript
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function removeConsoleLogs(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      removeConsoleLogs(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      const original = content;
      
      // Fjern console.log, console.debug, console.info (behold console.error og console.warn i prod)
      content = content.replace(/console\.(log|debug|info)\([^;]*\);?\\n?/g, '');
      
      if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(\`Cleaned: \${filePath}\`);
      }
    }
  });
}

removeConsoleLogs(srcDir);
console.log('✅ Console logs cleaned!');
\`\`\`

Legg til i `package.json`:
\`\`\`json
"scripts": {
  "cleanup:logs": "node scripts/cleanup-logs.js"
}
\`\`\`

## 📊 Performance Mål

| Metric | Mål | Status |
|--------|-----|--------|
| First Contentful Paint | < 1.5s | ⏳ Test |
| Largest Contentful Paint | < 2.5s | ⏳ Test |
| Time to Interactive | < 3.5s | ⏳ Test |
| Cumulative Layout Shift | < 0.1 | ⏳ Test |
| Total Blocking Time | < 300ms | ⏳ Test |

## 🔍 SEO Sjekkliste

- [x] Title tags (<60 tegn)
- [x] Meta descriptions (<160 tegn)
- [x] H1 tags på alle sider
- [x] Alt text på bilder
- [x] Internal linking
- [x] Canonical URLs
- [x] Sitemap.xml
- [x] Robots.txt
- [ ] Google Search Console verifisering
- [ ] Schema.org markup testing
- [ ] Page speed > 90

## 🚨 Før Deploy

1. ✅ Kjør `npm run build` lokalt - ingen feil
2. ⚠️ Kjør `npm run cleanup:logs` - fjern debug
3. ⚠️ Test alle kritiske flyter manuelt
4. ⚠️ Sjekk at alle environment variables er satt på VPS
5. ⚠️ Backup database før deploy
6. ⚠️ Deploy til VPS
7. ⚠️ Test produksjonsurl (hmsnova.no)
8. ⚠️ Kjør Lighthouse audit
9. ⚠️ Monitorer error logs første 24 timer

## 📞 Support

- **Teknisk**: Kenneth (deg)
- **Hosting**: VPS provider
- **Email**: Resend support
- **Storage**: Cloudflare R2 support

