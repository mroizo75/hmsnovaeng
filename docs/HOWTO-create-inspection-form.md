# 📋 Slik lager du et vernerunde-skjema

## 🎯 Steg-for-steg guide

### 1️⃣ Opprett skjema

1. Gå til **Skjemaer** i menyen
2. Klikk på **Nytt skjema**
3. Fyll ut:
   - **Tittel:** f.eks. "Månedlig vernerunde - Kontor"
   - **Beskrivelse:** f.eks. "Standard sjekkliste for kontorarbeidsplasser"
   - **Kategori:** Velg **"🔍 Inspeksjon / Vernerunde"** ← VIKTIG!

### 2️⃣ Bygg skjemaet

Legg til felter du trenger:

**Eksempel for kontor-vernerunde:**
- ☑️ **Avkrysning:** "Ergonomi - riktig stol- og skjermhøyde"
- ☑️ **Avkrysning:** "Orden og rydding - fri gangvei"
- ☑️ **Avkrysning:** "Elektrisk utstyr - ingen slitte kabler"
- ☑️ **Avkrysning:** "Brannvern - rømningsveier frie"
- 📝 **Tekstområde:** "Kommentarer og observasjoner"
- 📷 **Filopplasting:** "Last opp bilder av avvik"
- ✍️ **Signatur:** "Signatur verneombud"

### 3️⃣ Lagre skjemaet

Klikk på **Lagre skjema**

### 4️⃣ Bruk skjemaet i vernerunde

1. Gå til **Vernerunder** → **Ny inspeksjon**
2. Under **"📋 Vernerunde-skjema"** vil du nå se skjemaet du opprettet
3. Velg skjemaet
4. Tittel og beskrivelse fylles automatisk inn
5. Fyll ut resten av informasjonen
6. Klikk **Opprett inspeksjon**

---

## ✅ Eksempel-skjemaer

### Kontor-vernerunde
```
Kategori: Inspeksjon / Vernerunde

Felter:
1. ☑️ Ergonomi OK
2. ☑️ Orden og rydding OK
3. ☑️ Elektrisk utstyr OK
4. ☑️ Brannvern OK
5. ☑️ Inneklima OK
6. 📝 Kommentarer
7. 📷 Bilder
8. ✍️ Signatur
```

### Lager-vernerunde
```
Kategori: Inspeksjon / Vernerunde

Felter:
1. ☑️ Gangveier frie
2. ☑️ Verneutstyr tilgjengelig
3. ☑️ Sikring av høyder OK
4. ☑️ Maskiner og utstyr OK
5. ☑️ Stabling sikker
6. ☑️ Nødutganger frie
7. 🔢 Antall avvik
8. 📝 Beskrivelse av avvik
9. 📷 Bilder av avvik
10. ✍️ Signatur HMS-ansvarlig
```

### Byggeplass-vernerunde
```
Kategori: Inspeksjon / Vernerunde

Felter:
1. ☑️ Adgangskontroll OK
2. ☑️ Verneutstyr i bruk
3. ☑️ Stillas godkjent
4. ☑️ Gravesikring OK
5. ☑️ Løfteoperasjoner OK
6. ☑️ Elektrisk anlegg OK
7. ☑️ Kjemikalier forsvarlig lagret
8. ☑️ SHA-plan oppdatert
9. 📝 Observasjoner
10. 📝 Tiltak som må iverksettes
11. 📷 Bilder
12. ✍️ Signatur prosjektleder
```

---

## 🎨 Tilgjengelige felttyper

| Type | Beskrivelse | Bruk til |
|------|-------------|----------|
| ☑️ Avkrysning | Ja/Nei | Sjekkliste-punkter |
| 📝 Kort tekst | Enkeltlinje | Navn, sted, etc. |
| 📝 Tekstområde | Flere linjer | Kommentarer, beskrivelser |
| 🔢 Tall | Numerisk | Antall, målinger |
| 📅 Dato | Datovelger | Frister, datoer |
| ⏰ Dato + tid | Dato og klokkeslett | Tidspunkter |
| 🔘 Flervalg | Radioknapper | Ett valg av flere |
| 📋 Dropdown | Nedtrekksmeny | Ett valg av mange |
| 📷 Filopplasting | Last opp filer | Bilder, dokumenter |
| ✍️ Signatur | Digital signatur | Godkjenning |

---

## 💡 Tips

### Gode praksiser:
- ✅ Bruk tydelige og konkrete spørsmål
- ✅ Legg til hjelpetekst for å forklare hva som skal sjekkes
- ✅ Bruk avkrysning for ja/nei-spørsmål
- ✅ Legg til tekstfelt for kommentarer
- ✅ Inkluder filopplasting for bilder av avvik
- ✅ Avslutt med signatur for godkjenning

### Unngå:
- ❌ For mange felter (maks 15-20)
- ❌ Vage spørsmål
- ❌ Kompliserte skjemaer som tar lang tid å fylle ut

---

## 🔄 Oppdatere et skjema

1. Gå til **Skjemaer**
2. Finn skjemaet du vil endre
3. Klikk på **Rediger**
4. Gjør endringene
5. Klikk **Lagre**

**OBS:** Endringer påvirker ikke eksisterende vernerunder, kun nye.

---

## ❓ Ofte stilte spørsmål

**Q: Kan jeg bruke samme skjema for flere vernerunder?**  
A: Ja! Du kan bruke samme skjema så mange ganger du vil.

**Q: Kan jeg ha flere vernerunde-skjemaer?**  
A: Ja! Du kan lage ulike skjemaer for ulike typer vernerunder (kontor, lager, byggeplass, etc.)

**Q: Hva skjer hvis jeg sletter et skjema?**  
A: Eksisterende vernerunder som bruker skjemaet påvirkes ikke, men du kan ikke opprette nye vernerunder med det skjemaet.

**Q: Kan jeg kopiere et skjema?**  
A: Ikke ennå, men denne funksjonen kommer snart!

**Q: Jeg ser ikke "Inspeksjon / Vernerunde" i kategoriene?**  
A: Sjekk at du har oppdatert systemet. Kjør `git pull` og `npm install` på serveren.

---

**Opprettet:** 29. desember 2025  
**Sist oppdatert:** 29. desember 2025

