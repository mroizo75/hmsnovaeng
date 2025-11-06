# 📸 HMS Nova - Sosiale Medier Bilder & SEO Guide

## 🚨 MANGLER (Kritisk for sosiale medier)

### 1. Open Graph Image (Facebook, LinkedIn, WhatsApp)
**Filnavn**: `public/og-image.png`  
**Størrelse**: 1200 x 630 pixels  
**Format**: PNG eller JPG  
**Maks størrelse**: < 1MB

**Innhold**:
- HMS Nova logo (stor og tydelig)
- Tagline: "HMS Nova bygger trygghet"
- Ren, profesjonell bakgrunn (HMS Nova grønnfarger)
- Kontrastrik tekst
- Ingen små detaljer (vises som thumbnail)

**Design tips**:
- Bruk Canva, Figma eller Adobe Express
- Safe zone: Hold viktig innhold 200px fra kantene
- Test hvordan det ser ut som lite thumbnail

### 2. Twitter Card Image (optional - kan bruke samme som OG)
**Filnavn**: `public/twitter-image.png`  
**Størrelse**: 1200 x 630 pixels  
**Format**: PNG eller JPG

**Kan være samme som `og-image.png`**

### 3. Blog-spesifikke bilder (for blogginnlegg)
**Filnavn**: `public/og-image-blog.png`  
**Størrelse**: 1200 x 630 pixels  
**Innhold**: HMS Nova logo + "HMS-blogg" eller lignende

---

## ✅ Allerede på plass

1. ✅ **Favicon** (16x16, 32x32) - Funker!
2. ✅ **Apple Touch Icon** (180x180) - For iOS
3. ✅ **Android Chrome Icons** (192x192, 512x512) - For Android
4. ✅ **Logo** (`logo-nova.png`) - Hovedlogo
5. ✅ **Site manifest** - PWA-støtte

---

## 🎨 Lag OG Image - Steg-for-steg

### Metode 1: Canva (Anbefalt - Gratis)

1. **Gå til**: https://www.canva.com
2. **Velg**: "Custom Size" → 1200 x 630 px
3. **Design**:
   ```
   - Bakgrunn: Grønn gradient eller solid (#16a34a)
   - Logo: Stor HMS Nova logo (sentrert)
   - Tekst: "HMS Nova bygger trygghet" (stor, hvit font)
   - Undertekst: "Norges mest moderne HMS-system" (mindre)
   ```
4. **Last ned**: Som PNG
5. **Navn filen**: `og-image.png`
6. **Plasser**: I `public/` mappen

### Metode 2: Figma (Profesjonell)

1. **Opprett ny fil**: 1200 x 630 px
2. **Design layout**:
   ```
   Frame: 1200x630
   └── Bakgrunn (grønn #16a34a)
   └── Logo (400px bred, sentrert)
   └── Heading (64px, bold, hvit)
   └── Subheading (32px, semi-bold, hvit/90%)
   ```
3. **Eksporter**: PNG @ 2x
4. **Komprimer**: TinyPNG.com (reduser til <200KB)

### Metode 3: Bruk eksisterende logo

Hvis du bare vil bruke logoen din:

```bash
# Installer ImageMagick (hvis ikke allerede installert)
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Lag OG image med logo sentrert på grønn bakgrunn
magick convert -size 1200x630 xc:"#16a34a" \
  public/logo-nova.png -gravity center -composite \
  public/og-image.png
```

---

## 📋 Komplett SEO Sjekkliste (100%)

### A. Teknisk SEO ✅
- [x] Sitemap.xml genereres dynamisk
- [x] Robots.txt konfigurert for AI crawlers
- [x] Canonical URLs på alle sider
- [x] Structured data (JSON-LD Organization schema)
- [x] SSL/HTTPS (på produksjon)
- [x] Mobile-responsive design
- [x] Fast loading (Next.js optimalisering)

### B. On-Page SEO ✅
- [x] Title tags (<60 tegn)
- [x] Meta descriptions (<160 tegn)
- [x] H1 tags på alle sider
- [x] Heading hierarchy (H1 → H2 → H3)
- [x] Alt text på bilder
- [x] Internal linking
- [x] Keywords i URL (slugs)
- [x] Schema markup

### C. Sosiale Medier (Gjør nå!)
- [ ] **Open Graph image** (`og-image.png`) - LAG DETTE!
- [ ] **Twitter Card image** (kan være samme)
- [ ] Test med:
  - Facebook Debugger: https://developers.facebook.com/tools/debug/
  - Twitter Card Validator: https://cards-dev.twitter.com/validator
  - LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

### D. Performance ⚠️
- [ ] **Test Lighthouse**: 
  ```bash
  # Kjør på produksjon
  npm install -g @lhci/cli
  lhci autorun --collect.url=https://hmsnova.no
  ```
  - Mål: Performance > 90
  - Mål: SEO = 100
- [ ] **Image optimization**: Komprimer alle bilder i `/public`
  ```bash
  npm install -g sharp-cli
  # Komprimer alle PNG-filer
  sharp -i "public/**/*.png" -o "public/" --format webp
  ```

### E. External SEO
- [ ] **Google Search Console**:
  1. Gå til: https://search.google.com/search-console
  2. Legg til eiendom: `https://hmsnova.no`
  3. Verifiser domene (DNS TXT record eller HTML fil)
  4. Submit sitemap: `https://hmsnova.no/sitemap.xml`

- [ ] **Google Business Profile**:
  1. Opprett bedriftsprofil
  2. Verifiser adresse
  3. Legg til logo, bilder, åpningstider
  4. Link til hmsnova.no

- [ ] **Bing Webmaster Tools**:
  1. https://www.bing.com/webmasters
  2. Legg til nettsted
  3. Submit sitemap

### F. Content SEO ✅
- [x] Blogg med keywords
- [x] FAQ-seksjoner (implisitt i sidene)
- [x] Service-sider (priser, kurs, BHT)
- [x] Call-to-actions
- [x] Lokalt fokus (Norge)

### G. Backlinks & Authority
- [ ] **Directories**:
  - Proff.no
  - Gule Sider
  - Bransjeregisteret
  - Startuplab.no (hvis relevant)

- [ ] **Partnerships**:
  - BHT-leverandører
  - HMS-organisasjoner
  - Arbeidstilsynet (resources)

### H. Analytics & Tracking
- [ ] **Google Analytics 4**:
  ```typescript
  // Legg til i .env:
  NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
  ```
  Installer tracking: https://analytics.google.com

- [ ] **Microsoft Clarity** (gratis heatmaps):
  ```html
  <!-- I layout.tsx -->
  <script type="text/javascript">
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "YOUR_PROJECT_ID");
  </script>
  ```

---

## 🧪 Testing Tools

### Før Launch:
```bash
# 1. Lighthouse (Performance + SEO)
npm install -g lighthouse
lighthouse https://hmsnova.no --view

# 2. PageSpeed Insights
# Gå til: https://pagespeed.web.dev/
# Test: https://hmsnova.no

# 3. Mobile-Friendly Test
# Gå til: https://search.google.com/test/mobile-friendly
```

### Sosiale Medier Preview:
1. **Facebook**: https://developers.facebook.com/tools/debug/
2. **Twitter**: https://cards-dev.twitter.com/validator
3. **LinkedIn**: https://www.linkedin.com/post-inspector/
4. **WhatsApp**: Del lenken i WhatsApp Web

---

## 📊 SEO Metrics å følge med på

| Metric | Tool | Mål |
|--------|------|-----|
| Organic Traffic | Google Analytics | +20% per måned |
| Keyword Rankings | Google Search Console | Top 3 for "HMS system Norge" |
| Click-Through Rate | Search Console | > 5% |
| Bounce Rate | Analytics | < 40% |
| Page Speed | Lighthouse | > 90 |
| Core Web Vitals | Search Console | Alle grønne |

---

## 🚀 Quick Wins (Gjør NÅ!)

### 1. Lag OG Image (10 min)
```bash
# Last ned: https://www.canva.com/templates/?query=social+media
# Bruk HMS Nova farger og logo
# Lagre som: public/og-image.png
```

### 2. Komprimer bilder (5 min)
```bash
# Installer TinyPNG CLI
npm install -g tinypng-cli
# Komprimer
tinypng public/*.png -k YOUR_API_KEY
```

### 3. Test Social Sharing (2 min)
```bash
# Del denne på Facebook:
https://hmsnova.no

# Sjekk at:
# - Riktig tittel vises
# - Beskrivelse er god
# - Bilde vises (når du har laget og lagt til og-image.png)
```

### 4. Google Search Console (15 min)
```bash
# 1. Verifiser domene
# 2. Submit sitemap: https://hmsnova.no/sitemap.xml
# 3. Request indexing for viktige sider
```

---

## 🎯 Prioritert Rekkefølge

### Kritisk (Gjør i dag):
1. ✅ Lag `og-image.png` (1200x630px)
2. ✅ Test Facebook/Twitter deling
3. ✅ Submit til Google Search Console
4. ✅ Verifiser Google Business Profile

### Viktig (Gjør denne uka):
5. Sett opp Google Analytics
6. Lighthouse audit
7. Komprimer bilder
8. Legg til i directories (Proff.no, Gule Sider)

### Nice-to-have (Gjør neste uke):
9. Microsoft Clarity heatmaps
10. Bing Webmaster Tools
11. Backlink strategi
12. Content marketing plan

---

## 💡 Tips for Sosiale Medier

### Facebook/LinkedIn Post Template:
```
🚀 Nyhet! HMS Nova er nå live!

Norges mest moderne HMS-system er her:
✅ Digital signatur
✅ 7 roller (fra ansatt til revisor)
✅ ISO 9001 compliant
✅ Fra 6.990 kr/år

Prøv gratis i 14 dager: https://hmsnova.no/gratis-hms-system

#HMS #Arbeidsmiljø #ISOsertifisering #NorskeBedrifter
```

### Twitter/X Post:
```
🎯 HMS Nova - Norges mest moderne HMS-system

Fra små bedrifter til store konsern
✓ Digitalt
✓ Automatisert
✓ ISO 9001

Prøv gratis → hmsnova.no

#HMS #WorkplaceSafety #Norway
```

---

## 📞 Neste Steg

1. **Lag og-image.png** (bruk Canva guide over)
2. **Test deling** på Facebook/LinkedIn
3. **Submit til Google** Search Console
4. **Monitorer** Google Analytics første uka
5. **Optimaliser** basert på data

Alt annet er på plass! 🎉

