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
}

export interface VoyageSection {
  id: number;
  title: string;
  subtitle: string;
  period: string;
  stages: VoyageStage[];
}

export const voyageSections: VoyageSection[] = [
  {
    id: 1,
    title: "Roomassaare – Korfu",
    subtitle: "Läbi Euroopa Vahemere päikese poole",
    period: "2026",
    stages: [
      {
        id: "1.1",
        city: "Roomassaare",
        country: "Eesti",
        countryCode: "EST",
        duration: "14 ööpäeva",
        distanceFromPrevious: null,
        coordinates: { lat: 58.2217, lng: 22.5017 },
        description: "Meie seiklus algab Saaremaa südamest, Roomassaare sadamast. Eesti suurima saare merelised traditsioonid ja kaunis loodus on ideaalne lähtepunkt suurele purjereisile.",
        highlights: ["Kuressaare linnus", "Saaremaa loodus", "Kaali meteoriidikraater", "Angla tuulikumägi"],
        activities: ["Kohaliku kala degusteerimine", "Linnamüüride avastamine", "Spaapuhkus", "Rannajalutuskäik"]
      },
      {
        id: "1.2",
        city: "Kiel",
        country: "Saksamaa",
        countryCode: "GER",
        duration: "7 ööpäeva",
        distanceFromPrevious: 660,
        coordinates: { lat: 54.3233, lng: 10.1228 },
        description: "Kiel on Läänemere üks olulisemaid sadamalinnu ja purjetamiskultuuri süda. Siit algab tee läbi Kieli kanali Põhjamere poole.",
        highlights: ["Kieler Förde laht", "Meremuuseum", "Kieli kanal", "Laboe mälestusmärk"],
        activities: ["Purjetamismuuseumi külastus", "Fjordi kruiis", "Saksa mereköök", "Kanaliteekonna algus"]
      },
      {
        id: "1.3",
        city: "Düsseldorf",
        country: "Saksamaa",
        countryCode: "GER",
        duration: "13 ööpäeva",
        distanceFromPrevious: 360,
        coordinates: { lat: 51.2277, lng: 6.7735 },
        description: "Reini äärne metropol ühendab kunsti, moodi ja äri. Düsseldorfi vanalinn on tuntud kui 'maailma pikim leti' oma arvukate pubide ja restoranidega.",
        highlights: ["Altstadt vanalinn", "Rheinturm", "Kunstimuuseumid", "Medienhafen"],
        activities: ["Altbieriproovimine", "Galeriiküla", "Reini promenaad", "Ostlemine Königsallee'l"]
      },
      {
        id: "1.4",
        city: "Brest",
        country: "Prantsusmaa",
        countryCode: "FRA",
        duration: "13 ööpäeva",
        distanceFromPrevious: 600,
        coordinates: { lat: 48.3904, lng: -4.4861 },
        description: "Bretagne'i suurim sadamalinn Brest on tuntud oma merendusajaloo ja vapustavate rannikumaastikega. Océanopolis on Euroopa üks suurimaid mereakvaariume.",
        highlights: ["Océanopolis", "Brest'i kindlus", "Pont de Recouvrance", "Tanguy torn"],
        activities: ["Mereakvaariumi külastus", "Bretagne'i köök", "Kindluse avastamine", "Ranniku matkarajad"]
      },
      {
        id: "1.5",
        city: "Vilamoura",
        country: "Portugal",
        countryCode: "POR",
        duration: "14 ööpäeva",
        distanceFromPrevious: 680,
        coordinates: { lat: 37.0765, lng: -8.1136 },
        description: "Algarve ranniku pärl on üks Euroopa eksklusiivsemaid jahtide sihtkohti. Kuldne liiv, kristallselge vesi ja maailmatasemel golfiväljakud.",
        highlights: ["Marina de Vilamoura", "Falesia rand", "Loulé turg", "Benagili koobas"],
        activities: ["Delfiinide vaatamine", "Golfipartii", "Algarve köök", "Koobasretk paadiga"]
      },
      {
        id: "1.6",
        city: "Moraira",
        country: "Hispaania",
        countryCode: "ESP",
        duration: "1 ööpäev",
        distanceFromPrevious: 560,
        coordinates: { lat: 38.6879, lng: 0.1375 },
        description: "Costa Blanca peidetud pärl säilitab endiselt kalurikülaliku võlu. Türkiisne vesi ja valged majad loovad Vahemere idülli.",
        highlights: ["Cap d'Or", "El Portet rand", "Vanalinn", "Viinamarjaistandused"],
        activities: ["Snorgeldamine", "Kohalik mereköök", "Jalgsimatk Cap d'Orile", "Veinidegustatsioon"]
      },
      {
        id: "1.7",
        city: "Ibiza",
        country: "Hispaania",
        countryCode: "ESP",
        duration: "1 ööpäev",
        distanceFromPrevious: 100,
        coordinates: { lat: 38.9067, lng: 1.4206 },
        description: "Ibiza on enamat kui peolinn – UNESCO vanalinn, kristallselged lahesopid ja Vahemere autentseim boheemlik atmosfäär.",
        highlights: ["Dalt Vila vanalinn", "Es Vedrà", "Ses Salines", "Hippieturud"],
        activities: ["Vanalinna jalutuskäik", "Loojangukruiis", "Soolajärvede külastus", "Rannapäev"]
      },
      {
        id: "1.8",
        city: "Mallorca",
        country: "Hispaania",
        countryCode: "ESP",
        duration: "2 ööpäeva",
        distanceFromPrevious: 75,
        coordinates: { lat: 39.5696, lng: 2.6502 },
        description: "Baleaari saarte pärl on purjetajate paradiis. Palma katedraal, Serra de Tramuntana mäed ja kristallselge vesi.",
        highlights: ["Palma katedraal", "Serra de Tramuntana", "Valldemossa", "Sólleri tramm"],
        activities: ["Katedraali külastus", "Mägimatk", "Oliivisaagi maitseelamus", "Rannapäev"]
      },
      {
        id: "1.9",
        city: "Sardiinia",
        country: "Itaalia",
        countryCode: "ITA",
        duration: "14 ööpäeva",
        distanceFromPrevious: 330,
        coordinates: { lat: 40.1209, lng: 9.0129 },
        description: "Vahemere üks ilusamaid saari pakub kristallselgeid veekogusid, muistseid traditsoone ja maailmakuulsat Costa Smeralda glamuuri.",
        highlights: ["Costa Smeralda", "Nuraghe kompleksid", "La Maddalena saarestik", "Cala Luna"],
        activities: ["Paadireis La Maddalenale", "Nuraghe'de avastamine", "Sardiinia köök", "Snorgeldamine"]
      },
      {
        id: "1.10",
        city: "Orikum",
        country: "Albaania",
        countryCode: "ALB",
        duration: "3 ööpäeva",
        distanceFromPrevious: 620,
        coordinates: { lat: 40.3269, lng: 19.4314 },
        description: "Albaania Riviera peidetud aare – muistse Rooma sadama varemed kohtuvad puutumata looduse ja Albaania külalislahkusega.",
        highlights: ["Antiiksadam", "Llogara pass", "Drymadesrannad", "Oricum arheoloogia park"],
        activities: ["Arheoloogi-retk", "Llogara rahvuspark", "Albaania köök", "Snorgeldamine"]
      },
      {
        id: "1.11",
        city: "Korfu",
        country: "Kreeka",
        countryCode: "GRE",
        duration: "Sihtkoht",
        distanceFromPrevious: 115,
        coordinates: { lat: 39.6243, lng: 19.9217 },
        description: "Joonia mere roheline pärl – Korfu ühendab kreeka, veneetsia ja briti mõjutused üheks ainulaadseks kultuurikogemuseks.",
        highlights: ["Kerkyra vanalinn", "Achilleion palee", "Paleokastritsa", "Sidari"],
        activities: ["Vanalinna avastamine", "Paleekülastus", "Rannakuurort", "Kreeka köök"]
      }
    ]
  },
  {
    id: 2,
    title: "Kreeka seiklused",
    subtitle: "Joonia ja Egeuse mere saarte vahel",
    period: "September–Oktoober 2026",
    stages: [
      {
        id: "2.1",
        city: "Orikum – Korfu – Lefkada – Ateena",
        country: "Kreeka",
        countryCode: "GRE",
        duration: "10 päeva",
        distanceFromPrevious: null,
        coordinates: { lat: 38.7071, lng: 20.7094 },
        description: "Unustamatu teekond läbi Joonia mere saarte Ateenasse. Korfu rohelus, Lefkada valged kaljud ja Kreeka pealinna ajalugu.",
        highlights: ["Korfu vanalinn", "Lefkada kaljurannad", "Joonia saarestik", "Ateena Akropolis"],
        activities: ["Saartevahelised üleminekud", "Snorgeldamine", "Kreeka tavern'id", "Ajaloo avastamine"]
      },
      {
        id: "2.2",
        city: "Egeuse mere saared I",
        country: "Kreeka",
        countryCode: "GRE",
        duration: "10 päeva",
        distanceFromPrevious: null,
        coordinates: { lat: 37.4467, lng: 25.3289 },
        description: "Egeuse mere võluv saarestik – Kykladid oma valge-sinise arhitektuuri ja kristallselge veega. Mykonos, Naxos, Paros ja teised.",
        highlights: ["Mykonose tuulikud", "Delose saar", "Naxose templid", "Parose külad"],
        activities: ["Saartehüpped", "Kreeka öised tavern'id", "Rannapäevad", "Ajaloo avastamine"]
      },
      {
        id: "2.3",
        city: "Egeuse mere saared II",
        country: "Kreeka",
        countryCode: "GRE",
        duration: "10 päeva",
        distanceFromPrevious: null,
        coordinates: { lat: 36.4618, lng: 25.3753 },
        description: "Teine Egeuse mere saartering – Santorin, Ios, Amorgos ja teised kaunid Kykladide saared.",
        highlights: ["Santorini loojangud", "Ios rannad", "Amorgose klooster", "Vulkaanilised maastikud"],
        activities: ["Loojanguvaatlus", "Ujumine", "Kohalik vein", "Fotograafia"]
      },
      {
        id: "2.4",
        city: "Ateena ümbruse saarestik I",
        country: "Kreeka",
        countryCode: "GRE",
        duration: "10 päeva",
        distanceFromPrevious: null,
        coordinates: { lat: 37.7561, lng: 23.8584 },
        description: "Saronilise lahe saared Ateena lähedal – Aegina, Poros, Hydra, Spetses. Ideaalne nädal Kreeka nautimiseks.",
        highlights: ["Aegina templid", "Hydra eeslid", "Poros rohelus", "Spetses ajalugu"],
        activities: ["Kerge purjetamine", "Supelrannad", "Kohalik toit", "Saarte avastamine"]
      },
      {
        id: "2.5",
        city: "Ateena ümbruse saarestik II",
        country: "Kreeka",
        countryCode: "GRE",
        duration: "10 päeva",
        distanceFromPrevious: null,
        coordinates: { lat: 37.3175, lng: 23.1461 },
        description: "Saronilise lahe ja Argoolise lahe piirkond – Kreeka ajaloo süda. Navplion, Epidauros, Monemvasia.",
        highlights: ["Navplioni kindlus", "Epidaurose teater", "Monemvasia linnus", "Peloponnesose rannik"],
        activities: ["Teatrietendus", "Ajalootuurid", "Kohalikud veinimõisad", "Rannapuhkus"]
      },
      {
        id: "2.6",
        city: "Ateena ümbruse saarestik III",
        country: "Kreeka",
        countryCode: "GRE",
        duration: "10 päeva",
        distanceFromPrevious: null,
        coordinates: { lat: 37.9838, lng: 23.7275 },
        description: "Hooaja lõpetamine Ateenas – viimane võimalus nautida Kreeka sügist enne jahtide talvitumist.",
        highlights: ["Akropolis", "Plaka", "Piraeuse sadam", "Atika rannik"],
        activities: ["Ateena muuseumid", "Toidutuur", "Lõpupidu", "Kultuurielamused"]
      }
    ]
  }
];

// Total distance calculation for section 1
export const totalDistanceSection1 = 660 + 360 + 600 + 680 + 560 + 100 + 75 + 330 + 620 + 115; // = 4100 nm
