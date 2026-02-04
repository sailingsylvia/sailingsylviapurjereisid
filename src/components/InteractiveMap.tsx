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
    // Use a light muted tone on the dark label background (keeps contrast on the map)
    const labelMuted = "hsl(var(--primary-foreground) / 0.78)";
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
    // Note: offsetX/offsetY are pixel offsets from the pin's map point (top-left of the label box)
    const createCityIcon = (stage: (typeof mainStages)[number], offsetX: number, offsetY: number) => {
      const dateText = stage.id === "roomassaare" ? "20. jul" : formatShortDate(stage.arrivalDate);
      const cityName = stage.city;
      const countryCode = stage.countryCode;
      
      return L.divIcon({
        className: "city-label",
        html: `
          <div style="
            transform: translate(${offsetX}px, ${offsetY}px);
            will-change: transform;
            display: inline-flex;
            flex-direction: column;
            align-items: flex-start;
            width: max-content;
            background: ${labelBgColor};
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            color: ${labelText};
            white-space: nowrap;
            box-shadow: 0 3px 10px hsl(var(--foreground) / 0.3);
            line-height: 1.3;
          ">
            <div style="display: flex; align-items: baseline; gap: 3px;">
              <span>${cityName}</span>
              <span style="color: ${labelMuted}; font-weight: 500; font-size: 8px;">(${countryCode})</span>
            </div>
            ${dateText ? `<div style="font-size: 9px; color: ${labelMuted}; font-weight: 500;">${dateText}</div>` : ""}
          </div>
        `,
        iconSize: [1, 1],
        // Anchor at the pin point; we offset via CSS transform above.
        iconAnchor: [0, 0],
      });
    };

    type LabelRect = { x: number; y: number; w: number; h: number };
    const rectsOverlap = (a: LabelRect, b: LabelRect, pad = 6) => {
      return !(
        a.x + a.w + pad < b.x ||
        b.x + b.w + pad < a.x ||
        a.y + a.h + pad < b.y ||
        b.y + b.h + pad < a.y
      );
    };

    // Conservative text measurement (no DOM reads) to avoid under-estimating label size.
    // Over-estimation is preferred: it prevents labels from visually overlapping.
    const fontFamily = (() => {
      try {
        return window.getComputedStyle(map.getContainer()).fontFamily || "system-ui, sans-serif";
      } catch {
        return "system-ui, sans-serif";
      }
    })();

    const measureTextPx = (() => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      // Use 10px for both lines to intentionally over-estimate a bit.
      const font = `600 10px ${fontFamily}`;
      return (text: string) => {
        if (!text) return 0;
        if (!ctx) return text.length * 7.2;
        ctx.font = font;
        return ctx.measureText(text).width;
      };
    })();

    const estimateCityLabelSize = (stage: (typeof mainStages)[number]) => {
      const dateText = stage.id === "roomassaare" ? "20. jul" : formatShortDate(stage.arrivalDate);
      const line1 = `${stage.city} (${stage.countryCode})`;
      const line2 = dateText || "";

      const paddingX = 16; // 8px left + 8px right
      const extra = 10; // gap + rounded corners + shadow safety
      const w = Math.ceil(Math.max(measureTextPx(line1), measureTextPx(line2)) + paddingX + extra);
      // matches the inline styles (font-size + 1–2 lines + padding)
      const h = line2 ? 34 : 22;
      return { w, h };
    };

    const estimateDistanceLabelAabb = (distanceNm: number, rawAngleDeg: number) => {
      const text = `${distanceNm} miili`;
      // Mirror the readability rotation used inside createDistanceIcon
      let labelRotation = rawAngleDeg;
      if (labelRotation > 90) labelRotation -= 180;
      if (labelRotation < -90) labelRotation += 180;

      const baseW = Math.ceil(measureTextPx(text) + 40); // arrow + padding + gap
      const baseH = 18;

      const theta = (Math.abs(labelRotation) * Math.PI) / 180;
      const w = Math.abs(baseW * Math.cos(theta)) + Math.abs(baseH * Math.sin(theta));
      const h = Math.abs(baseW * Math.sin(theta)) + Math.abs(baseH * Math.cos(theta));
      return { w: Math.ceil(w) + 6, h: Math.ceil(h) + 6 };
    };

    const clampOffsetToMap = (
      p: L.Point,
      size: { w: number; h: number },
      offset: { x: number; y: number },
      mapSize: L.Point,
      margin = 6
    ) => {
      let x = offset.x;
      let y = offset.y;
      // keep label within container bounds
      if (p.x + x < margin) x = margin - p.x;
      if (p.y + y < margin) y = margin - p.y;
      if (p.x + x + size.w > mapSize.x - margin) x = mapSize.x - margin - size.w - p.x;
      if (p.y + y + size.h > mapSize.y - margin) y = mapSize.y - margin - size.h - p.y;
      return { x, y };
    };

    // Create distance label icon with arrow parallel to route, arrow points in travel direction
    const createDistanceIcon = (distanceNm: number, angleDeg: number, isFlipped: boolean) => {
      const text = `${distanceNm} miili`;
      
      // Label rotation for readability
      let labelRotation = angleDeg;
      if (labelRotation > 90) labelRotation -= 180;
      if (labelRotation < -90) labelRotation += 180;
      
      // Arrow should point in original travel direction
      // If label is flipped for readability, flip arrow too
      const arrowFlip = isFlipped ? "scaleX(-1)" : "";
      
      return L.divIcon({
        className: "distance-label",
        html: `
          <div style="
            display: inline-flex;
            align-items: center;
            gap: 3px;
            background: ${markerColor};
            padding: 3px 8px 3px 5px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: 600;
            color: ${labelText};
            white-space: nowrap;
            box-shadow: 0 2px 6px hsl(var(--foreground) / 0.25);
            /* Center the pill exactly on the dotted line midpoint */
            transform: translate(-50%, -50%) rotate(${labelRotation}deg);
            transform-origin: center;
          ">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style="transform: ${arrowFlip}; flex-shrink: 0;">
              <path d="M7 1L11 4L7 7" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M1 4H10" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
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

      // Place distance labels first so city-label collision avoidance can treat them as obstacles.
      const distanceObstacles: LabelRect[] = [];
      distanceLabelMarkersRef.current.forEach((seg) => {
        const i = seg.toIndex;
        const distance = mainStages[i].distanceFromPrevious || 0;

        const p1 = displayPoints[i - 1];
        const p2 = displayPoints[i];

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const rawAngleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
        const isFlipped = rawAngleDeg > 90 || rawAngleDeg < -90;

        const midLatLng = map.containerPointToLatLng(L.point(midX, midY));
        seg.marker.setLatLng(midLatLng);
        seg.marker.setIcon(createDistanceIcon(distance, rawAngleDeg, isFlipped));

        // Conservative AABB obstacle (axis-aligned) so city labels won't cover distance pills.
        const aabb = estimateDistanceLabelAabb(distance, rawAngleDeg);
        distanceObstacles.push({
          x: midX - aabb.w / 2,
          y: midY - aabb.h / 2,
          w: aabb.w,
          h: aabb.h,
        });
      });

      // Place city labels directly next to pins (bottom-right offset)
      {
        const mapSize = map.getSize();
        const placed: LabelRect[] = [...distanceObstacles];

        const preferredOffsetForStage = (stage: (typeof mainStages)[number]) => {
          // Default: slightly to the right and a bit above the pin's tip
          let x = 10;
          let y = -34;

          // Keep a light hand on special cases; collision resolver will fine-tune.
          if (stage.id === "ibiza") {
            x = 10;
            y = 18;
          } else if (stage.id === "mallorca") {
            x = 10;
            y = -44;
          } else if (stage.id === "sardiinia") {
            x = 10;
            y = -22;
          } else if (stage.id === "orikum") {
            x = -96;
            y = -34;
          } else if (stage.id === "korfu") {
            x = 10;
            y = 18;
          } else if (stage.id === "moraira") {
            x = -92;
            y = -34;
          } else if (stage.id === "brest") {
            x = -92;
            y = -44;
          } else if (stage.id === "vilamoura") {
            x = -96;
            y = -22;
          }
          return { x, y };
        };

        const candidateOffsets = (preferred: { x: number; y: number }) => {
          // Candidates are “top-left of label box” offsets from the pin point.
          // Generate a small spiral around the preferred position to reliably escape tight clusters.
          const dirs = [
            { x: 0, y: 0 },
            { x: 0, y: -1 },
            { x: 1, y: -1 },
            { x: -1, y: -1 },
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 1, y: 1 },
            { x: -1, y: 1 },
            { x: 0, y: 1 },
          ];
          const radii = [0, 14, 28, 42, 56, 70, 84];
          const out: Array<{ x: number; y: number }> = [];
          const seen = new Set<string>();
          for (const r of radii) {
            for (const d of dirs) {
              if (r === 0 && (d.x !== 0 || d.y !== 0)) continue;
              const o = { x: preferred.x + d.x * r, y: preferred.y + d.y * r };
              const key = `${Math.round(o.x)}:${Math.round(o.y)}`;
              if (seen.has(key)) continue;
              seen.add(key);
              out.push(o);
            }
          }
          return out;
        };

        mainStages.forEach((stage, idx) => {
          const p = displayPoints[idx];
          const size = estimateCityLabelSize(stage);
          const preferred = preferredOffsetForStage(stage);
          const candidates = candidateOffsets(preferred).map((o) =>
            clampOffsetToMap(p, size, o, mapSize)
          );

          let best = candidates[0];
          let bestScore = Number.POSITIVE_INFINITY;

          for (const o of candidates) {
            const rect: LabelRect = { x: p.x + o.x, y: p.y + o.y, w: size.w, h: size.h };
            let overlaps = 0;
            for (const other of placed) {
              if (rectsOverlap(rect, other, 10)) overlaps += 1;
            }

            // Score: 0 overlaps preferred; otherwise prefer fewer overlaps and smaller move from preferred.
            const movePenalty = Math.hypot(o.x - preferred.x, o.y - preferred.y) / 20;
            const score = overlaps * 100 + movePenalty;

            if (score < bestScore) {
              bestScore = score;
              best = o;
              if (overlaps === 0) break;
            }
          }

          placed.push({ x: p.x + best.x, y: p.y + best.y, w: size.w, h: size.h });

          cityLabelMarkersRef.current[idx].setLatLng(displayLatLngs[idx]);
          cityLabelMarkersRef.current[idx].setIcon(createCityIcon(stage, best.x, best.y));
        });
      }
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
