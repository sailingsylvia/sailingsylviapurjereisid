import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Navigation } from "lucide-react";
import { routeLegWaypoints, mapCities } from "@/data/routeWaypoints";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Distances between consecutive map cities (nM)
const legDistances: Record<string, number> = {
  "roomassaare->kiel": 660,
  "kiel->dusseldorf": 360,
  "dusseldorf->brest": 600,
  "brest->vilamoura": 680,
  "vilamoura->moraira": 560,
  "moraira->nettuno": 750,
  "nettuno->orikum": 350,
  "orikum->ateena": 350,
};

const InteractiveMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const cities = mapCities;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [45, 5],
      zoom: 4,
      scrollWheelZoom: false,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    // ---- Route coordinates (with water waypoints) ----
    const routeCoordinates: [number, number][] = [];
    for (let i = 0; i < cities.length; i++) {
      const stage = cities[i];
      if (i === 0) {
        routeCoordinates.push([stage.coordinates.lat, stage.coordinates.lng]);
        continue;
      }
      const from = cities[i - 1];
      const to = stage;
      const key = `${from.id}->${to.id}`;
      const via = routeLegWaypoints[key] ?? [];
      routeCoordinates.push(...via);
      routeCoordinates.push([to.coordinates.lat, to.coordinates.lng]);
    }

    // Dashed route line
    L.polyline(routeCoordinates, {
      color: "hsl(199, 89%, 48%)",
      weight: 2,
      opacity: 0.75,
      dashArray: "8, 6",
    }).addTo(map);

    // ---- Pin icon ----
    const createPinIcon = (isStart: boolean) => {
      const size = isStart ? 32 : 24;
      const innerSize = isStart ? 12 : 8;
      const color = "hsl(199, 89%, 48%)";
      return L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:${size}px;height:${size + 6}px;">
            <svg width="${size}" height="${size + 6}" viewBox="0 0 ${size} ${size + 6}" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M${size / 2} ${size + 4} C${size / 2} ${size + 4} ${size - 2} ${size * 0.55} ${size - 2} ${size / 2.2} C${size - 2} ${size / 5} ${size * 0.78} 2 ${size / 2} 2 C${size * 0.22} 2 2 ${size / 5} 2 ${size / 2.2} C2 ${size * 0.55} ${size / 2} ${size + 4} ${size / 2} ${size + 4} Z" fill="${color}" stroke="white" stroke-width="2"/>
              <circle cx="${size / 2}" cy="${size / 2.2}" r="${innerSize / 2}" fill="white"/>
            </svg>
          </div>`,
        iconSize: [size, size + 6],
        iconAnchor: [size / 2, size + 4],
      });
    };

    // Per-city tooltip direction & offset overrides
    const cityTooltipConfig: Record<string, { direction: L.Direction; offset: [number, number] }> = {
      kiel:       { direction: "top",   offset: [0, -36] },
      dusseldorf: { direction: "right", offset: [15, -18] },
      vilamoura:  { direction: "left",  offset: [-10, -18] },
      orikum:     { direction: "bottom",offset: [0, 54] },
      nettuno:    { direction: "left",  offset: [-15, -40] },
    };

    // ---- City markers with permanent tooltips anchored to pin ----
    cities.forEach((stage, index) => {
      const isStart = index === 0;
      const latlng: L.LatLngExpression = [stage.coordinates.lat, stage.coordinates.lng];

      const marker = L.marker(latlng, {
        icon: createPinIcon(isStart),
        zIndexOffset: 1000,
      }).addTo(map);

      const tooltipHtml = `
        <div style="
          display:inline-flex;
          flex-direction:column;
          align-items:flex-start;
          background:rgba(15,23,42,0.92);
          padding:4px 8px;
          border-radius:4px;
          font-size:10px;
          font-weight:600;
          color:#f8fafc;
          white-space:nowrap;
          box-shadow:0 3px 10px rgba(0,0,0,0.3);
          line-height:1.3;
          pointer-events:none;
        ">
          <div style="display:flex;align-items:baseline;gap:3px;">
            <span>${stage.name}</span>
            <span style="color:rgba(248,250,252,0.6);font-weight:500;font-size:8px;">(${stage.countryCode})</span>
          </div>
          ${stage.date ? `<div style="font-size:9px;color:rgba(248,250,252,0.65);font-weight:500;">${stage.date}</div>` : ""}
        </div>`;

      const custom = cityTooltipConfig[stage.id];
      const direction: L.Direction = isStart ? "right" : (custom?.direction ?? "top");
      const offset: [number, number] = isStart ? [12, -10] : (custom?.offset ?? [0, -30]);

      marker.bindTooltip(tooltipHtml, {
        permanent: true,
        direction,
        offset,
        className: "sylvia-city-tooltip",
        opacity: 1,
      });
    });

    // ---- Distance labels on route midpoints ----
    for (let i = 1; i < cities.length; i++) {
      const from = cities[i - 1];
      const to = cities[i];
      const key = `${from.id}->${to.id}`;
      const distance = legDistances[key];
      if (!distance) continue;

      const via = routeLegWaypoints[key] ?? [];
      const segCoords: [number, number][] = [
        [from.coordinates.lat, from.coordinates.lng],
        ...via,
        [to.coordinates.lat, to.coordinates.lng],
      ];

      // Find geographic midpoint along the segment and direction
      let totalLen = 0;
      const segLens: number[] = [];
      for (let k = 1; k < segCoords.length; k++) {
        const [lat1, lng1] = segCoords[k - 1];
        const [lat2, lng2] = segCoords[k];
        const d = Math.hypot(lat2 - lat1, lng2 - lng1);
        segLens.push(d);
        totalLen += d;
      }
      const half = totalLen / 2;
      let acc = 0;
      let midLat = segCoords[0][0];
      let midLng = segCoords[0][1];
      let dirAngle = 0; // degrees, 0 = right
      for (let k = 0; k < segLens.length; k++) {
        if (acc + segLens[k] >= half) {
          const t = (half - acc) / segLens[k];
          midLat = segCoords[k][0] + t * (segCoords[k + 1][0] - segCoords[k][0]);
          midLng = segCoords[k][1] + t * (segCoords[k + 1][1] - segCoords[k][1]);
          // Calculate direction angle (in screen coords: lng increases right, lat increases up)
          const dLng = segCoords[k + 1][1] - segCoords[k][1];
          const dLat = segCoords[k + 1][0] - segCoords[k][0];
          dirAngle = Math.atan2(-dLat, dLng) * (180 / Math.PI); // negative dLat because screen Y is inverted
          break;
        }
        acc += segLens[k];
      }

      const distIcon = L.divIcon({
        className: "",
        html: `
          <div style="
            display:inline-flex;
            align-items:center;
            gap:3px;
            background:hsl(199,89%,48%);
            padding:3px 8px 3px 5px;
            border-radius:12px;
            font-size:9px;
            font-weight:600;
            color:#fff;
            white-space:nowrap;
            box-shadow:0 2px 6px rgba(0,0,0,0.25);
            transform:translate(-50%,-50%) rotate(${dirAngle}deg);
            pointer-events:none;
          ">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M7 1L11 4L7 7" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M1 4H10" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span>${distance} NM</span>
          </div>`,
        iconSize: [1, 1],
        iconAnchor: [0, 0],
      });

      L.marker([midLat, midLng], {
        icon: distIcon,
        interactive: false,
        zIndexOffset: 500,
      }).addTo(map);
    }

    // Fit map to route
    const bounds = L.latLngBounds(routeCoordinates);
    map.fitBounds(bounds, { padding: [60, 60] });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [cities]);

  return (
    <section className="py-20 bg-secondary" id="marsruut">
      <style>{`
        .sylvia-city-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .sylvia-city-tooltip::before {
          display: none !important;
        }
        .leaflet-tooltip.sylvia-city-tooltip {
          background: transparent;
          border: none;
          box-shadow: none;
        }
      `}</style>
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 text-ocean-medium font-medium text-sm uppercase tracking-widest mb-4">
            <Navigation size={16} />
            Meie teekond
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Marsruut 2026
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Roomassaarest Ateenani läbi kümnete sadamate – kokku üle 4,000 meremiili.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative rounded-2xl overflow-hidden shadow-elevated mb-8"
        >
          <div
            ref={mapRef}
            className="w-full h-[560px] md:h-[720px] lg:h-[780px]"
            style={{ zIndex: 0 }}
          />
        </motion.div>

        <div className="flex justify-center gap-8 mt-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-ocean-light border-2 border-background shadow-sm" />
            <span className="text-sm text-muted-foreground">Sihtkohad</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-0.5"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, hsl(var(--ocean-light)) 0 8px, transparent 8px 14px)",
              }}
            />
            <span className="text-sm text-muted-foreground">Marsruut</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveMap;
