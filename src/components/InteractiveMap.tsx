import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Navigation } from "lucide-react";
import { voyageSections, totalDistanceSection1 } from "@/data/voyageData";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Helper to convert "20. juuli 2026" → "20. jul" or "2. august 2026" → "2. aug"
const formatShortDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "";
  
  const months: Record<string, string> = {
    jaanuar: "jan", veebruar: "veebr", märts: "märts", aprill: "apr",
    mai: "mai", juuni: "juuni", juuli: "jul", august: "aug",
    september: "sept", oktoober: "okt", november: "nov", detsember: "dets"
  };
  
  // Match pattern like "20. juuli 2026"
  const match = dateStr.match(/^(\d+)\.\s*(\w+)/);
  if (match) {
    const day = match[1];
    const monthFull = match[2].toLowerCase();
    const monthShort = months[monthFull] || monthFull.slice(0, 3);
    return `${day}. ${monthShort}`;
  }
  return dateStr;
};

const InteractiveMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const stageMarkersRef = useRef<L.Marker[]>([]);
  const cityLabelMarkersRef = useRef<L.Marker[]>([]);
  const distanceLabelMarkersRef = useRef<Array<{ marker: L.Marker; toIndex: number }>>([]);
  const mainStages = voyageSections[0].stages;

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

    // Colors from design tokens
    const markerColor = "hsl(var(--ocean-light))";
    const labelBgColor = "hsl(var(--foreground) / 0.92)";
    const labelMuted = "hsl(var(--muted-foreground))";
    const labelText = "hsl(var(--primary-foreground))";

    // Panes for layering
    map.createPane("routeLine");
    const routePane = map.getPane("routeLine");
    if (routePane) routePane.style.zIndex = "350";

    map.createPane("distanceLabels");
    const distanceLabelsPane = map.getPane("distanceLabels");
    if (distanceLabelsPane) distanceLabelsPane.style.zIndex = "400";

    map.createPane("cityLabels");
    const cityLabelsPane = map.getPane("cityLabels");
    if (cityLabelsPane) cityLabelsPane.style.zIndex = "450";

    map.createPane("markers");
    const markersPane = map.getPane("markers");
    if (markersPane) markersPane.style.zIndex = "500";

    // Create pin icon (teardrop shape)
    const createPinIcon = (isStart: boolean) => {
      const size = isStart ? 32 : 24;
      const innerSize = isStart ? 12 : 8;
      return L.divIcon({
        className: "custom-pin-marker",
        html: `
          <div style="position: relative; width: ${size}px; height: ${size + 6}px;">
            <svg width="${size}" height="${size + 6}" viewBox="0 0 ${size} ${size + 6}" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M${size / 2} ${size + 4} C${size / 2} ${size + 4} ${size - 2} ${size * 0.55} ${size - 2} ${size / 2.2} C${size - 2} ${size / 5} ${size * 0.78} 2 ${size / 2} 2 C${size * 0.22} 2 2 ${size / 5} 2 ${size / 2.2} C2 ${size * 0.55} ${size / 2} ${size + 4} ${size / 2} ${size + 4} Z" fill="${markerColor}" stroke="white" stroke-width="2"/>
              <circle cx="${size / 2}" cy="${size / 2.2}" r="${innerSize / 2}" fill="white"/>
            </svg>
          </div>
        `,
        iconSize: [size, size + 6],
        iconAnchor: [size / 2, size + 4],
      });
    };

    // Route coordinates
    const routeCoordinates = mainStages.map((stage) => [
      stage.coordinates.lat,
      stage.coordinates.lng,
    ] as [number, number]);

    // Add route line (dashed)
    const routeLine = L.polyline(routeCoordinates, {
      color: markerColor,
      weight: 2,
      opacity: 0.7,
      dashArray: "8, 6",
      pane: "routeLine",
    }).addTo(map);
    routeLineRef.current = routeLine;

    // Add stage markers (pins)
    stageMarkersRef.current = [];
    mainStages.forEach((stage, index) => {
      const isStart = index === 0;
      const marker = L.marker([stage.coordinates.lat, stage.coordinates.lng], {
        icon: createPinIcon(isStart),
        pane: "markers",
      }).addTo(map);
      stageMarkersRef.current.push(marker);
    });

    // City labels
    cityLabelMarkersRef.current = [];
    mainStages.forEach((stage) => {
      const marker = L.marker([stage.coordinates.lat, stage.coordinates.lng], {
        icon: L.divIcon({ className: "city-label", html: "", iconSize: [1, 1], iconAnchor: [0, 0] }),
        interactive: false,
        pane: "cityLabels",
      }).addTo(map);
      cityLabelMarkersRef.current.push(marker);
    });

    // Distance labels
    distanceLabelMarkersRef.current = [];
    for (let i = 1; i < mainStages.length; i++) {
      const stage = mainStages[i];
      if (!stage.distanceFromPrevious) continue;

      const marker = L.marker([stage.coordinates.lat, stage.coordinates.lng], {
        icon: L.divIcon({ className: "distance-label", html: "", iconSize: [1, 1], iconAnchor: [0, 0] }),
        interactive: false,
        pane: "distanceLabels",
      }).addTo(map);
      distanceLabelMarkersRef.current.push({ marker, toIndex: i });
    }

    // Fit bounds
    const bounds = L.latLngBounds(routeCoordinates);
    map.fitBounds(bounds, { padding: [80, 80] });

    // Create city label icon - compact with short date
    const createCityIcon = (stage: (typeof mainStages)[number], offsetX: number, offsetY: number) => {
      const dateText = stage.id === "roomassaare" ? "20. jul" : formatShortDate(stage.arrivalDate);
      const cityName = stage.city;
      const countryCode = stage.countryCode;
      
      return L.divIcon({
        className: "city-label",
        html: `
          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            background: ${labelBgColor};
            padding: 3px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            color: ${labelText};
            white-space: nowrap;
            box-shadow: 0 2px 8px hsl(var(--foreground) / 0.25);
            line-height: 1.2;
          ">
            <div style="display: flex; align-items: baseline; gap: 2px;">
              <span>${cityName}</span>
              <span style="color: ${labelMuted}; font-weight: 500; font-size: 8px;">(${countryCode})</span>
            </div>
            ${dateText ? `<div style="font-size: 8px; color: ${labelMuted}; font-weight: 400;">${dateText}</div>` : ""}
          </div>
        `,
        iconSize: [1, 1],
        iconAnchor: [-offsetX, -offsetY],
      });
    };

    // Create distance label icon with arrow parallel to route
    const createDistanceIcon = (distanceNm: number, angleDeg: number) => {
      const text = `${distanceNm} miili`;
      
      // Calculate arrow rotation - point in direction of travel
      const arrowRotation = angleDeg;
      
      return L.divIcon({
        className: "distance-label",
        html: `
          <div style="
            display: inline-flex;
            align-items: center;
            gap: 3px;
            background: ${markerColor};
            padding: 2px 6px 2px 4px;
            border-radius: 10px;
            font-size: 8px;
            font-weight: 600;
            color: ${labelText};
            white-space: nowrap;
            box-shadow: 0 1px 4px hsl(var(--foreground) / 0.2);
            transform: rotate(${angleDeg}deg);
            transform-origin: center;
          ">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" style="transform: rotate(${-angleDeg + arrowRotation}deg);">
              <path d="M6 1L9 4L6 7M1 4H9" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>${text}</span>
          </div>
        `,
        iconSize: [1, 1],
        iconAnchor: [0, 0],
      });
    };

    const rerenderAll = () => {
      const displayPoints = mainStages.map((s) =>
        map.latLngToContainerPoint([s.coordinates.lat, s.coordinates.lng])
      );
      const displayLatLngs = mainStages.map(s => L.latLng(s.coordinates.lat, s.coordinates.lng));

      // Update pins position
      stageMarkersRef.current.forEach((m, i) => m.setLatLng(displayLatLngs[i]));
      routeLineRef.current?.setLatLngs(displayLatLngs as unknown as L.LatLngExpression[]);

      // Place city labels directly next to pins (bottom-right offset)
      mainStages.forEach((stage, idx) => {
        const p = displayPoints[idx];
        
        // Offset to position label directly below-right of pin
        let offsetX = 8;
        let offsetY = 4;
        
        // Adjust offset for crowded areas
        if (stage.id === "ibiza") {
          offsetX = 8;
          offsetY = 20;
        } else if (stage.id === "mallorca") {
          offsetX = 8;
          offsetY = -30;
        } else if (stage.id === "sardiinia") {
          offsetX = 8;
          offsetY = 10;
        } else if (stage.id === "orikum") {
          offsetX = -90;
          offsetY = 4;
        } else if (stage.id === "korfu") {
          offsetX = 8;
          offsetY = 20;
        } else if (stage.id === "moraira") {
          offsetX = -80;
          offsetY = 4;
        } else if (stage.id === "brest") {
          offsetX = -80;
          offsetY = -10;
        } else if (stage.id === "vilamoura") {
          offsetX = -90;
          offsetY = 10;
        }

        cityLabelMarkersRef.current[idx].setLatLng(displayLatLngs[idx]);
        cityLabelMarkersRef.current[idx].setIcon(createCityIcon(stage, offsetX, offsetY));
      });

      // Place distance labels on route segments, parallel to line
      distanceLabelMarkersRef.current.forEach((seg) => {
        const i = seg.toIndex;
        const distance = mainStages[i].distanceFromPrevious || 0;

        const p1 = displayPoints[i - 1];
        const p2 = displayPoints[i];
        
        // Calculate midpoint of segment
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        
        // Calculate angle of the route segment
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        let angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
        
        // Keep text readable (not upside down)
        if (angleDeg > 90) angleDeg -= 180;
        if (angleDeg < -90) angleDeg += 180;
        
        // Position at midpoint
        const midLatLng = map.containerPointToLatLng(L.point(midX, midY));
        
        seg.marker.setLatLng(midLatLng);
        seg.marker.setIcon(createDistanceIcon(distance, angleDeg));
      });
    };

    map.on("zoomend", rerenderAll);
    map.on("resize", rerenderAll);
    map.on("moveend", rerenderAll);
    rerenderAll();

    return () => {
      if (mapInstanceRef.current) {
        stageMarkersRef.current.forEach((m) => m.remove());
        stageMarkersRef.current = [];
        cityLabelMarkersRef.current.forEach((m) => m.remove());
        cityLabelMarkersRef.current = [];
        distanceLabelMarkersRef.current.forEach(({ marker }) => marker.remove());
        distanceLabelMarkersRef.current = [];
        routeLineRef.current = null;
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mainStages]);

  return (
    <section className="py-20 bg-secondary" id="marsruut">
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
            Roomassaarest Korfuni läbi 11+ sihtkoha – kokku üle{" "}
            {totalDistanceSection1.toLocaleString()} meremiili.
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
            className="w-full h-[500px] md:h-[600px]"
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
