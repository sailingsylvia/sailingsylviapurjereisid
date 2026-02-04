export type LatLngTuple = [number, number];

// Hand-tuned waypoints to keep the drawn route visually on water (or major waterways)
// instead of straight segments that cut over land at small zoom levels.
//
// Key format: "fromId->toId" where ids come from VoyageStage.id in voyageData.
export const routeLegWaypoints: Record<string, LatLngTuple[]> = {
  // Baltic Sea → Danish Straits → Kiel Bay (avoid cutting across land)
  "roomassaare->kiel": [
    [57.6, 20.2], // Baltic Sea (west of Saaremaa)
    [56.6, 18.3], // east of Gotland
    [55.7, 15.2], // south Baltic
    [55.68, 12.60], // Øresund / Copenhagen area
    [54.85, 11.25], // Fehmarn Belt
  ],

  // Bay of Biscay → Portuguese coast (avoid cutting across Iberian peninsula)
  "brest->vilamoura": [
    [47.0, -6.0], // Bay of Biscay
    [45.5, -7.5],
    [43.6, -9.3], // off Galicia / Cape Finisterre
    [41.15, -9.6], // off Porto
    [38.7, -9.6], // off Lisbon
    [37.02, -9.0], // Cabo de São Vicente
  ],

  // Kiel Canal + North Sea + Rhine (visual approximation)
  "kiel->dusseldorf": [
    [53.892, 9.142], // Brunsbüttel (Kiel Canal west end)
    [53.861, 8.714], // Cuxhaven (Elbe mouth)
    [54.182, 7.886], // Helgoland (North Sea)
    [51.949, 4.143], // Rotterdam (Rhine delta)
    [51.433, 6.769], // Duisburg (Rhine)
  ],

  // Rhine → North Sea → English Channel (visual approximation)
  "dusseldorf->brest": [
    [51.949, 4.143], // Rotterdam
    [51.08, 2.55], // Dunkirk/Channel entry
    [49.645, -1.622], // Cherbourg
  ],

  // Algarve → Gibraltar → Mediterranean coast of Spain
  "vilamoura->moraira": [
    [37.02, -9.0], // Cabo de São Vicente (keep line on sea)
    [36.53, -6.28], // Cádiz
    [36.14, -5.35], // Gibraltar
    [36.72, -4.42], // Málaga
    [36.83, -2.46], // Almería
    [37.60, -0.99], // Cartagena
    [38.35, -0.48], // Alicante
  ],

  // Around Italy (avoid cutting across the peninsula) – visual approximation
  "sardiinia->orikum": [
    [39.214, 9.118], // Cagliari (Sardinia south)
    [38.12, 13.36], // Palermo (north Sicily)
    [38.22, 15.24], // Milazzo (NE Sicily)
    [38.19, 15.56], // Strait of Messina
    [39.80, 18.37], // Santa Maria di Leuca (heel of Italy)
    [40.15, 18.50], // Otranto
  ],
};
