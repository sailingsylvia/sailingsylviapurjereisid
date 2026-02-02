export interface VoyageStage {
  id: number;
  city: string;
  country: string;
  countryCode: string;
  arrivalDate: string;
  distanceFromPrevious: number | null;
  coordinates: { lat: number; lng: number };
  description: string;
  highlights: string[];
  activities: string[];
}

export const voyageStages: VoyageStage[] = [
  {
    id: 1,
    city: "Tallinn",
    country: "Eesti",
    countryCode: "EST",
    arrivalDate: "29. juuli",
    distanceFromPrevious: null,
    coordinates: { lat: 59.437, lng: 24.7536 },
    description: "Meie seiklus algab Eesti pealinnast Tallinnast, kus keskaegsed müürid kohtuvad kaasaegse innovatsiooniga. UNESCO maailmapärandi nimekirja kuuluv vanalinn on ideaalne koht reisi alustamiseks.",
    highlights: ["UNESCO vanalinn", "Kadrioru loss", "Telliskivi loomelinnak", "Lennusadam"],
    activities: ["Vanalinna ekskursioon", "Eesti köök", "Merendusmuuseum", "Rannapromenaad"]
  },
  {
    id: 2,
    city: "Kiel",
    country: "Saksamaa",
    countryCode: "GER",
    arrivalDate: "9. august",
    distanceFromPrevious: 650,
    coordinates: { lat: 54.3233, lng: 10.1228 },
    description: "Kiel on Läänemere üks olulisemaid sadamalinnu ja purjetamiskultuuri süda. Siin toimub igal aastal maailma suurim purjetamisüritus Kieler Woche.",
    highlights: ["Kieler Förde laht", "Meremuuseum", "Holstenstraße", "Laboe mälestusmärk"],
    activities: ["Purjetamismuuseumi külastus", "Fjordi kruiis", "Saksa mereköök", "Rannajalutuskäik"]
  },
  {
    id: 3,
    city: "Calais",
    country: "Prantsusmaa",
    countryCode: "FRA",
    arrivalDate: "19. august",
    distanceFromPrevious: 450,
    coordinates: { lat: 50.9513, lng: 1.8587 },
    description: "Calais on ajalooline sadamalinn La Manche'i väina ääres. Siit algab tee Prantsuse Rivierale ja lõunasse.",
    highlights: ["Rodini skulptuur", "Calais' pitsimuuseum", "Hôtel de Ville", "Rannapark"],
    activities: ["Pitsimuuseumi külastus", "Prantsuse gurmeeköök", "Ajalooline jalutuskäik", "Cap Blanc-Nezi vaade"]
  },
  {
    id: 4,
    city: "Brest",
    country: "Prantsusmaa",
    countryCode: "FRA",
    arrivalDate: "27. august",
    distanceFromPrevious: 350,
    coordinates: { lat: 48.3904, lng: -4.4861 },
    description: "Bretagne'i suurim sadamalinn Brest on tuntud oma merendusajaloo ja vapustavate rannikumaastikega. Océanopolis on Euroopa suurim mereakvaarium.",
    highlights: ["Océanopolis", "Brest' kindlus", "Pont de Recouvrance", "Tanguy torn"],
    activities: ["Mereakvaariumi külastus", "Bretagne'i köök", "Kindluse avastamine", "Ranniku matkarajad"]
  },
  {
    id: 5,
    city: "Lissabon",
    country: "Portugal",
    countryCode: "POR",
    arrivalDate: "7. september",
    distanceFromPrevious: 650,
    coordinates: { lat: 38.7223, lng: -9.1393 },
    description: "Portugali pealinn seitsmel künkal on avastajate linn, kust algas Vasco da Gama teekond Indiasse. Fado, pastéis de nata ja hingematvad vaated ootavad.",
    highlights: ["Belém torn", "Jerónimose klooster", "Alfama", "LX Factory"],
    activities: ["Tramm 28", "Fado kontsert", "Pastéis de Belém", "Sintra päevaretk"]
  },
  {
    id: 6,
    city: "Gibraltar",
    country: "Gibraltar",
    countryCode: "GIB",
    arrivalDate: "12. september",
    distanceFromPrevious: 300,
    coordinates: { lat: 36.1408, lng: -5.3536 },
    description: "Legendaarne Heraklese sammas, kus Vahemeri kohtub Atlandi ookeaniga. Gibraltar Rock pakub hingematvaid vaateid kahele kontinendile.",
    highlights: ["Gibraltar Rock", "Ahvide koloonia", "St. Michael's Cave", "Europa Point"],
    activities: ["Kaablitrammiga tippu", "Ahvide vaatlemine", "Koobaste avastamine", "Aafrika vaatamine"]
  },
  {
    id: 7,
    city: "Valencia",
    country: "Hispaania",
    countryCode: "ESP",
    arrivalDate: "18. september",
    distanceFromPrevious: 600,
    coordinates: { lat: 39.4699, lng: -0.3763 },
    description: "Valencia on paella sünnilinn ja Hispaania kolmas suurim linn. Futuristlik Kunstide ja Teaduste Linn on arhitektuuriime.",
    highlights: ["Ciudad de las Artes y las Ciencias", "La Lonja", "Turia park", "Keskne turg"],
    activities: ["Paella kursus", "Oceanográfic akvaarium", "Jalgrattasõit Turias", "Tapas-baar tuur"]
  },
  {
    id: 8,
    city: "Mallorca",
    country: "Hispaania",
    countryCode: "ESP",
    arrivalDate: "22. september",
    distanceFromPrevious: 200,
    coordinates: { lat: 39.5696, lng: 2.6502 },
    description: "Baleaari saarte pärl on purjetajate paradiis. Palma katedraal, Serra de Tramuntana mäed ja kristallselge vesi.",
    highlights: ["Palma katedraal", "Serra de Tramuntana", "Valldemossa", "Sólleri tramm"],
    activities: ["Katedraali külastus", "Mägimatk", "Oliivisaagi maitsetest", "Rannapäev"]
  },
  {
    id: 9,
    city: "Monaco",
    country: "Monaco",
    countryCode: "MON",
    arrivalDate: "26. september",
    distanceFromPrevious: 450,
    coordinates: { lat: 43.7384, lng: 7.4246 },
    description: "Maailma teise väikseim riik pakub ületamatut glamuuri. Monte Carlo kasiino, printsikoda ja Formula 1 rada.",
    highlights: ["Monte Carlo kasiino", "Printsikoda", "Eksootne aed", "Oceanograafia muuseum"],
    activities: ["Kasiino külastus", "Printsikoja avastamine", "Gurmeelõuna", "F1 raja jalutuskäik"]
  },
  {
    id: 10,
    city: "Rooma",
    country: "Itaalia",
    countryCode: "ITA",
    arrivalDate: "6. oktoober",
    distanceFromPrevious: 300,
    coordinates: { lat: 41.9028, lng: 12.4964 },
    description: "Igavene linn, kus iga nurga taga ootab ajalugu. Civitavecchia sadamast on Rooma vaid rongitunnine.",
    highlights: ["Colosseum", "Vatikan", "Trevi purskkaev", "Pantheon"],
    activities: ["Foorumi avastamine", "Vatikani muuseumid", "Itaalia köök", "Trastevere õhtusöök"]
  },
  {
    id: 11,
    city: "Vieste",
    country: "Itaalia",
    countryCode: "ITA",
    arrivalDate: "19. oktoober",
    distanceFromPrevious: 450,
    coordinates: { lat: 41.8819, lng: 16.1769 },
    description: "Gargano poolsaare pärl on üks Itaalia kaunimaid rannikupaiku. Valged kivimajad, türkiisne vesi ja maaliline vanalinn.",
    highlights: ["Vanalinn", "Pizzomunno kalju", "Trabucchi", "Gargano rahvuspark"],
    activities: ["Koobaste paadireis", "Kohalik mereköök", "Vanalinnas eksimine", "Rahvuspargi matk"]
  },
  {
    id: 12,
    city: "Split",
    country: "Horvaatia",
    countryCode: "CRO",
    arrivalDate: "1. november",
    distanceFromPrevious: 200,
    coordinates: { lat: 43.5081, lng: 16.4402 },
    description: "Diocletianuse palee on elav muinsuskaitseobjekt, kus inimesed elavad juba 1700 aastat. Dalmaatsia kultuur ja köök ühes kohas.",
    highlights: ["Diocletianuse palee", "Riva promenaad", "Marjani mägi", "Katedraal"],
    activities: ["Palee avastamine", "Dalmaatsia vein", "Marjani matk", "Trogiri päevaretk"]
  },
  {
    id: 13,
    city: "Patras",
    country: "Kreeka",
    countryCode: "GRE",
    arrivalDate: "11. november",
    distanceFromPrevious: 550,
    coordinates: { lat: 38.2466, lng: 21.7346 },
    description: "Kreeka kolmas suurim linn on värav Peloponnesosele. Siin asub Rio-Antirrio sild, Euroopa pikim rippsild.",
    highlights: ["Rio-Antirrio sild", "Kindlus", "Achaia Clauss veinimõis", "Ajalooline keskus"],
    activities: ["Veinidegustatsioon", "Silla ülemine", "Kreeka köök", "Olympia päevaretk"]
  },
  {
    id: 14,
    city: "Valletta",
    country: "Malta",
    countryCode: "MLT",
    arrivalDate: "21. november",
    distanceFromPrevious: 650,
    coordinates: { lat: 35.8997, lng: 14.5146 },
    description: "Johanniitide ordni ajalugu ja Vahemere suurim loodusliku sadamaga linnriik. Iga hoone on ajalugu.",
    highlights: ["St. John's Co-Cathedral", "Grand Harbour", "Upper Barrakka Gardens", "Mdina"],
    activities: ["Kindluste avastamine", "Harbour kruiis", "Malta köök", "Mdina päevaretk"]
  },
  {
    id: 15,
    city: "Tenerife",
    country: "Hispaania",
    countryCode: "ESP",
    arrivalDate: "23. detsember",
    distanceFromPrevious: 750,
    coordinates: { lat: 28.4636, lng: -16.2518 },
    description: "Kanaari saarte suurim saar ja reisi finišikoht. Teide vulkaan, igavene kevad ja jõulusoojus.",
    highlights: ["Teide rahvuspark", "La Laguna", "Anaga mäed", "Los Gigantes kaljud"],
    activities: ["Teide tipp", "Vaaladevatlus", "La Laguna jalutuskäik", "Rannapuhkus"]
  }
];
