# 📱 HMS Nova - Sosiale Medier Checklist

## 🚨 KRITISK - Gjør før du deler på sosiale medier

### 1. Lag OG Image (5-10 minutter)

**Metode A: Bruk HTML Generator (Raskest)**
```bash
# 1. Åpne i nettleser:
http://localhost:3000/og-image-generator.html
# (eller hvis deployed: https://hmsnova.no/og-image-generator.html)

# 2. Ta screenshot av bildet (Windows: Snipping Tool, Mac: Cmd+Shift+4)

# 3. Crop til eksakt 1200 x 630 pixels

# 4. Lagre som: public/og-image.png

# 5. Commit og push
git add public/og-image.png
git commit -m "Add Open Graph image for social sharing"
git push
```

**Metode B: Bruk Canva (Mest profesjonell)**
```bash
# 1. Gå til: https://www.canva.com
# 2. "Custom Size" → 1200 x 630 px
# 3. Søk etter "Social Media" templates
# 4. Velg en grønn template
# 5. Legg til:
#    - HMS Nova logo (stor)
#    - "HMS Nova bygger trygghet"
#    - "Norges mest moderne HMS-system"
# 6. Last ned som PNG
# 7. Lagre som: public/og-image.png
```

---

## ✅ Verifiser at det fungerer

### Test før du deler offentlig:

**1. Facebook Debugger**
```
https://developers.facebook.com/tools/debug/

Lim inn: https://hmsnova.no
Klikk: "Fetch new information"

Sjekk:
✓ Tittel: "HMS Nova - HMS Nova bygger trygghet"
✓ Beskrivelse vises
✓ Bilde: og-image.png (1200x630)
✓ URL er riktig
```

**2. LinkedIn Post Inspector**
```
https://www.linkedin.com/post-inspector/

Lim inn: https://hmsnova.no
Klikk: "Inspect"

Sjekk:
✓ Thumbnail vises
✓ Tittel og beskrivelse korrekt
✓ Ingen feil/advarsler
```

**3. Twitter Card Validator**
```
https://cards-dev.twitter.com/validator

Lim inn: https://hmsnova.no

Sjekk:
✓ Card type: summary_large_image
✓ Bilde vises
✓ @hmsnova handles korrekt
```

**4. WhatsApp Preview**
```
1. Åpne WhatsApp Web
2. Send lenken til deg selv: https://hmsnova.no
3. Sjekk at preview med bilde vises
```

---

## 📊 Current Status

| Platform | Status | Action Needed |
|----------|--------|---------------|
| **Metadata** | ✅ Klar | Ingen |
| **Favicon** | ✅ Klar | Ingen |
| **Apple Icon** | ✅ Klar | Ingen |
| **OG Image** | ⚠️ Mangler | **LAG DENNE!** |
| **Twitter Card** | ⚠️ Mangler | Bruk samme som OG |
| **Web Manifest** | ✅ Oppdatert | Ingen |
| **Sitemap** | ✅ Klar | Ingen |
| **Robots.txt** | ✅ Klar | Ingen |

---

## 🎯 Sosiale Medier - Best Practices

### Facebook Post Template
```
🚀 Trygg og effektiv HMS-styring for norske bedrifter!

HMS Nova gjør det enkelt å:
✅ Dokumentere alt på ett sted
✅ Oppfylle lovkrav (Arbeidstilsynet)
✅ Spare tid med automatisering
✅ Få ISO 9001 sertifisering

Prøv gratis i 14 dager 👇
https://hmsnova.no/gratis-hms-system

#HMS #Arbeidsmiljø #NorskeBedrifter #ISO9001
```

### LinkedIn Post Template (Mer profesjonell)
```
📊 Norske bedrifter: Slik optimaliserer dere HMS-arbeidet

HMS Nova tilbyr:
• Digital HMS-håndbok med versjonering
• Risikovurdering med automatisk scoring  
• Avvikshåndtering med sporbarhet
• Opplæringsstyring med kompetansematrise
• 7 rollebaserte tilganger (fra ansatt til revisor)

Vi hjelper over [X] bedrifter med å bygge trygghet.

Les mer: https://hmsnova.no

#HMS #WorkplaceSafety #ISO9001 #Compliance
```

### Twitter/X Post (Kortere)
```
🎯 HMS styring for moderne bedrifter

✓ Digital signatur
✓ ISO 9001 compliant  
✓ 7 roller
✓ Fra 6.990 kr/år

Start gratis → hmsnova.no/gratis-hms-system

#HMS #Norway #WorkSafety
```

---

## 🖼️ Bildestørrelser - Quick Reference

| Platform | Size | Format | Notes |
|----------|------|--------|-------|
| **Facebook** | 1200x630 | PNG/JPG | Minimum 600x315 |
| **LinkedIn** | 1200x627 | PNG/JPG | Max 5MB |
| **Twitter** | 1200x675 | PNG/JPG/WEBP | Max 5MB |
| **Instagram** | 1080x1080 | JPG/PNG | Kvadratisk |
| **Pinterest** | 1000x1500 | PNG/JPG | 2:3 ratio |

**HMS Nova standard**: 1200x630 (fungerer for alle)

---

## 🔍 SEO Impact av Sosiale Medier

### Direkte fordeler:
- **Brand Awareness**: Flere ser HMS Nova
- **Traffic**: Direkte klikk til hmsnova.no
- **Engagement**: Kommentarer og delinger
- **Backlinks**: Når andre deler lenken
- **Local SEO**: Norge-fokuserte hashtags

### Indirekte fordeler:
- **Domain Authority**: Sosiale signaler
- **Search Rankings**: Google ser engasjement
- **Trust Signals**: Sosiale profiler verifiserer legitimitet

---

## 📈 Tracking & Analytics

### Sett opp UTM-parametere for sporing:

**Facebook**:
```
https://hmsnova.no?utm_source=facebook&utm_medium=social&utm_campaign=launch
```

**LinkedIn**:
```
https://hmsnova.no?utm_source=linkedin&utm_medium=social&utm_campaign=launch
```

**Twitter**:
```
https://hmsnova.no?utm_source=twitter&utm_medium=social&utm_campaign=launch
```

Se resultater i Google Analytics under:
`Acquisition → Traffic Acquisition → utm_source`

---

## ✅ Final Checklist før Launch

### Pre-Launch
- [ ] `og-image.png` laget og lagt i `/public`
- [ ] Testet på Facebook Debugger
- [ ] Testet på LinkedIn Inspector
- [ ] Testet på Twitter Validator
- [ ] WhatsApp preview sjekket
- [ ] UTM-parametere lagt til lenker
- [ ] Sosiale medier posts skrevet
- [ ] Hashtags researched

### Post-Launch (Første 24 timer)
- [ ] Monitorer Google Analytics for trafikk
- [ ] Sjekk engasjement (likes, kommentarer, delinger)
- [ ] Svar på kommentarer raskt
- [ ] Track conversions (påmeldinger)
- [ ] Juster posts basert på performance

### Første uke
- [ ] Daglig posting på minst 1 plattform
- [ ] Engasjer med HMS-relaterte poster
- [ ] Del kundesuksesser (hvis noen)
- [ ] A/B test forskjellige posts
- [ ] Analyser hva som fungerer best

---

## 🎨 Design Tips for Sosiale Medier Bilder

### Do's:
✅ Bruk HMS Nova grønnfarger (#16a34a, #22c55e)  
✅ Stor, lesbar font  
✅ Mye whitespace  
✅ Logo tydelig plassert  
✅ Kontrast mellom tekst og bakgrunn  
✅ Safe zone (200px fra kantene)  

### Don'ts:
❌ For mye tekst  
❌ Små detaljer (tapt i thumbnail)  
❌ Lav oppløsning  
❌ Feil aspect ratio  
❌ Generiske stock photos  
❌ Over 1MB filstørrelse  

---

## 📞 Neste Steg

**1. Lag OG Image (gjør dette NÅ)**
   → Bruk `og-image-generator.html` eller Canva

**2. Test på alle plattformer**
   → Facebook, LinkedIn, Twitter, WhatsApp

**3. Skriv launch posts**
   → Bruk templates over

**4. Sett opp tracking**
   → Google Analytics + UTM parametere

**5. Launch! 🚀**
   → Del på alle kanaler samtidig

**6. Monitorer & optimaliser**
   → Se hva som fungerer, juster strategi

---

Du er nesten klar! 🎉  
Alt teknisk er på plass - bare lag OG-bildet så er dere 100% klare for sosiale medier!

