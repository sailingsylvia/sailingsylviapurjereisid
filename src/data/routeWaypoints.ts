export type LatLngTuple = [number, number];

// Map waypoints – individual cities shown as pins on the route map
export interface MapCity {
  id: string;
  name: string;
  countryCode: string;
  coordinates: { lat: number; lng: number };
  date: string; // short date shown on label
}

export const mapCities: MapCity[] = [
  { id: "roomassaare", name: "Roomassaare", countryCode: "EST", coordinates: { lat: 58.2217, lng: 22.5017 }, date: "20. jul" },
  { id: "kiel", name: "Kiel", countryCode: "GER", coordinates: { lat: 54.3233, lng: 10.1228 }, date: "3. aug" },
  { id: "dusseldorf", name: "Düsseldorf", countryCode: "GER", coordinates: { lat: 51.2277, lng: 6.7735 }, date: "10. aug" },
  { id: "brest", name: "Brest", countryCode: "FRA", coordinates: { lat: 48.3904, lng: -4.4861 }, date: "23. aug" },
  { id: "vilamoura", name: "Vilamoura", countryCode: "POR", coordinates: { lat: 37.0765, lng: -8.1136 }, date: "5. sept" },
  { id: "moraira", name: "Moraira", countryCode: "ESP", coordinates: { lat: 38.6879, lng: 0.1375 }, date: "19. sept" },
  { id: "nettuno", name: "M. del Nettuno", countryCode: "ITA", coordinates: { lat: 38.19, lng: 15.56 }, date: "29. sept" },
  { id: "orikum", name: "Orikum", countryCode: "ALB", coordinates: { lat: 40.3269, lng: 19.4314 }, date: "7. okt" },
  { id: "ateena", name: "Ateena", countryCode: "GRE", coordinates: { lat: 37.9364, lng: 23.6445 }, date: "15. okt" },
];

// Hand-tuned waypoints to keep the drawn route visually on water
// Key format: "fromId->toId" where ids come from mapCities above.
export const routeLegWaypoints: Record<string, LatLngTuple[]> = {
  // Baltic Sea → Danish Straits → Kiel Bay
  "roomassaare->kiel": [
    [57.6, 20.2],
    [56.6, 18.3],
    [55.7, 15.2],
    [55.68, 12.60],
    [54.85, 11.25],
  ],

  // Kiel Canal + North Sea + Rhine mouth
  "kiel->dusseldorf": [
    [53.892, 9.142],
    [53.861, 8.714],
    [54.182, 7.886],
    [53.50, 6.20],
    [51.949, 4.143],
    [51.90, 5.50],
    [51.433, 6.769],
  ],

  // Rhine mouth → North Sea → English Channel → Brest
  "dusseldorf->brest": [
    [51.90, 5.50],
    [51.949, 4.143],
    [51.08, 2.55],
    [50.30, 0.20],
    [49.645, -1.622],
    [48.80, -3.50],
  ],

  // Bay of Biscay → Portuguese coast
  "brest->vilamoura": [
    [47.0, -6.0],
    [45.5, -7.5],
    [43.6, -9.3],
    [41.15, -9.6],
    [38.7, -9.6],
    [37.02, -9.0],
  ],

  // Algarve → Gibraltar → Mediterranean coast of Spain
  "vilamoura->moraira": [
    [37.02, -9.0],
    [36.53, -6.28],
    [36.14, -5.35],
    [36.72, -4.42],
    [36.83, -2.46],
    [37.60, -0.99],
    [38.35, -0.48],
  ],

  // Moraira → south of Ibiza → south of Mallorca → south of Sardinia → Sicily strait
  "moraira->nettuno": [
    [38.50, 0.60],
    [38.30, 1.30],
    [38.80, 2.60],
    [39.10, 3.40],
    [38.60, 5.50],
    [38.20, 7.60],
    [38.80, 9.50],
    [38.40, 11.20],
    [38.00, 13.00],
    [38.10, 15.20],
  ],

  // Strait of Messina → Ionian Sea → Orikum
  "nettuno->orikum": [
    [38.30, 16.50],
    [39.00, 17.80],
    [39.80, 18.37],
    [40.15, 18.80],
  ],

  // Orikum → around Peloponnese → Ateena (Piraeus)
  "orikum->ateena": [
    [39.60, 19.80],
    [38.80, 20.30],
    [38.20, 20.80],
    [37.60, 21.00],
    [37.00, 21.50],
    [36.50, 22.50],
    [36.80, 23.10],
    [37.40, 23.50],
  ],
};
