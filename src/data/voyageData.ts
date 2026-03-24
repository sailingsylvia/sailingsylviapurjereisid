export interface VoyageStage {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  duration: string;
  distanceFromPrevious: number | null;
  coordinates: { lat: number; lng: number };
  description: string;
  highlights: string[];
  activities: string[];
  pricePerDay: number;
  priceInfo: string;
  arrivalDate?: string;
  startDate?: string;
  isStartPoint?: boolean;
  hasSailingTraining?: boolean;
  image?: string;
}

export interface VoyageSection {
  id: number;
  title: string;
  subtitle: string;
  period: string;
  stages: VoyageStage[];
}

// Sailing training curriculum for Roomassaare-Vilamoura stages
export const sailingTrainingTopics = [
  "Millele enne sadamast väljumist tähelepanu pöörata?",
  "Millised turvalisusnõuded täita?",
  "Kuidas panna paika merereisi plaan ja mida peab seejuures arvesse võtma?",
  "Kuidas sadamast välja manööverdada?",
  "Kuidas käituda ilma muutuste vm. oluliste takistuste korral?",
  "Purjejahi käsitlemine - purjede trimmimine, pöörete sooritamine, valvekorrad jms.",
  "Sadamatesse sisenemise eetika ja seal manööverdamine & koha leidmine"
];

export const voyageSections: VoyageSection[] = [
  {
    id: 1,
    title: "Roomassaare – Korfu",
    subtitle: "Läbi Euroopa Vahemere päikese poole",
    period: "2026",
    stages: [
      {
        id: "roomassaare",
        city: "Roomassaare",
        country: "Eesti",
        countryCode: "EST",
        duration: "Stardipunkt",
        distanceFromPrevious: null,
        coordinates: { lat: 58.2217, lng: 22.5017 },
        description: "Meie suur purjeseiklus algab Saaremaa südamest, Roomassaare sadamast. Eesti suurima saare merelised traditsioonid ja kaunis loodus on ideaalne lähtepunkt suurele purjereisile Vahemere poole.",
        highlights: ["Kuressaare linnus", "Saaremaa loodus", "Kaali meteoriidikraater", "Angla tuulikumägi"],
        activities: [],
        pricePerDay: 0,
        priceInfo: "Stardipunkt",
        arrivalDate: "20. juuli 2026",
        startDate: "20. jul",
        isStartPoint: true,
        image: "roomassaare-harbor"
      },
      {
        id: "kiel",
        city: "Kiel",
        country: "Saksamaa",
        countryCode: "GER",
        duration: "14 päeva",
        distanceFromPrevious: 660,
        coordinates: { lat: 54.3233, lng: 10.1228 },
        description: "Kiel on Läänemere üks olulisemaid sadamalinnu ja purjetamiskultuuri süda. Siit algab tee läbi Kieli kanali Põhjamere poole.",
        highlights: ["Kieler Förde laht", "Meremuuseum", "Kieli kanal", "Laboe mälestusmärk"],
        activities: ["Purjetamismuuseumi külastus", "Fjordi kruiis", "Saksa mereköök", "Kanaliteekonna algus"],
        pricePerDay: 120,
        priceInfo: "",
        arrivalDate: "3. august 2026",
        startDate: "3. aug",
        hasSailingTraining: true,
        image: "kiel-canal"
      },
      {
        id: "dusseldorf",
        city: "Düsseldorf",
        country: "Saksamaa",
        countryCode: "GER",
        duration: "7 päeva",
        distanceFromPrevious: 360,
        coordinates: { lat: 51.2277, lng: 6.7735 },
        description: "Reini äärne metropol ühendab kunsti, moodi ja äri. Düsseldorfi vanalinn on tuntud kui 'maailma pikim lett' oma arvukate pubide ja restoranidega.",
        highlights: ["Altstadt vanalinn", "Rheinturm", "Kunstimuuseumid", "Medienhafen"],
        activities: ["Altbieri proovimine", "Galeriiküla", "Reini promenaad", "Ostlemine Königs alleel"],
        pricePerDay: 120,
        priceInfo: "",
        arrivalDate: "10. august 2026",
        startDate: "10. aug",
        hasSailingTraining: true,
        image: "dusseldorf-rhine"
      },
      {
        id: "brest",
        city: "Brest",
        country: "Prantsusmaa",
        countryCode: "FRA",
        duration: "13 päeva",
        distanceFromPrevious: 600,
        coordinates: { lat: 48.3904, lng: -4.4861 },
        description: "Bretagne'i suurim sadamalinn Brest on tuntud oma merendusajaloo ja vapustavate rannikumaastikega. Océanopolis on Euroopa üks suurimaid mereakvaariume.",
        highlights: ["Océanopolis", "Brest'i kindlus", "Pont de Recouvrance", "Tanguy torn"],
        activities: ["Mereakvaariumi külastus", "Bretagne'i köök", "Kindluse avastamine", "Ranniku matkarajad"],
        pricePerDay: 120,
        priceInfo: "",
        arrivalDate: "23. august 2026",
        startDate: "23. aug",
        hasSailingTraining: true,
        image: "brest-castle"
      },
      {
        id: "vilamoura",
        city: "Vilamoura",
        country: "Portugal",
        countryCode: "POR",
        duration: "13 päeva",
        distanceFromPrevious: 680,
        coordinates: { lat: 37.0765, lng: -8.1136 },
        description: "Algarve ranniku pärl on üks Euroopa eksklusiivsemaid jahtide sihtkohti. Kuldne liiv, kristallselge vesi ja maailmatasemel golfiväljakud.",
        highlights: ["Marina de Vilamoura", "Falesia rand", "Loulé turg", "Benagili koobas"],
        activities: ["Delfiinide vaatamine", "Golfipartii", "Algarve köök", "Koobasretk paadiga"],
        pricePerDay: 120,
        priceInfo: "",
        arrivalDate: "5. september 2026",
        startDate: "5. sept",
        hasSailingTraining: true,
        image: "vilamoura-port"
      },
      {
        id: "moraira",
        city: "Moraira",
        country: "Hispaania",
        countryCode: "ESP",
        duration: "14 päeva",
        distanceFromPrevious: 560,
        coordinates: { lat: 38.6879, lng: 0.1375 },
        description: "Costa Blanca peidetud pärl säilitab endiselt kalurikülaliku võlu. Türkiissinine vesi ja valged majad loovad Vahemere idülli.",
        highlights: ["Cap d'Or", "El Portet rand", "Vanalinn", "Viinamarjaistandused"],
        activities: ["Snorgeldamine", "Kohalik mereköök", "Jalgsimatk Cap d'Orile", "Veinidegustatsioon"],
        pricePerDay: 120,
        priceInfo: "",
        arrivalDate: "19. september 2026",
        startDate: "19. sept",
        image: "moraira-beach"
      },
      {
        id: "nettuno",
        city: "Marina del Nettuno",
        country: "Sitsiilia, Itaalia",
        countryCode: "ITA",
        duration: "10 päeva",
        distanceFromPrevious: 750,
        coordinates: { lat: 38.19, lng: 15.56 },
        description: "Moraira'st Marina del Nettuno'sse viib tee läbi Ibiza, Mallorca ja Sardiinia. Messina väina ääres asuv Marina del Nettuno on strateegiline peatuspunkt teel Kreekasse. Sitsiilia vulkaaniline maastik, rikkalik köök ja tuhandeaastane ajalugu.",
        highlights: ["Ibiza & Mallorca", "Sardiinia", "Messina väin", "Etna vulkaan", "Taormina"],
        activities: ["Ibiza vanalinna avastamine", "Mallorca katedraal", "Sardiinia rannad", "Sitsiilia köögielamus", "Etna vaated"],
        pricePerDay: 120,
        priceInfo: "",
        arrivalDate: "29. september 2026",
        startDate: "29. sept",
        image: "marina-del-nettuno"
      },
      {
        id: "orikum",
        city: "Orikum",
        country: "Albaania",
        countryCode: "ALB",
        duration: "8 päeva",
        distanceFromPrevious: 350,
        coordinates: { lat: 40.3269, lng: 19.4314 },
        description: "Albaania Riviera peidetud aare – muistse Rooma sadama varemed kohtuvad puutumata looduse ja Albaania külalislahkusega.",
        highlights: ["Antiiksadam", "Llogara pass", "Drymades rannad", "Oricum arheoloogia park"],
        activities: ["Arheoloogi-retk", "Llogara rahvuspark", "Albaania köök", "Snorgeldamine"],
        pricePerDay: 120,
        priceInfo: "",
        arrivalDate: "7. oktoober 2026",
        startDate: "7. okt",
        image: "orikum-marina"
      },
      {
        id: "korfu",
        city: "Korfu",
        country: "Kreeka",
        countryCode: "GRE",
        duration: "3 päeva",
        distanceFromPrevious: 115,
        coordinates: { lat: 39.6243, lng: 19.9217 },
        description: "Joonia mere roheline pärl – Korfu ühendab kreeka, veneetsia ja briti mõjutused üheks ainulaadseks kultuurikogemuseks.",
        highlights: ["Kerkyra vanalinn", "Achilleion palee", "Paleokastritsa", "Sidari"],
        activities: ["Vanalinna avastamine", "Paleekülastus", "Rannakuurort", "Kreeka köök"],
        pricePerDay: 120,
        priceInfo: "",
        arrivalDate: "10. oktoober 2026",
        startDate: "10. okt",
        image: "corfu-agios-gordios"
      }
    ]
  },
  {
    id: 2,
    title: "Kreeka seiklused",
    subtitle: "Joonia ja Egeuse mere saarte vahel",
    period: "Oktoober–November 2026",
    stages: [
      {
        id: "lefkada",
        city: "Orikum – Korfu – Lefkada – Ateena",
        country: "Kreeka",
        countryCode: "GRE",
        duration: "10 päeva",
        distanceFromPrevious: null,
        coordinates: { lat: 38.7071, lng: 20.7094 },
        description: "Unustamatu teekond läbi Joonia mere saarte Ateenasse. Korfu rohelus, Lefkada valged kaljud ja Kreeka pealinna ajalugu.",
        highlights: ["Korfu vanalinn", "Lefkada kaljurannad", "Joonia saarestik", "Ateena Akropolis"],
        activities: ["Erinevate saarte külastused", "Snorgeldamine", "Kreeka tavern'id", "Ajaloo avastamine"],
        pricePerDay: 120,
        priceInfo: "",
        arrivalDate: "10. oktoober 2026",
        startDate: "10. okt",
        image: "joonia-meri"
      },
      {
        id: "egeuse",
        city: "Egeuse mere saared",
        country: "Kreeka",
        countryCode: "GRE",
        duration: "10 päeva",
        distanceFromPrevious: null,
        coordinates: { lat: 37.4467, lng: 25.3289 },
        description: "Egeuse mere võluv saarestik – Kykladid oma valge-sinise arhitektuuri ja kristallselge veega. Mykonos, Naxos, Paros, Santorin ja teised.",
        highlights: ["Mykonose tuulikud", "Delose saar", "Naxose templid", "Santorini loojangud"],
        activities: ["Erinevate saarte külastused", "Kreeka öised tavern'id", "Rannapäevad", "Ajaloo avastamine"],
        pricePerDay: 120,
        priceInfo: "",
        arrivalDate: "21. oktoober 2026",
        startDate: "21. okt",
        image: "santorini-cyclades"
      },
      {
        id: "ateena",
        city: "Ateena ümbruse saarestik",
        country: "Kreeka",
        countryCode: "GRE",
        duration: "10 päeva",
        distanceFromPrevious: null,
        coordinates: { lat: 37.7561, lng: 23.8584 },
        description: "Saronilise lahe saared Ateena lähedal – Aegina, Poros, Hydra, Spetses. Ideaalne nädal Kreeka nautimiseks ja hooaja lõpetamiseks.",
        highlights: ["Aegina templid", "Hydra eeslid", "Akropolis", "Piraeuse sadam"],
        activities: ["Kerge purjetamine", "Supelrannad", "Ateena muuseumid", "Lõpupidu"],
        pricePerDay: 120,
        priceInfo: "",
        arrivalDate: "30. oktoober 2026",
        startDate: "30. okt",
        image: "hydra-island"
      }
    ]
  }
];

// Total distance calculation for section 1
export const totalDistanceSection1 = 660 + 360 + 600 + 680 + 560 + 750 + 350 + 115; // = 4075 nm
