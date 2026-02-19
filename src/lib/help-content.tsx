import { HelpContent } from "@/components/dashboard/page-help-dialog";

export const helpContent: Record<string, HelpContent> = {
  documents: {
    title: "Dokumentstyring",
    description: "Slik bruker du dokumentmodulen for å bygge ditt kvalitetssikringssystem",
    sections: [
      {
        heading: "Hva er dokumentstyring?",
        emoji: "📚",
        content:
          "Dokumenter er selve grunnmuren i ditt HMS- og kvalitetssystem. Her lagrer du alle styrende dokumenter som bestemmer hvordan du skal jobbe: policyer, prosedyrer, arbeidsinstrukser, sjekklister og maler. Dette er kvalitetssikringssystemet ditt.",
      },
      {
        heading: "Hvorfor trenger du dette?",
        emoji: "🎯",
        items: [
          {
            title: "Konsistent arbeidsmetodikk",
            description:
              "Sikrer at alle i organisasjonen jobber på samme måte og følger samme standarder.",
          },
          {
            title: "Sporbarhet og revisjon",
            description:
              "Dokumenterer hva som er gjort, når og av hvem. Viktig for internkontroll og eksterne revisjoner.",
          },
          {
            title: "Kompetanseoverføring",
            description:
              "Nye medarbeidere kan raskt lære seg riktig fremgangsmåte ved å lese dokumentene.",
          },
          {
            title: "ISO-krav oppfylt",
            description:
              "Alle ISO-standarder krever dokumentert styringssystem med kontrollerte prosesser.",
          },
        ],
      },
      {
        heading: "Hvordan bruke modulen?",
        emoji: "🔧",
        items: [
          {
            title: "1. Start med maler",
            description:
              "Bruk ferdiglagde maler for å komme raskt i gang med prosedyrer, instrukser og policyer.",
          },
          {
            title: "2. Versjonshåndtering",
            description:
              "Systemet sporer automatisk alle versjoner. Du kan alltid gå tilbake til tidligere versjoner.",
          },
          {
            title: "3. Godkjenningsflyt",
            description:
              "Send dokumenter til godkjenning før de aktiveres. Dette sikrer kvalitet og etterlevelse.",
          },
          {
            title: "4. Regelmessig gjennomgang",
            description:
              "Sett opp påminnelser for revisjoner. Dokumenter skal gjennomgås minimum årlig.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 9001 (Kvalitet): Krav 7.5 - Dokumentert informasjon",
      "ISO 14001 (Miljø): Krav 7.5 - Dokumenterte miljøprosedyrer",
      "ISO 45001 (HMS): Krav 7.5 - Dokumenterte HMS-prosedyrer",
      "ISO 27001 (IT-sikkerhet): Krav 7.5 - ISMS-dokumentasjon",
    ],
    tips: [
      "Start med å lage en dokumenthierarki: Policy → Prosedyre → Instruksjon",
      "Bruk klart og enkelt språk som alle i organisasjonen forstår",
      "Koble dokumenter til risikoer, mål og tiltak for helhetlig oversikt",
      "Sett eier og revisjonsintervall på hvert dokument",
      "Tren medarbeidere i nye og oppdaterte prosedyrer",
    ],
  },

  legalRegister: {
    title: "Juridisk register",
    description: "Oversikt over lover og forskrifter som gjelder for virksomheten din basert på bransje",
    sections: [
      {
        heading: "Hva vises her?",
        emoji: "📋",
        content:
          "Listen viser lover og forskrifter som er relevante for din bransje. Lenkene åpner Lovdata.no eller Arbeidstilsynet der du kan lese fullstendig lovtekst.",
      },
      {
        heading: "Viktig om juridisk ansvar",
        emoji: "⚠️",
        content:
          "Dette er en oversikt og veiledning. Systemet utgjør ikke juridisk rådgivning. For spesifikke spørsmål om lover og forskrifter, rådfør deg med jurist eller sjekk Lovdata.no.",
      },
    ],
  },

  risks: {
    title: "Risikostyring",
    description: "Identifiser, vurder og håndter risikoer i din organisasjon",
    sections: [
      {
        heading: "Hva er risikostyring?",
        emoji: "⚠️",
        content:
          "Risikostyring handler om å identifisere hva som kan gå galt, vurdere hvor alvorlig det kan være, og sette inn tiltak for å forebygge eller redusere konsekvensene. Dette gjelder alt fra arbeidsulykker til miljøskader og forretningsrisiko.",
      },
      {
        heading: "Skal tiltak i en risikovurdering lukkes?",
        emoji: "1️⃣",
        content:
          "Ja. Tiltak som opprettes i en risikovurdering skal følges opp og lukkes når de er gjennomført og verifisert (ISO 45001 kap. 6.1 og 8.1, ISO 9001 kap. 6.1). Kravet er: Identifiser risiko → vurder risiko → planlegg tiltak → gjennomfør tiltak → evaluer effekt. Hvis tiltak ikke lukkes, kan du ikke dokumentere at risikoen er redusert.",
        items: [
          {
            title: "Riktig praksis i HMS Nova",
            description:
              "1) Risiko registreres. 2) Tiltak opprettes med ansvarlig og frist. 3) Tiltaket gjennomføres. 4) Risiko revurderes. 5) Tiltaket settes til lukket. 6) Effekt dokumenteres. Tiltaket lukkes – selve risikovurderingen lukkes ikke, den revideres.",
          },
        ],
      },
      {
        heading: "Hvorfor er det viktig?",
        emoji: "🛡️",
        items: [
          {
            title: "Forebygge skader og tap",
            description:
              "Reduserer sannsynligheten for ulykker, miljøhendelser og økonomisk tap.",
          },
          {
            title: "Lovpålagt",
            description:
              "Arbeidsmiljøloven og HMS-forskriften krever systematisk risikostyring.",
          },
          {
            title: "ISO-krav",
            description:
              "Alle relevante ISO-standarder krever strukturert risikohåndtering.",
          },
          {
            title: "Bedre beslutninger",
            description:
              "Hjelper ledelsen å ta informerte beslutninger om ressursbruk og prioriteringer.",
          },
        ],
      },
      {
        heading: "Slik jobber du med risikoer",
        emoji: "📊",
        items: [
          {
            title: "1. Identifiser risikoer",
            description:
              "Kartlegg alle potensielle farer: fysiske, kjemiske, ergonomiske, psykososiale, miljø- og forretningsrisikoer.",
          },
          {
            title: "2. Vurder sannsynlighet og konsekvens",
            description:
              "Bruk risikomatrise (5×5 eller tilsvarende) for å rangere risikoene.",
          },
          {
            title: "3. Bestem tiltak",
            description:
              "Prioriter høye risikoer. Bruk forebyggende tiltak (eliminere, redusere) før beskyttende (verneutstyr).",
          },
          {
            title: "4. Oppfølging",
            description:
              "Sjekk at tiltakene fungerer og at restrisikoen er akseptabel. Revurder årlig eller ved endringer. Lukk tiltak når de er gjennomført.",
          },
        ],
      },
      {
        heading: "Hva skal lukkes – og hva skal ikke?",
        emoji: "3️⃣",
        items: [
          {
            title: "Tiltak i risikovurdering",
            description: "✅ Ja – når gjennomført og kontrollert.",
          },
          {
            title: "Avvik",
            description: "✅ Ja – etter korrigerende tiltak og verifisering.",
          },
          {
            title: "Risikovurdering",
            description: "❌ Nei – den revideres, ikke lukkes.",
          },
          {
            title: "Systemdokumenter",
            description: "❌ Nei – de versjonstyres.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 31000: Risikovurdering – prinsipper og retningslinjer",
      "ISO 9001 (Kvalitet): Krav 6.1 - Risikobasert tilnærming",
      "ISO 14001 (Miljø): Krav 6.1.2 - Miljøaspekter og risikovurdering",
      "ISO 45001 (HMS): Krav 6.1.2 - Fareidentifisering og risikovurdering",
      "ISO 27001 (IT-sikkerhet): Krav 6.1.2 - Informasjonssikkerhetsrisikovurdering",
    ],
    tips: [
      "Involver de ansatte – de kjenner best til farene i sitt arbeid",
      "Bruk vernerunder, HMS-møter og inspeksjoner for å identifisere risikoer",
      "Dokumenter både risikoene og tiltakene grundig",
      "Lukk tiltak når de er gjennomført – ellers kan du ikke dokumentere redusert risiko",
      "Revurder risikoen etter tiltak – fyll ut restrisiko (S×K etter tiltak)",
      "ISO PDCA: Risiko = Plan, Tiltak = Do, Kontroll = Check, Forbedring = Act",
    ],
  },

  inspections: {
    title: "Inspeksjoner og vernerunder",
    description: "Gjennomfør systematiske kontroller av arbeidsmiljøet",
    sections: [
      {
        heading: "Hva er inspeksjoner?",
        emoji: "🔍",
        content:
          "Inspeksjoner er systematiske kontroller for å avdekke risiko, avvik og forbedringsområder. Vernerunder er en form for inspeksjon der verneombud og ledelse går sammen gjennom arbeidsområdene.",
      },
      {
        heading: "Hvorfor gjennomføre inspeksjoner?",
        emoji: "✅",
        items: [
          {
            title: "Lovpålagt",
            description:
              "Arbeidsmiljøloven § 6-2 krever at arbeidsgiver gjennomfører systematisk kontroll.",
          },
          {
            title: "Forebygg ulykker",
            description:
              "Oppdager farer og svakheter før de fører til skader eller tap.",
          },
          {
            title: "Dokumentasjon",
            description:
              "Beviser at du har internkontroll og oppfyller lovkrav.",
          },
          {
            title: "Kontinuerlig forbedring",
            description:
              "Identifiserer forbedringsmuligheter i arbeidsprosesser og utstyr.",
          },
        ],
      },
      {
        heading: "Hvordan gjennomføre inspeksjoner",
        emoji: "📝",
        items: [
          {
            title: "1. Bruk sjekklister",
            description:
              "Lag maler basert på arbeidsområde, utstyr eller prosess. HMS Nova har ferdiglagde maler.",
          },
          {
            title: "2. Involver de ansatte",
            description:
              "Ta med verneombud og medarbeidere som kjenner området godt.",
          },
          {
            title: "3. Ta bilder",
            description:
              "Dokumenter avvik med foto. Enklere å følge opp og kommunisere.",
          },
          {
            title: "4. Oppfølging",
            description:
              "Registrer avvik og tiltak. Sett ansvarlig og frist. Følg opp til lukket.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 45001 (HMS): Krav 9.1 - Overvåking, måling, analyse og evaluering",
      "ISO 14001 (Miljø): Krav 9.1 - Miljøovervåking",
      "ISO 9001 (Kvalitet): Krav 9.1 - Overvåking av kvalitetsprosesser",
    ],
    tips: [
      "Gjennomfør inspeksjoner regelmessig (ukentlig, månedlig eller kvartalsvis)",
      "Variabler frekvens basert på risiko: høyrisiko-områder oftere",
      "Bruk mobil-funksjonen for å gjennomføre vernerunder ute på området",
      "Følg opp avvik systematisk – lukk dem når tiltak er gjennomført",
      "Gjennomgå inspeksjonsresultater i ledermøter og HMS-utvalg",
    ],
  },

  incidents: {
    title: "Hendelser og avvik",
    description: "Registrer og følg opp uønskede hendelser",
    sections: [
      {
        heading: "Hva er en hendelse?",
        emoji: "🚨",
        content:
          "En hendelse er en uønsket eller uventet hendelse som har, eller kunne ha ført til skade på personer, miljø, materiell eller omdømme. Dette inkluderer ulykker, nestenulykker, miljøhendelser og avvik fra prosedyrer.",
      },
      {
        heading: "Skal avvik lukkes?",
        emoji: "2️⃣",
        content:
          "Ja – avvik skal lukkes. Et avvik skal: 1) Registreres. 2) Vurderes. 3) Årsaksanalyseres (ved behov). 4) Få korrigerende tiltak. 5) Tiltak gjennomføres. 6) Effekt verifiseres. 7) Avviket lukkes. Dette er eksplisitt krav i ISO 9001 kap. 10.2 og ISO 45001 kap. 10.2. Hvis avvik ikke lukkes, vil en revisor stille spørsmålet: Hvordan vet dere at problemet faktisk er løst? Et åpent avvik betyr at systemet ikke fungerer.",
        items: [
          {
            title: "For revisjonssterkt system i HMS Nova",
            description:
              "Status: Åpen → Under utredning → Tiltak iverksatt → Lukket. Sjekk: Årsak vurdert? Tiltak opprettet? Effekt verifisert? Lukk med dato og hvem godkjente. Dette er det Arbeidstilsynet og ISO-revisor ser etter.",
          },
        ],
      },
      {
        heading: "Hvorfor registrere hendelser?",
        emoji: "📋",
        items: [
          {
            title: "Lovkrav",
            description:
              "Arbeidsmiljøloven § 5-1 krever at arbeidsgiver undersøker ulykker og nestenulykker.",
          },
          {
            title: "Lære av feil",
            description:
              "Identifiser grunnårsaker og sett inn tiltak for å unngå gjentakelse.",
          },
          {
            title: "Trendanalyse",
            description:
              "Se mønstre og prioriter innsats på områder med høy risiko.",
          },
          {
            title: "Forbedring",
            description:
              "Hendelsesrapportering er grunnlaget for kontinuerlig forbedring.",
          },
        ],
      },
      {
        heading: "Slik håndterer du avvik (ISO 10.2)",
        emoji: "🔧",
        items: [
          {
            title: "1. Registrer raskt",
            description:
              "Meld hendelsen så snart som mulig. Jo raskere, jo bedre kvalitet på informasjonen.",
          },
          {
            title: "2. Undersøk og årsaksanalyser",
            description:
              "Gjennomfør granskning for å finne grunnårsaker, ikke bare symptomer. Bruk f.eks. 5 Why eller Fishbone.",
          },
          {
            title: "3. Iverksett tiltak",
            description:
              "Registrer konkrete tiltak med ansvarlig person og frist. Følg opp til alle tiltak er fullført.",
          },
          {
            title: "4. Lukk avviket",
            description:
              "Når tiltak er gjennomført og effekt er verifisert: Lukk avviket. Dokumenter effektivitetsvurdering og hvem som godkjente lukking.",
          },
        ],
      },
      {
        heading: "Hva skal lukkes – og hva skal ikke?",
        emoji: "3️⃣",
        items: [
          {
            title: "Tiltak i risikovurdering",
            description: "✅ Ja – når gjennomført og kontrollert.",
          },
          {
            title: "Avvik",
            description: "✅ Ja – etter korrigerende tiltak og verifisering.",
          },
          {
            title: "Risikovurdering",
            description: "❌ Nei – den revideres, ikke lukkes.",
          },
          {
            title: "Systemdokumenter",
            description: "❌ Nei – de versjonstyres.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 45001 (HMS): Krav 10.2 - Hendelser, avvik og korrigerende tiltak",
      "ISO 14001 (Miljø): Krav 10.2 - Miljøhendelser og korrigerende tiltak",
      "ISO 9001 (Kvalitet): Krav 10.2 - Avvik og korrigerende tiltak",
      "ISO 27001 (IT-sikkerhet): Krav 16 - Håndtering av informasjonssikkerhetshendelser",
    ],
    tips: [
      "Skap en kultur hvor det er trygt å melde hendelser",
      "Fokuser på systemfeil, ikke personlig skyld",
      "Lukk avvik når tiltak er gjennomført og effekt er verifisert",
      "Et åpent avvik = systemet fungerer ikke – revisor vil stille spørsmål",
      "ISO PDCA: Hvis du ikke lukker avvik og tiltak, stopper syklusen.",
    ],
  },

  actions: {
    title: "Tiltak og oppgaver",
    description: "Håndter korrigerende og forebyggende tiltak",
    sections: [
      {
        heading: "Hva er tiltak?",
        emoji: "✅",
        content:
          "Tiltak er konkrete handlinger for å løse avvik, redusere risikoer eller forbedre prosesser. De kan være korrigerende (rette opp feil) eller forebyggende (hindre at noe skjer).",
      },
      {
        heading: "Skal tiltak lukkes?",
        emoji: "1️⃣",
        content:
          "Ja. Tiltak skal lukkes når de er gjennomført og verifisert. ISO 45001 kap. 6.1 og 8.1, ISO 9001 kap. 6.1. Hvis tiltak ikke lukkes, kan du ikke dokumentere at risikoen er redusert eller at avviket er løst. I HMS Nova: marker tiltak som fullført, dokumenter effekt, og lukk – da støtter du PDCA-syklusen (Plan–Do–Check–Act) som ISO bygger på.",
        items: [
          {
            title: "Hva skal lukkes – og hva skal ikke?",
            description:
              "Tiltak: ✅ Ja. Avvik: ✅ Ja. Risikovurdering: ❌ Nei (revideres). Systemdokumenter: ❌ Nei (versjonstyres).",
          },
        ],
      },
      {
        heading: "Hvorfor systematisere tiltak?",
        emoji: "🎯",
        items: [
          {
            title: "Sikre gjennomføring",
            description:
              "Med tydelig ansvarlig og frist øker sannsynligheten for at tiltak blir gjennomført.",
          },
          {
            title: "Sporbarhet",
            description:
              "Du kan bevise at tiltak er iverksatt, evaluert og lukket.",
          },
          {
            title: "ISO-krav",
            description:
              "Alle ISO-standarder krever systematisk håndtering av korrigerende tiltak.",
          },
          {
            title: "Kontinuerlig forbedring",
            description:
              "Strukturert tiltakshåndtering driver organisasjonen fremover.",
          },
        ],
      },
      {
        heading: "Slik jobber du med tiltak",
        emoji: "📊",
        items: [
          {
            title: "1. Definer tydelig",
            description:
              "Beskriv hva som skal gjøres, hvorfor og hvilket resultat du forventer.",
          },
          {
            title: "2. Sett ansvarlig og frist",
            description:
              "Én person skal være ansvarlig. Sett realistisk tidsfrist.",
          },
          {
            title: "3. Prioriter",
            description:
              "Merk høyprioriterte tiltak og fokuser på dem først.",
          },
          {
            title: "4. Lukk når fullført",
            description:
              "Når tiltaket er gjennomført: fungerte det? Er problemet løst? Marker som fullført og dokumenter effekt. Lukk tiltaket.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 9001 (Kvalitet): Krav 10.2 - Avvik og korrigerende tiltak",
      "ISO 14001 (Miljø): Krav 10.2 - Miljøavvik og korrigerende tiltak",
      "ISO 45001 (HMS): Krav 10.2 - Hendelser og korrigerende tiltak",
      "ISO 27001 (IT-sikkerhet): Krav A.16.1.6 - Læring av sikkerhetshendelser",
    ],
    tips: [
      "Koble tiltak til risikoer, hendelser eller avvik for full sporbarhet",
      "Bruk SMART-mål: Spesifikk, Målbar, Akseptert, Realistisk, Tidsbestemt",
      "Sett opp påminnelser slik at ansvarlige ikke glemmer fristen",
      "Gjennomgå åpne tiltak i ledermøter og HMS-møter",
      "Lukk tiltak når de er gjennomført og dokumenter resultatet",
    ],
  },

  training: {
    title: "Opplæring",
    description: "Sikre kompetanse og kvalifikasjoner i organisasjonen",
    sections: [
      {
        heading: "Hva er opplæring?",
        emoji: "🎓",
        content:
          "Opplæring omfatter all kompetansebygging som sikrer at medarbeidere har nødvendig kunnskap, ferdigheter og holdninger for å utføre arbeidet trygt, effektivt og i samsvar med krav.",
      },
      {
        heading: "Hvorfor er opplæring viktig?",
        emoji: "📚",
        items: [
          {
            title: "Lovpålagt",
            description:
              "Arbeidsmiljøloven § 4-2 krever at arbeidsgiver gir nødvendig opplæring.",
          },
          {
            title: "Forebygg ulykker",
            description:
              "Manglende kompetanse er en vanlig årsak til arbeidsulykker.",
          },
          {
            title: "ISO-krav",
            description:
              "ISO 9001, 14001, 45001 og 27001 krever dokumentert kompetanse og opplæring.",
          },
          {
            title: "Bedre resultater",
            description:
              "Kompetente medarbeidere leverer høyere kvalitet og er mer effektive.",
          },
        ],
      },
      {
        heading: "Hvordan bruke opplæringsmodulen",
        emoji: "🔧",
        items: [
          {
            title: "1. Lag opplæringsmatrise",
            description:
              "Kartlegg hvilke kurs og kompetanser hver stilling eller person trenger.",
          },
          {
            title: "2. Registrer kurs",
            description:
              "Legg inn gjennomførte kurs med dato, varighet og eventuelt sertifikat.",
          },
          {
            title: "3. Sett påminnelser",
            description:
              "Mange kurs har utløpsdato (førstehjelp, varme arbeider, truck). Sett opp automatiske påminnelser.",
          },
          {
            title: "4. Gjennomgå kompetanse",
            description:
              "Se oversikt over hvem som mangler hvilke kurs og planlegg opplæring.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 9001 (Kvalitet): Krav 7.2 - Kompetanse",
      "ISO 14001 (Miljø): Krav 7.2 - Miljøkompetanse",
      "ISO 45001 (HMS): Krav 7.2 - HMS-kompetanse",
      "ISO 27001 (IT-sikkerhet): Krav 7.2 - Sikkerhetskompetanse og bevissthet",
    ],
    tips: [
      "Start med å identifisere kritisk kompetanse for sikkerhet og kvalitet",
      "Bruk både eksterne kurs og intern opplæring (on-the-job)",
      "Dokumenter all opplæring: hvem, hva, når, varighet",
      "Evaluer om opplæringen fungerer – test forståelse og se på resultater",
      "Gjennomfør introduksjonsprogram for nye ansatte",
    ],
  },

  audits: {
    title: "Revisjoner",
    description: "Gjennomfør internrevisjoner av styringssystemet",
    sections: [
      {
        heading: "Hva er en revisjon?",
        emoji: "🔍",
        content:
          "En revisjon er en systematisk og uavhengig undersøkelse for å vurdere om aktiviteter, prosesser og resultater er i samsvar med krav og standarder. Internrevisjoner gjennomføres av egen organisasjon.",
      },
      {
        heading: "Hvorfor gjennomføre revisjoner?",
        emoji: "✅",
        items: [
          {
            title: "ISO-krav",
            description:
              "Alle ISO-standarder krever årlige internrevisjoner av hele styringssystemet.",
          },
          {
            title: "Verifiser etterlevelse",
            description:
              "Sikrer at dere faktisk følger egne prosedyrer og oppfyller lovkrav.",
          },
          {
            title: "Identifiser forbedringsområder",
            description:
              "Avdekker svakheter, ineffektivitet og muligheter for forbedring.",
          },
          {
            title: "Forbered eksternrevisjon",
            description:
              "Internrevisjoner avdekker avvik før sertifiseringsrevisjoner.",
          },
        ],
      },
      {
        heading: "Slik gjennomfører du revisjoner",
        emoji: "📋",
        items: [
          {
            title: "1. Planlegg revisjonen",
            description:
              "Lag årlig revisjonsplan. Dekk hele styringssystemet over en periode.",
          },
          {
            title: "2. Forbered revisor",
            description:
              "Gjennomgå relevante dokumenter, tidligere avvik og endringer siden sist.",
          },
          {
            title: "3. Gjennomfør revisjon",
            description:
              "Intervju personell, gjennomgå dokumenter, observer praksis. Dokumenter funn.",
          },
          {
            title: "4. Rapporter og følg opp",
            description:
              "Lag revisjonsrapport, registrer avvik og tiltak. Følg opp til lukket.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 9001 (Kvalitet): Krav 9.2 - Internrevisjon",
      "ISO 14001 (Miljø): Krav 9.2 - Internrevisjon av miljøstyringssystemet",
      "ISO 45001 (HMS): Krav 9.2 - Internrevisjon av HMS-systemet",
      "ISO 27001 (IT-sikkerhet): Krav 9.2 - Internrevisjon av ISMS",
      "ISO 19011: Retningslinjer for revisjon av styringssystemer",
    ],
    tips: [
      "Bruk revisorer som ikke har ansvar for det området som revideres",
      "Tren dine interne revisorer i revisjonsteknikk",
      "Fokuser på både etterlevelse og effektivitet av prosesser",
      "Involver de ansatte – dette er en læringsmulighet, ikke straff",
      "Gjennomgå revisjonsfunn i ledelsens gjennomgåelse",
    ],
  },

  goals: {
    title: "Mål og målstyring",
    description: "Sett og følg opp organisasjonens HMS-, kvalitets- og miljømål",
    sections: [
      {
        heading: "Hva er mål?",
        emoji: "🎯",
        content:
          "Mål er konkrete, målbare resultater organisasjonen ønsker å oppnå innen HMS, kvalitet, miljø eller forretningsområder. Gode mål gir retning og gjør det mulig å måle fremgang.",
      },
      {
        heading: "Hvorfor sette mål?",
        emoji: "📈",
        items: [
          {
            title: "ISO-krav",
            description:
              "ISO 9001, 14001, 45001 og 27001 krever at organisasjonen setter målbare mål.",
          },
          {
            title: "Gi retning",
            description:
              "Tydelige mål gir hele organisasjonen felles retning og prioriteringer.",
          },
          {
            title: "Måle fremgang",
            description:
              "Uten mål vet du ikke om du lykkes eller om tiltakene fungerer.",
          },
          {
            title: "Engasjere ansatte",
            description:
              "Involvering i målsetting øker motivasjon og eierskap.",
          },
        ],
      },
      {
        heading: "Slik jobber du med mål",
        emoji: "🔧",
        items: [
          {
            title: "1. Bruk SMART-kriterier",
            description:
              "Spesifikk, Målbar, Akseptert, Realistisk, Tidsbestemt. Eks: 'Redusere H-verdi til under 3,0 innen 31.12.2026'.",
          },
          {
            title: "2. Koble til risikoer og tiltak",
            description:
              "Mål skal adressere identifiserte risikoer og støttes av konkrete tiltak.",
          },
          {
            title: "3. Følg opp regelmessig",
            description:
              "Mål må måles og rapporteres kvartalsvis eller oftere. Juster kursen ved behov.",
          },
          {
            title: "4. Gjennomgå i ledelsen",
            description:
              "Måloppnåelse skal være fast punkt i ledelsens gjennomgåelse.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 9001 (Kvalitet): Krav 6.2 - Kvalitetsmål",
      "ISO 14001 (Miljø): Krav 6.2 - Miljømål",
      "ISO 45001 (HMS): Krav 6.2 - HMS-mål",
      "ISO 27001 (IT-sikkerhet): Krav 6.2 - Informasjonssikkerhetsmål",
    ],
    tips: [
      "Sett få, men viktige mål – bedre med 5 gode enn 20 uklare",
      "Involver både ledelse og ansatte i målsettingsprosessen",
      "Koble mål til organisasjonens strategi og verdier",
      "Bruk nøkkeltall (KPI) for å måle fremgang",
      "Feire når mål nås – dette motiverer videre innsats",
    ],
  },

  meetings: {
    title: "Møter",
    description: "Dokumenter HMS-møter, verneombudsmøter og ledelsens gjennomgåelse",
    sections: [
      {
        heading: "Hva er møteoppfølging?",
        emoji: "🗓️",
        content:
          "Møter er viktige arenaer for dialog om HMS, kvalitet og miljø. Strukturert møteoppfølging sikrer at avgjørelser blir dokumentert og fulgt opp.",
      },
      {
        heading: "Hvorfor dokumentere møter?",
        emoji: "📝",
        items: [
          {
            title: "Lovkrav",
            description:
              "Arbeidsmiljøloven § 7-2 krever skriftlig referat fra AMU-møter og verneombudsmøter.",
          },
          {
            title: "Beslutningssporbarhet",
            description:
              "Dokumenterer hvilke beslutninger som er tatt, av hvem og hvorfor.",
          },
          {
            title: "Oppfølging",
            description:
              "Møtereferat sikrer at tiltak og oppgaver følges opp til neste møte.",
          },
          {
            title: "ISO-krav",
            description:
              "Ledelsens gjennomgåelse (management review) skal dokumenteres grundig.",
          },
        ],
      },
      {
        heading: "Hvordan bruke møtemodulen",
        emoji: "✅",
        items: [
          {
            title: "1. Opprett møte",
            description:
              "Registrer møtetype, deltakere, dato og agenda på forhånd.",
          },
          {
            title: "2. Dokumenter underveis",
            description:
              "Skriv inn saker, beslutninger og tiltak direkte i systemet under møtet.",
          },
          {
            title: "3. Generer referat",
            description:
              "Systemet lager automatisk strukturert møtereferat som kan deles.",
          },
          {
            title: "4. Følg opp tiltak",
            description:
              "Tiltak fra møter kobles til tiltaksmodulen og følges opp der.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 9001 (Kvalitet): Krav 9.3 - Ledelsens gjennomgåelse",
      "ISO 14001 (Miljø): Krav 9.3 - Ledelsens gjennomgåelse av miljøsystemet",
      "ISO 45001 (HMS): Krav 9.3 - Ledelsens gjennomgåelse av HMS-systemet",
      "ISO 27001 (IT-sikkerhet): Krav 9.3 - Ledelsens gjennomgåelse av ISMS",
    ],
    tips: [
      "Avhold regelmessige HMS-møter (månedlig eller kvartalsvis)",
      "Ledelsens gjennomgåelse skal holdes minimum årlig",
      "Involver verneombud i alle HMS-relaterte møter",
      "Gjennomgå status på mål, risikoer, hendelser og tiltak i hvert møte",
      "Distribuer referat raskt til alle deltakere",
    ],
  },

  "management-reviews": {
    title: "Ledelsens gjennomgåelse",
    description: "Gjennomfør systematisk evaluering av styringssystemet",
    sections: [
      {
        heading: "Hva er ledelsens gjennomgåelse?",
        emoji: "👔",
        content:
          "Ledelsens gjennomgåelse (Management Review) er et formelt møte der toppledelsen gjennomgår styringssystemets ytelse, effektivitet og resultater. Dette er ledelsens viktigste verktøy for å sikre at systemet fungerer og forbedres.",
      },
      {
        heading: "Hvorfor er det viktig?",
        emoji: "🎯",
        items: [
          {
            title: "ISO-krav",
            description:
              "Alle ISO-standarder krever at toppledelsen gjennomgår systemet minimum årlig.",
          },
          {
            title: "Lederansvar",
            description:
              "Viser at ledelsen tar ansvar for HMS, kvalitet og miljø.",
          },
          {
            title: "Strategisk styringsverktøy",
            description:
              "Gir ledelsen oversikt og grunnlag for strategiske beslutninger.",
          },
          {
            title: "Kontinuerlig forbedring",
            description:
              "Identifiserer forbedringsområder og setter retning for fremtiden.",
          },
        ],
      },
      {
        heading: "Hva skal gjennomgås?",
        emoji: "📊",
        items: [
          {
            title: "1. Input fra forrige gjennomgåelse",
            description:
              "Oppfølging av tiltak og beslutninger fra forrige ledelsens gjennomgåelse.",
          },
          {
            title: "2. Måloppnåelse og KPIer",
            description:
              "Status på HMS-, kvalitets- og miljømål. Nøkkeltall og trender.",
          },
          {
            title: "3. Revisjoner og avvik",
            description:
              "Resultater fra interne og eksterne revisjoner, samt status på korrigerende tiltak.",
          },
          {
            title: "4. Endringer og risiko",
            description:
              "Relevante endringer i organisasjon, lover, marked. Oppdatert risikovurdering.",
          },
          {
            title: "5. Ressurser og kompetanse",
            description:
              "Vurdering av om systemet har tilstrekkelige ressurser for å fungere.",
          },
          {
            title: "6. Muligheter for forbedring",
            description:
              "Identifisere områder for forbedring og beslutte nye tiltak.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 9001 (Kvalitet): Krav 9.3 - Ledelsens gjennomgåelse",
      "ISO 14001 (Miljø): Krav 9.3 - Ledelsens gjennomgåelse",
      "ISO 45001 (HMS): Krav 9.3 - Ledelsens gjennomgåelse",
      "ISO 27001 (IT-sikkerhet): Krav 9.3 - Ledelsens gjennomgåelse",
    ],
    tips: [
      "Gjennomfør minimum én gang i året, gjerne to ganger",
      "Forbered grundig – systemet kan autofylle mye data",
      "Involver toppledelsen – dette skal ikke delegeres",
      "Fokuser på både resultater og systemets egnethet",
      "Dokumenter beslutninger og tiltak tydelig",
      "Følg opp tiltak fra møtet systematisk",
    ],
  },

  chemicals: {
    title: "Kjemikaliestyring",
    description: "Administrer kjemikalier og sikkerhetsdatablad",
    sections: [
      {
        heading: "Hva er kjemikaliestyring?",
        emoji: "⚗️",
        content:
          "Kjemikaliestyring handler om å ha oversikt over alle kjemikalier i virksomheten, vurdere risiko ved bruk, og sikre trygg håndtering gjennom rutiner, verneutstyr og opplæring.",
      },
      {
        heading: "Hvorfor er det viktig?",
        emoji: "⚠️",
        items: [
          {
            title: "Lovpålagt",
            description:
              "Kjemikalieforskriften krever kartlegging, risikovurdering og sikkerhetsdatablad.",
          },
          {
            title: "Helsefarer",
            description:
              "Mange kjemikalier kan forårsake akutt eller kronisk helseskade.",
          },
          {
            title: "Miljøkonsekvenser",
            description:
              "Utslipp av farlige kjemikalier kan skade miljøet betydelig.",
          },
          {
            title: "ISO-krav",
            description:
              "ISO 14001 (miljø) og ISO 45001 (HMS) krever styring av farlige stoffer.",
          },
        ],
      },
      {
        heading: "Slik bruker du kjemikaliemodulen",
        emoji: "📋",
        items: [
          {
            title: "1. Registrer alle kjemikalier",
            description:
              "Legg inn produktnavn, leverandør og last opp sikkerhetsdatablad (SDS).",
          },
          {
            title: "2. Risikovurder bruken",
            description:
              "Vurder eksponering, faregrad og tiltak. HMS Nova hjelper deg med struktur.",
          },
          {
            title: "3. Definer verneutstyr og rutiner",
            description:
              "Dokumenter hvilke verneutstyr og sikkerhetstiltak som kreves.",
          },
          {
            title: "4. Opplær personell",
            description:
              "Alle som bruker kjemikalier må ha opplæring. Koble til opplæringsmodulen.",
          },
          {
            title: "5. Hold oppdatert",
            description:
              "Sikkerhetsdatablad skal oppdateres når leverandør sender nye versjoner.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 45001 (HMS): Krav 8.1.3 - Håndtering av farlige stoffer",
      "ISO 14001 (Miljø): Krav 8.1 - Miljøaspekter knyttet til kjemikalier",
    ],
    tips: [
      "Lagre sikkerhetsdatablad digitalt og gjør dem tilgjengelige for ansatte",
      "Merk kjemikalier tydelig med farepiktogrammer",
      "Erstatt farlige kjemikalier med mindre farlige alternativer når mulig",
      "Gjennomgå kjemikalieoversikten årlig",
      "Koble kjemikalier til risikovurderinger og inspeksjoner",
    ],
  },

  environment: {
    title: "Miljøstyring",
    description: "Kartlegg og håndter miljøaspekter og miljøpåvirkning",
    sections: [
      {
        heading: "Hva er miljøstyring?",
        emoji: "🌍",
        content:
          "Miljøstyring handler om å identifisere og håndtere organisasjonens påvirkning på miljøet. Dette inkluderer energiforbruk, utslipp, avfall, kjemikaliebruk og andre miljøaspekter.",
      },
      {
        heading: "Hvorfor jobbe med miljøstyring?",
        emoji: "♻️",
        items: [
          {
            title: "Lovkrav",
            description:
              "Forurensningsloven og ulike forskrifter stiller krav til miljøhåndtering.",
          },
          {
            title: "ISO 14001",
            description:
              "Miljøsertifisering krever systematisk kartlegging og forbedring av miljøprestasjon.",
          },
          {
            title: "Samfunnsansvar",
            description:
              "Bidra til bærekraftig utvikling og redusert miljøbelastning.",
          },
          {
            title: "Økonomi",
            description:
              "Redusert energiforbruk og avfall gir ofte kostnadsbesparelser.",
          },
        ],
      },
      {
        heading: "Slik bruker du miljømodulen",
        emoji: "📊",
        items: [
          {
            title: "1. Identifiser miljøaspekter",
            description:
              "Kartlegg alle aktiviteter som påvirker miljøet: energi, avfall, utslipp, transport, kjemikalier.",
          },
          {
            title: "2. Vurder betydning",
            description:
              "Prioriter de miljøaspektene som har størst påvirkning eller er regulert av lov.",
          },
          {
            title: "3. Sett miljømål",
            description:
              "Definer konkrete mål for reduksjon av miljøbelastning, f.eks. 'Redusere energiforbruk med 15% innen 2027'.",
          },
          {
            title: "4. Overvåk og rapporter",
            description:
              "Mål forbruk og utslipp regelmessig. Rapporter fremgang mot mål.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 14001: Miljøstyringssystemer – krav og veiledning",
      "ISO 14004: Retningslinjer for implementering av miljøstyringssystem",
      "ISO 50001: Energistyringssystemer (frivillig)",
    ],
    tips: [
      "Start med å kartlegge de mest åpenbare miljøaspektene: avfall, energi, transport",
      "Involver ansatte – de har ofte gode ideer til miljøforbedringer",
      "Kombiner miljø- og HMS-vurderinger for kjemikalier",
      "Sett opp målere for å følge forbruk og utslipp over tid",
      "Gjennomgå miljøaspekter årlig eller ved endringer",
    ],
  },

  wellbeing: {
    title: "Psykososialt arbeidsmiljø",
    description: "Kartlegg og forbedre det psykososiale arbeidsmiljøet",
    sections: [
      {
        heading: "Hva er psykososialt arbeidsmiljø?",
        emoji: "💚",
        content:
          "Psykososialt arbeidsmiljø omfatter faktorer som arbeidsmengde, kontroll, støtte, rolleavklaring, konflikter og trivsel. Det handler om hvordan organisering og ledelse påvirker ansattes psykiske helse og velvære.",
      },
      {
        heading: "Hvorfor er det viktig?",
        emoji: "🧠",
        items: [
          {
            title: "Lovpålagt",
            description:
              "Arbeidsmiljøloven § 4-3 pålegger arbeidsgiver å forebygge psykiske og fysiske helseskader.",
          },
          {
            title: "Høyt sykefravær",
            description:
              "Psykiske plager er en av de vanligste årsakene til langvarig sykefravær.",
          },
          {
            title: "ISO 45003",
            description:
              "Ny standard for psykososial risikohåndtering gir retningslinjer for systematisk arbeid.",
          },
          {
            title: "Bedre resultater",
            description:
              "Godt psykososialt arbeidsmiljø øker engasjement, produktivitet og trivsel.",
          },
        ],
      },
      {
        heading: "Slik jobber du med psykososialt arbeidsmiljø",
        emoji: "🔧",
        items: [
          {
            title: "1. Kartlegg med spørreundersøkelser",
            description:
              "Gjennomfør strukturerte undersøkelser om arbeidsmengde, kontroll, støtte, mobbing, trakassering.",
          },
          {
            title: "2. Identifiser risikofaktorer",
            description:
              "Analyser svarene og identifiser områder med høy belastning eller risiko.",
          },
          {
            title: "3. Involver ansatte i tiltak",
            description:
              "Diskuter resultatene åpent og la ansatte være med på å finne løsninger.",
          },
          {
            title: "4. Følg opp systematisk",
            description:
              "Sett inn tiltak, evaluer effekt og gjenta undersøkelsen jevnlig (årlig eller annethvert år).",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 45003: Psykososial risikohåndtering i arbeidsmiljøet",
      "ISO 45001 (HMS): Omfatter også psykososiale faktorer",
      "ISO 10002: Håndtering av klager (også fra ansatte)",
    ],
    tips: [
      "Bruk validerte spørreundersøkelser som QPSNordic eller lignende",
      "Gjennomfør undersøkelsen anonymt for å få ærlige svar",
      "Kommuniser resultatene åpent til alle ansatte",
      "Kombiner kvantitative data (spørreundersøkelser) med kvalitative (samtaler, vernerunder)",
      "Gjennomfør undersøkelsen årlig for å følge trender",
    ],
  },

  bcm: {
    title: "Beredskap og kontinuitet (BCM)",
    description: "Sikre virksomhetens evne til å håndtere kriser og fortsette drift",
    sections: [
      {
        heading: "Hva er BCM?",
        emoji: "🛡️",
        content:
          "Business Continuity Management (BCM) handler om å sikre at organisasjonen kan fortsette å levere kritiske tjenester selv ved alvorlige hendelser som brann, IT-utfall, pandemi eller andre kriser.",
      },
      {
        heading: "Hvorfor er det viktig?",
        emoji: "🚨",
        items: [
          {
            title: "Redusere konsekvenser",
            description:
              "Minimerer tap av tid, penger og omdømme ved kriser.",
          },
          {
            title: "Økt motstandsdyktighet",
            description:
              "Gjør organisasjonen robust og i stand til å håndtere det uventede.",
          },
          {
            title: "ISO 22301",
            description:
              "Internasjonal standard for kontinuitetsstyring gir strukturert rammeverk.",
          },
          {
            title: "Kundetillit",
            description:
              "Viser at dere tar ansvar og har kontroll.",
          },
        ],
      },
      {
        heading: "Hvordan bruke BCM-modulen",
        emoji: "📋",
        items: [
          {
            title: "1. Identifiser kritiske prosesser",
            description:
              "Hvilke prosesser er avgjørende for å levere tjenester? Hva skjer hvis de stopper?",
          },
          {
            title: "2. Gjennomfør BIA",
            description:
              "Business Impact Analysis: Vurder konsekvenser av driftsavbrudd og definer akseptabel nedetid (RTO).",
          },
          {
            title: "3. Lag beredskapsplaner",
            description:
              "Dokumenter hvordan dere gjenoppretter drift: backup, alternativt utstyr, kommunikasjon.",
          },
          {
            title: "4. Øv og test",
            description:
              "Gjennomfør regelmessige øvelser for å sikre at planene fungerer.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 22301: Business Continuity Management Systems (BCMS)",
      "ISO 27001 (IT-sikkerhet): Krav A.17 - Informasjonssikkerhet i BCM",
    ],
    tips: [
      "Start med å identifisere 3-5 kritiske prosesser",
      "Lag kontaktlister for kriseteam og nøkkelpersonell",
      "Dokumenter backup-løsninger for IT, lokaler og utstyr",
      "Gjennomfør minst én BCM-øvelse i året",
      "Oppdater beredskapsplanene ved endringer i organisasjonen",
    ],
  },

  "annual-hms-plan": {
    title: "Årlig HMS-plan",
    description: "Steg-for-steg sjekkliste som samler alle lov- og standardkrav – huk av når hvert steg er fullført",
    sections: [
      {
        heading: "Hva er årlig HMS-plan?",
        emoji: "📆",
        content:
          "Årlig HMS-plan er en sjekkliste med alle viktige HMS-krav for året. Du går steg for steg gjennom listen og huker av når hvert punkt er fullført. Når hele listen er avkrysset, har dere dokumentert at årets krav er oppfylt – uten å måtte sette dere inn i alle lover og standarder selv.",
      },
      {
        heading: "Hvilke krav dekker planen?",
        emoji: "⚖️",
        items: [
          {
            title: "Norsk lovverk",
            description:
              "Arbeidsmiljøloven, Internkontrollforskriften, Forskrift om organisering, ledelse og medvirkning, Kjemikalieforskriften og Brann-/EL-krav krever systematisk, planlagt HMS-arbeid med dokumentasjon.",
          },
          {
            title: "Ledelsens gjennomgåelse",
            description:
              "Minst årlig, med dokumentert vurdering av mål, resultater, avvik, risiko, ressurser og forbedringstiltak.",
          },
          {
            title: "Årlig risikovurdering",
            description:
              "Systematisk gjennomgang av arbeidsmiljørisiko, inkludert fysiske, kjemiske, ergonomiske og psykososiale forhold.",
          },
          {
            title: "Kontroll og revisjon",
            description:
              "Vernerunder, internrevisjoner, oppfølging av funn og tiltak, og jevnlig gjennomgang av dokumenter og stoffkartotek.",
          },
        ],
      },
      {
        heading: "Hvordan bruke sjekklisten?",
        emoji: "🔧",
        items: [
          {
            title: "1. Gå gjennom stegene i rekkefølge",
            description:
              "Les beskrivelsen og kravet for hvert steg. Fullfør arbeidet (f.eks. gjennomfør ledelsens gjennomgang, oppdater risikovurderingen) i den tilknyttede modulen.",
          },
          {
            title: "2. Huk av når steget er fullført",
            description:
              "Kryss av i sjekklisten når dere har gjennomført og dokumentert steget. Dato og bruker lagres automatisk.",
          },
          {
            title: "3. Bruk «Gå til modul»-lenkene",
            description:
              "Hvert steg har en lenke til den relevante delen av HMS Nova (dokumenter, vernerunder, revisjoner osv.) slik at du kommer raskt til riktig sted.",
          },
          {
            title: "4. Når alle steg er avkrysset",
            description:
              "Da har dere dokumentert at årets HMS-krav er oppfylt. God for både internkontroll og ev. sertifisering.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 45001 (HMS): 6.1, 6.2, 9.1, 9.2, 9.3 og 10.2 – planlagt, systematisk HMS-arbeid gjennom året",
      "ISO 9001 (Kvalitet): 6.2, 9.1, 9.2 og 9.3 – mål, overvåking, internrevisjon og ledelsens gjennomgåelse",
      "ISO 14001 (Miljø): 6.1, 6.2, 9.1, 9.2 og 9.3 – miljøaspekter, mål, overvåking og ledelsens gjennomgåelse",
      "ISO 27001 (Informasjonssikkerhet): 9.1, 9.2 og 9.3 – overvåking, internrevisjon og ledelsens gjennomgåelse",
    ],
    tips: [
      "Bruk årshjulet som fast punkt i ledermøter og HMS-utvalg.",
      "Sørg for at alle lovpålagte aktiviteter ligger inne med dato og ansvarlig.",
      "Tilpass frekvensen på aktiviteter etter virksomhetens risiko – høyrisiko oftere.",
      "Bruk rapportene fra året (hendelser, tiltak, målinger) som input til ledelsens gjennomgåelse.",
      "Evaluer den årlige planen hver vinter og juster årshjulet for neste år.",
    ],
  },

  security: {
    title: "Informasjonssikkerhet",
    description: "Beskytt informasjon og IT-systemer mot trusler",
    sections: [
      {
        heading: "Hva er informasjonssikkerhet?",
        emoji: "🔒",
        content:
          "Informasjonssikkerhet handler om å beskytte konfidensialitet, integritet og tilgjengelighet av informasjon. Det omfatter både IT-sikkerhet og sikring av fysiske dokumenter.",
      },
      {
        heading: "Hvorfor er det viktig?",
        emoji: "🛡️",
        items: [
          {
            title: "Lovkrav",
            description:
              "GDPR og personopplysningsloven krever sikring av personopplysninger.",
          },
          {
            title: "Cyber-trusler",
            description:
              "Ransomware, phishing og datainnbrudd rammer stadig flere organisasjoner.",
          },
          {
            title: "ISO 27001",
            description:
              "Internasjonal standard for informasjonssikkerhet gir systematisk rammeverk.",
          },
          {
            title: "Tillit",
            description:
              "Kunder og partnere forventer at deres data behandles sikkert.",
          },
        ],
      },
      {
        heading: "Slik jobber du med informasjonssikkerhet",
        emoji: "🔐",
        items: [
          {
            title: "1. Kartlegg informasjonsverdier",
            description:
              "Identifiser hvilken informasjon som er kritisk eller sensitiv.",
          },
          {
            title: "2. Risikovurder trusler",
            description:
              "Vurder trusler som datainnbrudd, ransomware, feil, brann, tyveri.",
          },
          {
            title: "3. Implementer kontroller",
            description:
              "Bruk ISO 27001 Annex A som sjekkliste for sikkerhetstiltak.",
          },
          {
            title: "4. Opplær ansatte",
            description:
              "Mennesket er ofte svakeste ledd. Tren ansatte i sikker IT-bruk.",
          },
          {
            title: "5. Test og øv",
            description:
              "Gjennomfør hendelsesøvelser og test backup regelmessig.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 27001: Informasjonssikkerhetsstyring (ISMS)",
      "ISO 27002: Retningslinjer for sikkerhetskontroller",
      "ISO 27005: Informasjonssikkerhetsrisikostyring",
    ],
    tips: [
      "Start med å klassifisere informasjon etter konfidensialitet",
      "Implementer multi-faktor autentisering (MFA) på alle kritiske systemer",
      "Test backup og gjenopprettingsprosedyrer regelmessig",
      "Gjennomfør awareness-trening mot phishing og sosial manipulering",
      "Gjennomgå tilganger jevnlig – fjern tilgang for ansatte som har sluttet",
    ],
  },

  whistleblowing: {
    title: "Varsling",
    description: "Håndter varslingssaker i henhold til varslerloven",
    sections: [
      {
        heading: "Hva er varsling?",
        emoji: "📢",
        content:
          "Varsling er når en arbeidstaker melder fra om kritikkverdige forhold i virksomheten, som brudd på lov, etiske regler, fare for liv og helse, eller miljøskade.",
      },
      {
        heading: "Hvorfor er det viktig?",
        emoji: "⚖️",
        items: [
          {
            title: "Lovpålagt",
            description:
              "Arbeidsmiljøloven § 2A og varslerloven krever varslingssystem og vern mot gjengjeldelse.",
          },
          {
            title: "Avdekke alvorlige forhold",
            description:
              "Varsling kan avsløre korrupsjon, svindel, HMS-brudd eller diskriminering.",
          },
          {
            title: "Beskytte varsleren",
            description:
              "Systemet sikrer at varsler kan melde fra trygt uten frykt for represalier.",
          },
          {
            title: "Bygge tillit",
            description:
              "Viser at organisasjonen tar ansvar og vil rette opp feil.",
          },
        ],
      },
      {
        heading: "Hvordan håndtere varslingssaker",
        emoji: "🔧",
        items: [
          {
            title: "1. Sikre konfidensialitet",
            description:
              "Varslerens identitet skal beskyttes. Begrens tilgang til saken.",
          },
          {
            title: "2. Motta og registrer",
            description:
              "Logg saken trygt. Bekreft mottak til varsler innen rimelig tid.",
          },
          {
            title: "3. Undersøk grundig",
            description:
              "Gjennomfør objektiv granskning. Høre alle berørte parter.",
          },
          {
            title: "4. Iverksett tiltak",
            description:
              "Basert på funn: Korrigerende tiltak, disiplinærtiltak, eller avklaring om intet galt skjedde.",
          },
          {
            title: "5. Tilbakemelding",
            description:
              "Informer varsler om sakens utfall i henhold til lovkrav.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 37002: Ledelsessystemer for varsling (Whistleblowing)",
      "ISO 37001: Anti-korrupsjonsstyring",
    ],
    tips: [
      "Lag tydelig varslingsrutine og kommuniser den til alle ansatte",
      "Tilby både intern kanal og ekstern tredjepart for varsling",
      "Tren ledere og HR i varslingshåndtering",
      "Beskytt varsler mot gjengjeldelse – dette er lovpålagt",
      "Dokumenter hele prosessen grundig",
    ],
  },

  complaints: {
    title: "Klagebehandling",
    description: "Håndter klager fra kunder og interessenter systematisk",
    sections: [
      {
        heading: "Hva er klagebehandling?",
        emoji: "📞",
        content:
          "Klagebehandling handler om å motta, dokumentere og følge opp tilbakemeldinger og klager fra kunder, brukere eller andre interessenter på en strukturert og rettferdig måte.",
      },
      {
        heading: "Hvorfor er det viktig?",
        emoji: "💬",
        items: [
          {
            title: "Kundetilfredshet",
            description:
              "God klagehåndtering kan snu en misfornøyd kunde til en lojal ambassadør.",
          },
          {
            title: "ISO 10002",
            description:
              "Gir retningslinjer for effektiv og transparent klagebehandling.",
          },
          {
            title: "Kontinuerlig forbedring",
            description:
              "Klager avslører svakheter i produkter, tjenester eller prosesser.",
          },
          {
            title: "Omdømme",
            description:
              "Hvordan dere håndterer klager påvirker omdømmet betydelig.",
          },
        ],
      },
      {
        heading: "Hvordan håndtere klager",
        emoji: "✅",
        items: [
          {
            title: "1. Gjør det enkelt å klage",
            description:
              "Tydelig informasjon om hvordan kunder kan klage: e-post, telefon, skjema.",
          },
          {
            title: "2. Motta og bekreft",
            description:
              "Bekreft mottak av klagen raskt og informer om videre prosess.",
          },
          {
            title: "3. Undersøk saken",
            description:
              "Gjennomgå klagen objektivt. Innhent fakta og hør berørte parter.",
          },
          {
            title: "4. Gi svar og løsning",
            description:
              "Tilby en rettferdig løsning. Forklar beslutningen tydelig.",
          },
          {
            title: "5. Lær og forbedre",
            description:
              "Analyser klager for å identifisere systemfeil og forbedringsområder.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 10002: Ledelse av kundetilfredshet – klagebehandling",
      "ISO 9001 (Kvalitet): Krav 9.1.2 - Kundetilfredshet",
    ],
    tips: [
      "Sett mål for svarfrister på klager (f.eks. 24 timer for bekreftelse)",
      "Tren ansatte i god klagehåndtering og kundeservice",
      "Analyser klagedata for å se trender og gjentakende problemer",
      "Bruk klager som input til forbedringsarbeid og produktutvikling",
      "Følg opp med kunden etter at saken er løst",
    ],
  },

  feedback: {
    title: "Tilbakemeldinger",
    description: "Motta og følg opp tilbakemeldinger, forslag og innspill",
    sections: [
      {
        heading: "Hva er tilbakemeldinger?",
        emoji: "💭",
        content:
          "Tilbakemeldinger omfatter alle typer innspill fra ansatte, kunder eller andre interessenter: forbedringsforslag, ros, observasjoner eller ønsker.",
      },
      {
        heading: "Hvorfor samle tilbakemeldinger?",
        emoji: "🎯",
        items: [
          {
            title: "Engasjere ansatte",
            description:
              "Gir medarbeidere mulighet til å påvirke og bidra til forbedringer.",
          },
          {
            title: "Identifisere muligheter",
            description:
              "Gode ideer kan komme fra alle nivåer i organisasjonen.",
          },
          {
            title: "Kontinuerlig forbedring",
            description:
              "Strukturert innsamling av tilbakemeldinger driver forbedringsarbeidet.",
          },
          {
            title: "ISO-ånd",
            description:
              "Alle ISO-standarder legger vekt på forbedring basert på data og tilbakemeldinger.",
          },
        ],
      },
      {
        heading: "Hvordan bruke tilbakemeldingsmodulen",
        emoji: "📝",
        items: [
          {
            title: "1. Gjør det enkelt å gi tilbakemelding",
            description:
              "Tydelig og tilgjengelig skjema. Lave terskler for å sende inn.",
          },
          {
            title: "2. Motta og vurder",
            description:
              "Gjennomgå alle tilbakemeldinger. Prioriter de med størst potensial.",
          },
          {
            title: "3. Følg opp",
            description:
              "Gi tilbakemelding til innsender om hva som skjer med forslaget.",
          },
          {
            title: "4. Implementer gode ideer",
            description:
              "Sett inn tiltak basert på verdifulle forslag og anerkjenn bidragsyterne.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 9001 (Kvalitet): Krav 10.3 - Kontinuerlig forbedring",
      "ISO 45001 (HMS): Krav 5.4 - Konsultasjon og deltakelse av arbeidstakere",
    ],
    tips: [
      "Anerkjenn og takk for alle tilbakemeldinger",
      "Del gode eksempler på implementerte forslag",
      "Gjennomgå tilbakemeldinger i ledermøter",
      "Feire forbedringer som er basert på ansattes forslag",
      "Kombiner digitale skjemaer med fysiske forslag-bokser",
    ],
  },

  forms: {
    title: "Skjemaer og maler",
    description: "Lag egne skjemaer og sjekklister for datain samling",
    sections: [
      {
        heading: "Hva er skjemaer?",
        emoji: "📋",
        content:
          "Skjemaer er strukturerte digitale spørreskjemaer for å samle inn data systematisk. Dette kan være alt fra sikkerhetsinstrukser til evalueringsskjemaer og undersøkelser.",
      },
      {
        heading: "Hvorfor bruke digitale skjemaer?",
        emoji: "✅",
        items: [
          {
            title: "Strukturert datainnsamling",
            description:
              "Sikrer at riktig informasjon samles inn på en konsistent måte.",
          },
          {
            title: "Effektivitet",
            description:
              "Raskere enn papir. Data lagres automatisk og kan analyseres direkte.",
          },
          {
            title: "Sporbarhet",
            description:
              "Alle utfylte skjemaer lagres med tidsstempel og brukerinfo.",
          },
          {
            title: "Fleksibilitet",
            description:
              "Lag egne skjemaer tilpasset dine behov uten å vente på leverandør.",
          },
        ],
      },
      {
        heading: "Hvordan bruke skjemabyggeren",
        emoji: "🔧",
        items: [
          {
            title: "1. Opprett skjema",
            description:
              "Bruk drag-and-drop byggeren for å lage skjemaer med ulike felttyper.",
          },
          {
            title: "2. Tilpass og test",
            description:
              "Legg til instruksjoner, valideringer og betinget logikk. Test før publisering.",
          },
          {
            title: "3. Publiser og del",
            description:
              "Gjør skjemaet tilgjengelig for målgruppen. Koble til inspeksjoner eller prosesser.",
          },
          {
            title: "4. Analyser svar",
            description:
              "Se oversikt over innsendte svar og bruk dataene i rapporter.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 9001 (Kvalitet): Krav 7.5 - Dokumentert informasjon",
      "ISO 45001 (HMS): Strukturert innsamling av HMS-data",
      "ISO 14001 (Miljø): Miljøovervåking og datalogging",
    ],
    tips: [
      "Start med å digitalisere eksisterende papirskjemaer",
      "Bruk sjekklister for repeterende oppgaver (daglige sikkerhetsrunder)",
      "Legg til hjelpetekster for å forklare spørsmålene",
      "Test skjemaet med en kollega før du ruller det ut",
      "Gjennomgå innsamlede data regelmessig for å identifisere trender",
    ],
  },

  settings: {
    title: "Innstillinger",
    description: "Administrer brukerkontoer, roller, varsler og systeminnstillinger",
    sections: [
      {
        heading: "Hva er innstillinger?",
        emoji: "⚙️",
        content:
          "Her administrerer du brukere, roller, varsler, integrasjoner og generelle systeminnstillinger. Dette er kontrollpanelet for systemadministratorer.",
      },
      {
        heading: "Viktige funksjoner",
        emoji: "🔧",
        items: [
          {
            title: "Brukeradministrasjon",
            description:
              "Legg til nye brukere, definer roller (admin, leder, medarbeider) og administrer tilganger.",
          },
          {
            title: "Roller og tilganger",
            description:
              "Styr hvem som kan se, redigere og godkjenne ulike typer data basert på rolle.",
          },
          {
            title: "Varslingsoppsett",
            description:
              "Konfigurer e-postvarsler for hendelser, tiltak, frister og godkjenninger.",
          },
          {
            title: "Organisasjonsdata",
            description:
              "Oppdater virksomhetsinformasjon, logo og kontaktopplysninger.",
          },
        ],
      },
      {
        heading: "Import av brukere",
        emoji: "📥",
        items: [
          {
            title: "1. Last ned Excel-eksempel",
            description:
              "Klikk «Last ned Excel-eksempel» for å få en ferdig mal med kolonnene email, navn og rolle.",
          },
          {
            title: "2. Fyll ut og importer",
            description:
              "Bruk Excel (.xlsx) eller CSV. Gyldige roller: ANSATT, LEDER, HMS, VERNEOMBUD, BHT, REVISOR, ADMIN. Brukere legges til uten invitasjon.",
          },
          {
            title: "3. Aktiver alle",
            description:
              "Etter import: Klikk «Aktiver alle» for å sende invitasjon med passord til alle importerte brukere på én gang, eller aktiver en og en under Handlinger.",
          },
        ],
      },
      {
        heading: "Best practices",
        emoji: "💡",
        items: [
          {
            title: "Minste tilgangs-prinsippet",
            description:
              "Gi brukere bare de tilgangene de trenger for å utføre sine oppgaver.",
          },
          {
            title: "Gjennomgå tilganger regelmessig",
            description:
              "Fjern tilgang for ansatte som har sluttet eller byttet rolle.",
          },
          {
            title: "Aktiver varsler",
            description:
              "Sørg for at relevante personer får varsler om viktige hendelser.",
          },
          {
            title: "Sikre sterke passord",
            description:
              "Krev komplekse passord og vurder multi-faktor autentisering.",
          },
        ],
      },
    ],
    isoStandards: [
      "ISO 27001 (IT-sikkerhet): Krav 9.2 - Tilgangskontroll",
      "ISO 27001: Krav 9.4 - Gjennomgang av brukertilgang",
      "GDPR: Krav om tilgangsstyring og logging",
    ],
    tips: [
      "Bruk «Aktiver alle» etter import for å sende invitasjoner til mange brukere samtidig",
      "Dokumenter hvem som har hvilke roller og hvorfor",
      "Logg alle administrative endringer for sporbarhet",
      "Test varslingsfunksjonen for å sikre at e-poster kommer fram",
      "Gjennomfør tilgangsgjennomgang minst én gang i året",
      "Tren nye administratorer i systemets funksjoner",
    ],
  },
};
