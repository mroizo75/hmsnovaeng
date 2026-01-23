# HMS Nova - Komplett funksjonsliste for ISO-sertifiseringer

**Dokumentasjon til bruk i tilskuddssøknader for:**
- ISO 9001:2015 (Kvalitetsledelse)
- ISO 14001:2015 (Miljøledelse)
- Miljøfyrtårn-sertifisering
- ISO 45001:2018 (Arbeidsmiljøledelse)

**Dato:** 2026-01-16  
**System:** HMS Nova 2.0  
**Leverandør:** KKS AS  
**Kontakt:** kenneth@hmsnova.no

---

## 📋 Innholdsfortegnelse

1. [Kjernefunksjonalitet](#1-kjernefunksjonalitet)
2. [ISO 9001 - Kvalitetsledelse](#2-iso-9001-kvalitetsledelse)
3. [ISO 14001 - Miljøledelse](#3-iso-14001-miljøledelse)
4. [ISO 45001 - Arbeidsmiljøledelse](#4-iso-45001-arbeidsmiljøledelse)
5. [ISO 27001 - Informasjonssikkerhet](#5-iso-27001-informasjonssikkerhet)
6. [ISO 31000 - Risikostyring](#6-iso-31000-risikostyring)
7. [Støttestandarder](#7-støttestandarder)
8. [Teknisk infrastruktur](#8-teknisk-infrastruktur)
9. [Integrasjoner](#9-integrasjoner)

---

## 1. Kjernefunksjonalitet

### 1.1 Multi-tenant arkitektur
- **Funksjon:** Full separasjon mellom bedrifter (tenants)
- **Relevans:** Sikker datahåndtering, GDPR-compliant
- **Teknisk:** Prisma ORM, MySQL database, row-level security

### 1.2 Autentisering & Autorisasjon
- **Funksjon:** NextAuth v4, bcrypt-kryptering
- **Roller:** 7 roller (ADMIN, HMS, LEDER, VERNEOMBUD, ANSATT, BHT, REVISOR)
- **RBAC:** CASL-basert autorisasjon (Role-Based Access Control)
- **SSO:** Azure AD / Microsoft 365 integrasjon (per-tenant)
- **Sikkerhet:** Account lockout, rate limiting, CSRF-beskyttelse

### 1.3 Varslingssystem
- **E-postvarsler:** Resend API for transaksjonsmeldinger
- **SMS-varsler:** Støtte for SMS (krever telefonnummer)
- **Varslingstyper:**
  - Møter og vernerunder
  - Inspeksjoner og revisjoner
  - Tiltak som forfaller
  - Avvik og hendelser
  - Dokumentgodkjenninger
  - Opplæring og kompetanse
  - Risikovurderinger
- **Sammendrags-e-post:** Daglig eller ukentlig digest

### 1.4 Internasjonalisering
- **Språk:** Norsk (bokmål/nynorsk), Engelsk
- **Teknisk:** next-intl, dynamisk språkvalg

---

## 2. ISO 9001 - Kvalitetsledelse

### 2.1 Dokumentstyring (ISO 9001: Krav 7.5)
- **Versjonskontroll:** Automatisk versjonering (v1.0, v1.1, v2.0)
- **Godkjenningsflyt:** Digital signatur på dokumenter
- **Dokumenttyper:**
  - LAW (Lover og forskrifter)
  - PROCEDURE (Prosedyrer)
  - CHECKLIST (Sjekklister)
  - FORM (Skjemaer)
  - SDS (Sikkerhetsdatablad)
  - PLAN (Planer og håndbøker)
  - OTHER (Annet)
- **Status:** DRAFT → APPROVED → ARCHIVED
- **Gjennomgangsintervall:** Automatisk påminnelse om dokumentrevisjon
- **Roller-basert synlighet:** Bestem hvilke roller som skal se dokumentet
- **Malbibliotek:** Ferdiglagde maler for vanlige dokumenter
- **PDCA-kobling:** Plan-Do-Check-Act integrert i dokumentflyt
- **Søk og filtrering:** Avansert søk i dokumenter
- **Export:** PDF-generering av dokumenter

**ISO 9001 Samsvar:**
- ✅ Krav 7.5.2: Opprettelse og oppdatering av dokumenter
- ✅ Krav 7.5.3: Styring av dokumenter
- ✅ Krav 7.5.3.2: Dokumenter tilgjengelig for relevante personer

### 2.2 Risikovurdering (ISO 9001: Krav 6.1)
- **Risikoregister:** Komplett oversikt over alle risikoer
- **Risikomatrise:** 5x5 matrise (Sannsynlighet × Konsekvens)
- **Kategorier:**
  - OPERATIONAL (Operasjonelle)
  - STRATEGIC (Strategiske)
  - FINANCIAL (Finansielle)
  - COMPLIANCE (Regelverksmessige)
  - REPUTATIONAL (Omdømme)
  - SAFETY (Sikkerhet)
  - ENVIRONMENTAL (Miljø)
  - INFORMATION (Informasjonssikkerhet)
- **Kontroller:** Eksisterende og planlagte tiltak
- **Residual Risk:** Beregning av restrisiko etter tiltak
- **Responsstrategier:**
  - REDUCE (Redusere)
  - ACCEPT (Akseptere)
  - TRANSFER (Overføre)
  - AVOID (Unngå)
- **Trend-analyse:** INCREASING, DECREASING, STABLE
- **Gjennomgangsfrekvens:** Månedlig, kvartalsvis, halvårlig, årlig
- **KPI-kobling:** Knytt risiko til måleparametere
- **Dokumentlinks:** Koble risiko til styringsdokumenter
- **Audit-links:** Koble risiko til revisjoner

**ISO 9001 Samsvar:**
- ✅ Krav 6.1.1: Risikobasert tilnærming
- ✅ Krav 6.1.2: Risikoer og muligheter

### 2.3 Avvikshåndtering (ISO 9001: Krav 10.2)
- **Hendelsestyper:**
  - AVVIK (Non-conformity)
  - NESTEN (Near-miss)
  - SKADE (Injury)
  - MILJO (Environmental)
  - KVALITET (Quality)
  - SIKKERHET (Security incident)
  - KLAGE (Customer complaint)
- **Rotårsaksanalyse:**
  - 5 Whys metode
  - Fiskebein-diagram (Ishikawa)
  - Fritekstoversikt
- **Korrigerende tiltak (CAPA):**
  - Ansvarlig person
  - Forfallsdato
  - Status (PENDING, IN_PROGRESS, DONE, OVERDUE)
- **Alvorlighetsgrad:** 1-5 skala
- **Vedlegg:** Bilder og dokumenter
- **Varslingsflyt:** Automatisk varsling til ansvarlige
- **Trend-analyse:** Dashboard med statistikk

**ISO 9001 Samsvar:**
- ✅ Krav 10.2.1: Korrigerende tiltak ved avvik
- ✅ Krav 10.2.2: Dokumentere resultater av korrigerende tiltak

### 2.4 Internrevisjon (ISO 9001: Krav 9.2)
- **Revisjonsplan:** Årlig revisjonsplan
- **Revisjonstyper:**
  - ISO_9001 (Kvalitet)
  - ISO_14001 (Miljø)
  - ISO_45001 (HMS)
  - ISO_27001 (Informasjonssikkerhet)
  - INTERNAL (Intern)
  - SUPPLIER (Leverandør)
- **Revisjonsscope:** Definér hvilke prosesser som skal revideres
- **Funn (Findings):**
  - MAJOR_NC (Større avvik)
  - MINOR_NC (Mindre avvik)
  - OBSERVATION (Observasjon)
  - IMPROVEMENT (Forbedringsforslag)
- **Tiltak-sporing:** Automatisk oppfølging av tiltak fra revisjoner
- **Rapportgenerering:** PDF-rapport av revisjon
- **27 ISO-klausuler:** Dekker alle ISO 9001, 14001, 45001 klausuler
- **Risiko-kobling:** Koble revisjonsfunn til risiko-registeret

**ISO 9001 Samsvar:**
- ✅ Krav 9.2.1: Internrevisjon planlagt og gjennomført
- ✅ Krav 9.2.2: Revisjonsresultater rapporteres til ledelsen

### 2.5 Ledelsens Gjennomgang (ISO 9001: Krav 9.3)
- **Møteprotokoll:** Digital protokoll med deltagere
- **Agenda-punkter:**
  - Status på tiltak fra forrige gjennomgang
  - Endringer i interne/eksterne forhold
  - Informasjon om ytelse og effektivitet
  - Tilfredsheten til kunden
  - Grad av måloppnåelse
  - Trender for avvik og korrigerende tiltak
  - Overvåkings- og målingsresultater
  - Revisjonsresultater
  - Tilbakemeldinger fra eksterne parter
  - Egnetheten av ressurser
  - Effektiviteten av tiltak for risikoer og muligheter
  - Muligheter for forbedring
- **Beslutninger:** Dokumentasjon av beslutninger
- **KPI-oversikt:** Automatisk henting av nøkkeltall
- **Trend-analyse:** Historiske data over tid
- **Ansvarlige:** Tildel oppfølgingsansvar for beslutninger
- **Neste møte:** Planlegg neste gjennomgang

**ISO 9001 Samsvar:**
- ✅ Krav 9.3.1: Ledelsens gjennomgang gjennomføres
- ✅ Krav 9.3.2: Input til ledelsens gjennomgang
- ✅ Krav 9.3.3: Output fra ledelsens gjennomgang

### 2.6 Mål og KPI-sporing (ISO 9001: Krav 6.2)
- **Måltyper:**
  - QUALITY (Kvalitet)
  - ENVIRONMENT (Miljø)
  - SAFETY (Sikkerhet)
  - FINANCIAL (Økonomi)
  - CUSTOMER (Kundetilfredshet)
  - EMPLOYEE (Medarbeidertilfredshet)
- **Måleparametere:**
  - Måltall (target value)
  - Faktisk verdi (actual value)
  - Status (ON_TRACK, AT_RISK, OFF_TRACK, ACHIEVED, ABANDONED)
- **KPI-målinger:** Månedlige/kvartalsvise målinger
- **Dashboard:** Visuell fremstilling av KPI-er
- **Trend-analyse:** Grafer og trendlinjer
- **Ansvarlig:** Eier av mål
- **Rapporter:** Export til Excel/PDF

**ISO 9001 Samsvar:**
- ✅ Krav 6.2.1: Kvalitetsmål etableres
- ✅ Krav 6.2.2: Planlegging for å oppnå kvalitetsmål

### 2.7 Kompetansestyring (ISO 9001: Krav 7.2)
- **Opplæringsmatrise:** Oversikt over nødvendig kompetanse per rolle
- **Kurskatalog:** Egendefinerte kurs og standardkurs
- **Kurspåmelding:** Digital påmelding og godkjenning
- **Kursgjennomføring:** Registrering av gjennomførte kurs
- **Sertifikater:** Lagring av kursbevis
- **Gyldighetskontroll:** Automatisk varsling om utløpende sertifikater
- **Kompetansebehov:** Identifiser kompetansegap
- **Historikk:** Full oversikt over alle gjennomførte kurs per person
- **E-læring:** Støtte for digitale kurs

**ISO 9001 Samsvar:**
- ✅ Krav 7.2: Kompetanse sikres og vedlikeholdes
- ✅ Krav 7.3: Bevissthet om kvalitetspolitikk og relevante mål

### 2.8 Kundeklager (ISO 9001: Krav 9.1.2)
- **Klageflyt:** Digital registrering av kundeklager
- **Kategorisering:**
  - Produktkvalitet
  - Leveranse
  - Service
  - Fakturering
  - Annet
- **Alvorlighetsgrad:** 1-5 skala
- **Behandlingsansvarlig:** Tildel klage til ansvarlig person
- **Rotårsaksanalyse:** 5 Whys, Ishikawa
- **Korrigerende tiltak:** CAPA-flyt
- **Kunde-feedback:** Registrering av kundetilfredshet
- **Rapporter:** Klageoversikt og trender

**ISO 9001 Samsvar:**
- ✅ Krav 9.1.2: Kundetilfredshet overvåkes
- ✅ Krav 10.2: Håndtering av avvik inkl. kundeklager

### 2.9 Tiltaksplan (ISO 9001: Krav 6.1, 10.2)
- **Sentral tiltaksplan:** Samler alle tiltak fra:
  - Risikovurderinger
  - Avvik
  - Revisjoner
  - Mål
  - Ledelsens gjennomgang
  - Vernerunder
- **Status:** PENDING, IN_PROGRESS, DONE, OVERDUE
- **Ansvarlig:** Tildel til person
- **Forfallsdato:** Med automatisk varsling
- **Prioritering:** Høy, middels, lav
- **Kanban-visning:** Visuell oversikt
- **Gantt-diagram:** Tidsplan
- **Filtrering:** Etter status, ansvarlig, forfallsdato

**ISO 9001 Samsvar:**
- ✅ Krav 6.1.2: Tiltak for å adressere risikoer og muligheter
- ✅ Krav 10.2.1: Korrigerende tiltak dokumenteres

---

## 3. ISO 14001 - Miljøledelse

### 3.1 Miljøaspekter (ISO 14001: Krav 6.1.2)
- **Aspektregister:** Oversikt over alle miljøaspekter
- **Typer:**
  - UTSLIPP_LUFT (Luftutslipp)
  - UTSLIPP_VANN (Vannforurensning)
  - AVFALL (Avfallshåndtering)
  - ENERGI (Energibruk)
  - RESSURS (Ressursbruk)
  - STØY (Støyforurensning)
  - KJEMIKALIER (Kjemikaliehåndtering)
  - ANDRE (Annet)
- **Vurdering:**
  - Alvorlighetsgrad (1-5)
  - Sannsynlighet for å oppstå (1-5)
  - Miljøpåvirkning (1-5)
  - Juridisk compliance
- **Signifikans:** Automatisk beregning av signifikante aspekter
- **Tiltak:** Korrigerende og forebyggende tiltak
- **Ansvarlig:** Eier av miljøaspektet
- **Overvåking:** Planlagt overvåking av aspektet
- **Revisjon:** Årlig gjennomgang

**ISO 14001 Samsvar:**
- ✅ Krav 6.1.2: Miljøaspekter identifiseres og evalueres
- ✅ Krav 6.1.2: Signifikante miljøaspekter dokumenteres

### 3.2 Miljømål og -program (ISO 14001: Krav 6.2)
- **Miljømål:** Spesifikke mål for miljøforbedring
- **Måleparametere:**
  - Reduksjon av energiforbruk (%)
  - Reduksjon av avfall (kg/tonn)
  - Reduksjon av CO2-utslipp (tonn)
  - Øke resirkuleringsgrad (%)
  - Redusere vannforbruk (liter)
- **Handlingsplaner:** Hva skal gjøres for å nå målet
- **Ansvarlig:** Eier av miljømålet
- **Tidslinje:** Start- og sluttdato
- **Framdriftsrapportering:** Månedsvis oppdatering
- **KPI-dashboard:** Visuell fremstilling

**ISO 14001 Samsvar:**
- ✅ Krav 6.2.1: Miljømål etableres
- ✅ Krav 6.2.2: Planlegging for å oppnå miljømål

### 3.3 Overvåkingsprogram (ISO 14001: Krav 9.1.1)
- **Målepunkter:** Definer hva som skal måles
- **Målefrekvens:** Daglig, ukentlig, månedlig, kvartalsvis
- **Målemetode:** Beskrivelse av hvordan det måles
- **Grenseverdier:** Øvre og nedre grenser
- **Automatisk varsling:** Ved overskridelse av grenseverdier
- **Måledata:** Historikk av alle målinger
- **Trend-analyse:** Grafer og rapporter
- **Eksport:** Excel/PDF-rapporter

**ISO 14001 Samsvar:**
- ✅ Krav 9.1.1: Overvåkning, måling, analyse og evaluering

### 3.4 Miljørapportering
- **Miljøregnskap:** Årlig miljøregnskap
- **Nøkkeltall:**
  - Energiforbruk (kWh)
  - Vannforbruk (m³)
  - Avfallsmengde (kg)
  - Resirkuleringsgrad (%)
  - CO2-utslipp (tonn)
- **Benchmarking:** Sammenlign med tidligere år
- **Miljøfyrtårn:** Rapportering tilpasset Miljøfyrtårn-krav
- **Export:** PDF-rapporter for ekstern rapportering

**Miljøfyrtårn Samsvar:**
- ✅ Bransjekriterier for avfall, energi, transport, innkjøp
- ✅ Årlig miljøregnskap
- ✅ Handlingsplan for miljøforbedring

### 3.5 Stoffkartotek (ISO 14001: Krav 8.1)
- **Kjemikalieregister:** Oversikt over alle kjemikalier
- **Sikkerhetsdatablad:** Lagring av SDS
- **UN-piktogrammer:** Visuelle faresymboler
- **H- og P-setninger:** Fare- og forsiktighetsetninger
- **Risikovurdering:** Kjemisk risiko
- **Verneutstyr:** Nødvendig PPE
- **Mengde:** Lagerbeholdning
- **Lokasjon:** Hvor kjemikaliet er lagret
- **Eksponeringsgrenser:** Grenseverdier
- **Substitusjon:** Identifiser tryggere alternativer

**ISO 14001 Samsvar:**
- ✅ Krav 8.1: Operasjonell kontroll av miljøaspekter
- ✅ Krav 6.1.4: Nødvendig dokumentasjon om miljøaspekter

---

## 4. ISO 45001 - Arbeidsmiljøledelse

### 4.1 Vernerunder (ISO 45001: Krav 9.1.2)
- **Inspeksjonsmaler:** Forhåndsdefinerte sjekklister
- **Områder:**
  - Arbeidsplass
  - Maskineri og utstyr
  - Kjemikalier
  - Ergonomi
  - Psykososialt arbeidsmiljø
  - Brannsikkerhet
  - Elektrisk sikkerhet
  - Støy og vibrasjoner
- **Gjennomføring:**
  - Mobilvennlig (offline-støtte)
  - Ta bilder av avvik
  - Digital signatur
- **Funn:**
  - Alvorlighetsgrad (1-5)
  - Ansvarlig for utbedring
  - Forfallsdato
  - Status (Åpen/Lukket)
- **Oppfølging:** Automatisk varsling til ansvarlige
- **Rapporter:** PDF-rapport av vernerunde
- **Historikk:** Alle tidligere vernerunder

**ISO 45001 Samsvar:**
- ✅ Krav 9.1.2: Overvåking av arbeidsmiljø
- ✅ Krav 9.1.1: Systematisk vurdering av arbeidsmiljø

### 4.2 HMS-møter (ISO 45001: Krav 5.4)
- **Møtetyper:**
  - AMU (Arbeidsmiljøutvalg)
  - Verneombud
  - HMS-forum
  - Toolbox-møter
  - Sikkerhetsmøter
- **Møteprotokoll:**
  - Deltagere
  - Agenda
  - Referat
  - Beslutninger
  - Tiltak
- **Digital signatur:** Godkjenn protokoll
- **Distribuering:** Automatisk e-post til deltagere
- **Tiltak-oppfølging:** Koble til tiltaksplan
- **Historikk:** Arkiv av alle møter

**ISO 45001 Samsvar:**
- ✅ Krav 5.4: Konsultasjon og medvirkning av arbeidstakere
- ✅ Krav 9.3: Ledelsens gjennomgang

### 4.3 Skade- og ulykkesregistrering (ISO 45001: Krav 10.2)
- **Hendelsestyper:**
  - Arbeidsulykke
  - Nesten-ulykke
  - Helseskade
  - Yrkessykdom
  - Farlig situasjon
- **Skadegrad:**
  - Bagatellskade
  - Førstehjelp
  - Behandling
  - Fravær
  - Varig mén
  - Dødsfall
- **Skadetall:**
  - H-verdi (LTIF)
  - TRI (Total Recordable Incidents)
  - Fraværsdager
  - Frekvens
- **Rotårsaksanalyse:** 5 Whys, Ishikawa
- **Tiltak:** CAPA-flyt
- **Varsling:** Automatisk til Arbeidstilsynet (ved alvorlige hendelser)
- **Statistikk:** Dashboard med trender

**ISO 45001 Samsvar:**
- ✅ Krav 10.2: Hendelser, avvik og korrigerende tiltak
- ✅ Krav 9.1.1: Overvåking av HMS-ytelse

### 4.4 Psykososialt arbeidsmiljø (ISO 45003)
- **Wellbeing-undersøkelser:**
  - Stress-kartlegging
  - Belastning og arbeidstid
  - Mobbing og trakassering
  - Lederstøtte
  - Kollegialt samarbeid
- **Skjemabygger:** Lag egne undersøkelser
- **Anonym innrapportering:** Varslingskanal
- **Analyse:** Trender og risikoområder
- **Tiltak:** Handlingsplan basert på resultater
- **Oppfølging:** Gjentakende målinger

**ISO 45003 Samsvar:**
- ✅ Krav: Psykososiale risikoer identifiseres og håndteres
- ✅ Krav: Systematisk overvåking av arbeidsmiljøet

### 4.5 BHT-integrasjon (ISO 45001: Krav 8.1.2)
- **BHT-avtale:** Registrer leverandør
- **Tjenester:**
  - Helseundersøkelser
  - Risikovurderinger
  - Tilrettelegging
  - Oppfølging av sykmeldte
- **Bestilling:** Digital bestilling av BHT-tjenester
- **Rapporter:** Mottak av BHT-rapporter
- **Tiltak:** Koble BHT-anbefalinger til tiltaksplan
- **Integrasjon:** Dr. Dropin API (pilotprosjekt)

**ISO 45001 Samsvar:**
- ✅ Krav 8.1.2: Eliminere farer og redusere HMS-risikoer

---

## 5. ISO 27001 - Informasjonssikkerhet

### 5.1 ISMS-dokumentasjon (ISO 27001: Krav 7.5)
- **Styringsdokumenter:**
  - Informasjonssikkerhetspolicy
  - Risikovurderingsmetodikk
  - Behandling av risikoer
  - Erklæring om anvendelighet (SoA)
- **Prosedyrer:**
  - Tilgangskontroll
  - Endringshåndtering
  - Sikkerhetskopiering
  - Incident response
  - Business continuity
  - Leverandørstyring
- **Registre:**
  - Informasjonsressurser (asset register)
  - Risikoregister
  - Hendelseslogg
  - Tilgangslogg

**ISO 27001 Samsvar:**
- ✅ Krav 7.5: Dokumentert informasjon

### 5.2 Informasjonsressurser (ISO 27001: Krav 8.1)
- **Asset Register:**
  - Servere
  - Datamaskiner
  - Mobile enheter
  - Programvare
  - Databaser
  - Nettverk
  - Skybaserte tjenester
- **Klassifisering:**
  - OFFENTLIG (Public)
  - INTERN (Internal)
  - KONFIDENSIELL (Confidential)
  - STRENGT_KONFIDENSIELL (Strictly Confidential)
- **Eier:** Ansvarlig for ressursen
- **Lokasjon:** Fysisk/logisk plassering
- **Verdi:** Økonomisk/strategisk verdi
- **CIA-vurdering:**
  - Confidentiality (Konfidensialitet)
  - Integrity (Integritet)
  - Availability (Tilgjengelighet)

**ISO 27001 Samsvar:**
- ✅ Krav 8.1: Operasjonell planlegging og kontroll
- ✅ Annex A 5.9: Inventar av informasjonsressurser

### 5.3 Sikkerhetskontroller (ISO 27001: Annex A)
- **Kontrollbibliotek:** Alle 93 Annex A kontroller
- **Organisering:**
  - A.5: Organisatoriske kontroller (37 kontroller)
  - A.6: People controls (8 kontroller)
  - A.7: Fysiske kontroller (14 kontroller)
  - A.8: Teknologiske kontroller (34 kontroller)
- **Status:**
  - NOT_APPLICABLE
  - PLANNED
  - IMPLEMENTED
  - TESTED
  - COMPLIANT
  - NON_COMPLIANT
- **Evidens:** Dokumenter som beviser implementering
- **Ansvarlig:** Eier av kontrollen
- **Testing:** Testfrekvens og siste test
- **Gap-analyse:** Identifiser mangler

**ISO 27001 Samsvar:**
- ✅ Krav 6.1.3: Informasjonssikkerhet risikovurdering
- ✅ Annex A: Referansekontroller (2022 versjon)

### 5.4 Tilgangsattestering (ISO 27001: A.5.18)
- **Access Review:**
  - Brukertilganger gjennomgås
  - Rolle-basert tilgang (RBAC)
  - Privilegerte kontoer
  - Fjerne unødvendige tilganger
- **Attestasjonsperiode:** Kvartalsvis/halvårlig
- **Godkjenningsflyt:**
  - Brukerens leder godkjenner
  - Systemansvarlig godkjenner
  - Audit trail
- **Rapporter:** Oversikt over tilganger
- **Automatisering:** Påminnelser til eiere

**ISO 27001 Samsvar:**
- ✅ Annex A 5.18: Tilgangsrettigheter
- ✅ Annex A 5.15: Tilgangskontroll

### 5.5 Sikkerhetshendelser (ISO 27001: Krav 6.1.3)
- **Hendelsestyper:**
  - Datainnbrudd
  - Phishing-angrep
  - Malware
  - Tyveri av utstyr
  - Uautorisert tilgang
  - Datainnbrudd
  - Tap av data
- **Alvorlighetsgrad:** 1-5 skala
- **Incident Response:**
  - Identifisering
  - Inneslutning
  - Utredning
  - Utbedring
  - Læring
- **Rapportering:** Personvernombud, Datatilsynet
- **Tiltak:** CAPA-flyt
- **Forensics:** Sikring av bevis

**ISO 27001 Samsvar:**
- ✅ Annex A 5.24: Planlegging og forberedelse av hendelseshåndtering
- ✅ Annex A 5.25: Vurdering og beslutning om informasjonssikkerhetshendelser
- ✅ Annex A 5.26: Respons på informasjonssikkerhetshendelser

### 5.6 Kontinuitetsplanlegging (ISO 22301)
- **BCM-planer:** Business Continuity Management
- **Komponenter:**
  - Forretningspåvirkningsanalyse (BIA)
  - Recovery Time Objective (RTO)
  - Recovery Point Objective (RPO)
  - Krisehåndteringsplan
  - Kommunikasjonsplan
  - Gjenopprettingsplan
- **Øvelser:** Planlagte BCM-øvelser
- **Testing:** Årlig testing av planer
- **Oppdatering:** Kontinuerlig oppdatering

**ISO 22301 Samsvar:**
- ✅ Krav 8.2: Forretningspåvirkningsanalyse og risikovurdering
- ✅ Krav 8.3: Kontinuitetsstrategi
- ✅ Krav 8.4: Etablere og implementere prosedyrer

---

## 6. ISO 31000 - Risikostyring

### 6.1 Enterprise Risk Register
- **Risikokategorier:**
  - Strategiske risikoer
  - Operasjonelle risikoer
  - Finansielle risikoer
  - Regulatoriske risikoer
  - Omdømmerisikoer
  - Teknologiske risikoer
  - Miljørisikoer
  - HMS-risikoer
  - Sikkerhetrisikoer
- **Risikovurdering:**
  - Inherent risk (før tiltak)
  - Residual risk (etter tiltak)
  - Target risk (ønsket risikonivå)
- **Risikoeier:** Ansvarlig for risiko
- **Risikoappetitt:** Akseptabelt risikonivå
- **Risikotoleranse:** Grenser for akseptabel risiko

**ISO 31000 Samsvar:**
- ✅ Krav: Risikostyring integrert i alle organisasjonsprosesser
- ✅ Krav: Risikostyring tilpasset organisasjonen

### 6.2 Risikokontroller
- **Kontrolltyper:**
  - Preventive (Forebyggende)
  - Detective (Oppdagende)
  - Corrective (Korrigerende)
  - Directive (Styrende)
  - Compensating (Kompenserende)
- **Kontrolltiltak:**
  - Beskrivelse
  - Ansvarlig
  - Frekvens
  - Testing
  - Effektivitet
- **Evidens:** Dokumentasjon av kontroller
- **Revisjon:** Regelmessig gjennomgang

**ISO 31000 Samsvar:**
- ✅ Krav: Risikokontroller etableres og overvåkes
- ✅ Krav: Kontinuerlig forbedring av risikostyring

### 6.3 Risiko-links
- **Dokumenter:** Koble risiko til styringsdokumenter
- **Revisjoner:** Koble risiko til revisjoner
- **Mål:** Koble risiko til KPI-er
- **Hendelser:** Koble risiko til inntrufne hendelser
- **Inspeksjoner:** Koble risiko til vernerunder

**ISO 31000 Samsvar:**
- ✅ Krav: Integrert risikostyring på tvers av organisasjonen

---

## 7. Støttestandarder

### 7.1 Digital Skjemabygger
- **Funksjon:** Drag-and-drop skjemabygger
- **Felttyper:**
  - Tekst (kort/lang)
  - Tall
  - Dato/tid
  - Avkrysning
  - Flervalg (radio/checkbox)
  - Dropdown
  - Filopplasting
  - Digital signatur
  - Tabeller
  - Seksjoner
- **Betinget logikk:** Vis felt X hvis felt Y = "Ja"
- **Validering:** Påkrevde felt, min/max-verdier
- **Gjentakende skjemaer:**
  - HMS morgenmøte (daglig)
  - Ukerapport
  - Månedlig inspeksjon
- **Kladd-funksjon:** Lagre underveis
- **Signatur:** Digital signatur ved innsending
- **Export:** PDF med logo og signaturer
- **Rapporter:** Excel-eksport for analyse

**Bruksområder:**
- Arbeidstillatelser (Hot work permit)
- Risikovurderingsskjemaer
- Sjekklister
- Morgenmøter
- Tilfredshet-undersøkelser
- Egenerklæringer

### 7.2 Varslingskanal (ISO 37002)
- **Anonym varsling:** Whistleblowing-kanal
- **Kategorier:**
  - Økonomisk misligheter
  - Korrupsjon
  - Arbeidsmiljø
  - Diskriminering
  - Trakassering
  - Regelverksbrudd
- **Behandlingsflyt:**
  - Mottatt
  - Under vurdering
  - Etterforskes
  - Avsluttet
- **Konfidensialitet:** Anonym eller identifiserbar
- **Saksbehandler:** Tildel til ansvarlig
- **Tiltak:** CAPA-flyt
- **Rapporter:** Varslingsstatistikk

**ISO 37002 Samsvar:**
- ✅ Krav: Etablere og vedlikeholde varslingskanal
- ✅ Krav: Sikre konfidensialitet

### 7.3 Dashboards & Rapporter
- **KPI-dashboard:**
  - Åpne avvik
  - H-verdi (LTIF)
  - Tiltak overdue
  - % gjennomførte kurs
  - Risikoexposure
  - Miljønøkkeltall
  - Sikkerhetshendelser
  - Compliance-status
- **Widgets:**
  - Statistikk-kort
  - Trendgrafer
  - Kakediagrammer
  - Tabeller
  - Varslinger
- **Filtrering:** Dato, avdeling, kategori
- **Export:** PDF/Excel/CSV

### 7.4 Audit Log
- **Hendelser:**
  - Login/logout
  - Dokumentgodkjenning
  - Sletting av data
  - Endring av kritiske innstillinger
  - Tilgangsstyring
- **Informasjon:**
  - Hvem (User ID, navn)
  - Hva (Action type)
  - Når (Timestamp)
  - Hvor (IP-adresse, user agent)
  - Kontekst (Object, Old/new values)
- **Søk og filtrering:** Finn spesifikke hendelser
- **Export:** Excel/CSV for compliance
- **Retention:** 7 års lagring

---

## 8. Teknisk infrastruktur

### 8.1 Frontend
- **Framework:** Next.js 15 (App Router)
- **UI:** React 18, TypeScript, Tailwind CSS 4
- **Komponenter:** shadcn/ui designsystem
- **State management:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod validering
- **Internasjonalisering:** next-intl (nb/nn/en)

### 8.2 Backend
- **API:** Next.js Server Actions (type-safe)
- **Database:** MySQL 8 (InnoDB)
- **ORM:** Prisma (type-safe queries)
- **Auth:** NextAuth v4 (bcrypt, sessions)
- **RBAC:** CASL (attribute-based access control)
- **SSO:** Azure AD / Microsoft 365 (OAuth 2.0)

### 8.3 Filer & Dokumenter
- **Storage:** Cloudflare R2 (S3-compatible)
- **Upload:** UploadThing
- **PDF-generering:** Playwright / Puppeteer
- **Bilder:** Next.js Image optimization

### 8.4 E-post & Varsling
- **E-post:** Resend API (transaksjoner)
- **Templates:** React Email components
- **Scheduling:** BullMQ + Redis (køer)
- **SMS:** Twilio (planlagt)

### 8.5 Sikkerhet
- **HTTPS:** SSL/TLS sertifikater
- **CSRF:** Built-in Next.js protection
- **Rate limiting:** Upstash Ratelimit
- **Input validation:** Zod schemas på alle server actions
- **SQL injection:** Prisma ORM (parametriserte queries)
- **XSS:** React auto-escaping
- **Account lockout:** Max 5 feiede innloggingsforsøk
- **Password hashing:** bcrypt (10 rounds)
- **Session management:** Secure, HttpOnly cookies

### 8.6 Performance
- **Caching:** Next.js ISR (Incremental Static Regeneration)
- **CDN:** Cloudflare (global)
- **Database indexing:** Optimaliserte Prisma indexes
- **Lazy loading:** Next.js dynamic imports
- **Image optimization:** WebP, responsive sizes

### 8.7 Overvåking & Logging
- **Application logs:** Winston logger
- **Error tracking:** Sentry (planlagt)
- **Uptime monitoring:** Better Uptime
- **Analytics:** Plausible Analytics (GDPR-compliant)

### 8.8 Backup & Disaster Recovery
- **Database backup:** Daglig backup til S3
- **File backup:** Cloudflare R2 replication
- **Retention:** 30 dager rolling backup
- **RTO:** < 4 timer
- **RPO:** < 24 timer

---

## 9. Integrasjoner

### 9.1 Fiken (Regnskapssystem)
- **Funksjon:** Automatisk fakturering
- **Synkronisering:**
  - Kunde-import fra Fiken
  - Faktura-generering
  - Betalingsstatus
- **Status:** Implementert

### 9.2 Microsoft 365 / Azure AD
- **Funksjon:** Single Sign-On (SSO)
- **Synkronisering:**
  - Auto-provisioning av brukere
  - Rolle-mapping
  - Gruppemedlemskap
- **Status:** Implementert (per-tenant)

### 9.3 Dr. Dropin (BHT)
- **Funksjon:** Bestilling av BHT-tjenester
- **API:** REST API
- **Status:** Pilot

### 9.4 Fremtidige integrasjoner (Roadmap)
- **Altinn:** Rapportering til myndigheter
- **HMS-kort API:** Automatisk kursbevis-import
- **EcoOnline:** SDS-import
- **Powerlog:** IoT sensorer → Avvik
- **Stripe:** SaaS-fakturering
- **BankID:** Digital signatur
- **Microsoft Teams:** Varslinger
- **Slack:** Varslinger

---

## 10. Oppsummering: ISO-compliance matrix

| Standard | Dekningsgrad | Nøkkelfunksjoner |
|----------|-------------|------------------|
| **ISO 9001:2015** | ✅ 100% | Dokumenthåndtering, Risikovurdering, Avvik & CAPA, Internrevisjon, Ledelsens gjennomgang, KPI-sporing, Kompetanse |
| **ISO 14001:2015** | ✅ 100% | Miljøaspekter, Miljømål, Overvåkingsprogram, Miljørapportering, Stoffkartotek |
| **ISO 45001:2018** | ✅ 100% | Vernerunder, HMS-møter, Skaderegistrering, Psykososialt arbeidsmiljø, BHT |
| **ISO 27001:2022** | ✅ 100% | ISMS-dokumentasjon, Asset Register, Annex A kontroller (93), Tilgangsattestering, Sikkerhetshendelser |
| **ISO 31000:2018** | ✅ 100% | Enterprise Risk Register, Risikokontroller, Risiko-links |
| **ISO 22301:2019** | ✅ 80% | BCM-planer, BIA, Øvelser (krever mer utvikling) |
| **ISO 45003:2021** | ✅ 90% | Psykososiale skjemaer, Wellbeing-undersøkelser |
| **ISO 37002:2021** | ✅ 100% | Varslingskanal (Whistleblowing) |
| **ISO 10002:2018** | ✅ 100% | Kundeklager, Feedback-håndtering |
| **Miljøfyrtårn** | ✅ 100% | Miljøregnskap, Bransjekriterier, Handlingsplan |

---

## 11. Lisens og support

### 11.1 Prising (per tenant/bedrift)
- **Uten binding:** 300 kr/mnd
- **1 års binding:** 275 kr/mnd (spar 300 kr/år)
- **2 års binding:** 225 kr/mnd (spar 900 kr/år)

**Inkludert:**
- ✅ Ubegrenset antall brukere
- ✅ Alle funksjoner (ISO 9001, 14001, 45001, 27001, 31000)
- ✅ Digital signatur
- ✅ Mobilapp (iOS/Android)
- ✅ Norsk kundesupport
- ✅ Automatiske oppdateringer
- ✅ Backup & sikkerhet
- ✅ 50+ HMS-maler og dokumenter

### 11.2 Implementering
- **Selvbetjening:** 0 kr (bruk HMS-dokumentgeneratoren)
- **Assistert oppsett:** 6.900 kr (4 timer support)
- **Full implementering:** 19.900 kr (komplett oppsett + opplæring)

### 11.3 Support
- **E-post:** support@hmsnova.no
- **Telefon:** +47 99 11 29 16 (man-fre 08-16)
- **Responstid:** < 24 timer
- **Dokumentasjon:** Komplett brukerhåndbok + videoer

---

## 12. Kontaktinformasjon

**Firmanavn:** KKS AS  
**Org.nr:** [Ditt org.nr]  
**Adresse:** [Din adresse]  

**Kontaktperson:** Kenneth Kristiansen  
**Rolle:** Grunnlegger / CEO  
**E-post:** kenneth@hmsnova.no  
**Telefon:** +47 99 11 29 16  
**Nettside:** https://hmsnova.no

---

## 13. Vedlegg

### 13.1 Skjermbilder
- Dashboard med KPI-oversikt
- Risikovurdering 5x5 matrise
- Avvikshåndtering med CAPA
- Dokumenthåndtering med versjonskontroll
- Internrevisjon-modul
- Miljøaspekt-registrering
- Vernerunde på mobil
- Digital skjemabygger

### 13.2 Teknisk dokumentasjon
- API-dokumentasjon
- Database-schema (Prisma)
- Sikkerhetsdokumentasjon
- Backup & disaster recovery plan

### 13.3 Compliance-dokumenter
- GDPR-dokumentasjon
- Personvernerklæring
- Databehandleravtale (DPA)
- Sikkerhetserklæring

---

**Dokumentet er utarbeidet for å understøtte søknader om offentlige midler til ISO-sertifisering og Miljøfyrtårn-tilknytning.**

**Sist oppdatert:** 2026-01-16  
**Versjon:** 2.0

