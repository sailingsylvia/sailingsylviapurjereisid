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

  // Kiel Canal + North Sea + Rhine
  "kiel->dusseldorf": [
    [53.892, 9.142],
    [53.861, 8.714],
    [54.182, 7.886],
    [51.949, 4.143],
    [51.433, 6.769],
  ],

  // Rhine → North Sea → English Channel
  "dusseldorf->brest": [
    [51.949, 4.143],
    [51.08, 2.55],
    [49.645, -1.622],
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

  // Moraira → Ibiza → Mallorca → Sardinia → Sicily
  "moraira->nettuno": [
    [38.85, 0.50],
    [38.91, 1.42],
    [39.57, 2.65],
    [39.80, 4.30],
    [40.12, 9.01],
    [39.21, 9.12],
    [38.60, 11.80],
    [38.12, 13.36],
    [38.22, 15.24],
  ],

  // Strait of Messina → across Ionian Sea → Orikum
  "nettuno->orikum": [
    [38.30, 16.50],
    [39.80, 18.37],
    [40.15, 18.50],
  ],
};