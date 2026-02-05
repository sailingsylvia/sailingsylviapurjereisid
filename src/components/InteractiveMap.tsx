import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Navigation } from "lucide-react";
import { voyageSections, totalDistanceSection1 } from "@/data/voyageData";
import { routeLegWaypoints } from "@/data/routeWaypoints";
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

    // Our pin icon is anchored at the tip; visually the “point” users associate with is higher (near the inner circle).
    // Shift label computations up a bit so labels sit closer to the visible blue marker head (like the reference sample).
    const pinHeadOffsetY = -18;

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

    // Route coordinates (with optional water-waypoint legs so the dashed line doesn't cut across land)
    const routeCoordinates: [number, number][] = [];
    for (let i = 0; i < mainStages.length; i++) {
      const stage = mainStages[i];
      if (i === 0) {
        routeCoordinates.push([stage.coordinates.lat, stage.coordinates.lng]);
        continue;
      }
      const from = mainStages[i - 1];
      const to = stage;
      const key = `${from.id}->${to.id}`;
      const via = routeLegWaypoints[key] ?? [];
      routeCoordinates.push(...via);
      routeCoordinates.push([to.coordinates.lat, to.coordinates.lng]);
    }

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
    // More padding keeps points away from the edges so labels can stay close without being clamped far away.
    map.fitBounds(bounds, { padding: [180, 180] });

    // Create city label icon - compact with short date
    // Note: offsetX/offsetY are pixel offsets from the pin's map point (top-left of the label box)
    const createCityIcon = (
      stage: (typeof mainStages)[number],
      offsetX: number,
      offsetY: number,
      size: { w: number; h: number },
      leaderLineTo?: { x: number; y: number }
    ) => {
      const dateText = stage.id === "roomassaare" ? "20. jul" : formatShortDate(stage.arrivalDate);
      const cityName = stage.city;
      const countryCode = stage.countryCode;
      
      return L.divIcon({
        className: "city-label",
        html: `
          <div style="position: relative; width: 1px; height: 1px;">
            ${
              leaderLineTo
                ? `
              <svg width="1" height="1" style="position:absolute; left:0; top:0; overflow: visible; pointer-events:none;">
                 <line x1="0" y1="${pinHeadOffsetY}" x2="${leaderLineTo.x}" y2="${leaderLineTo.y}"
                   stroke="hsl(var(--foreground) / 0.45)" stroke-width="1.25" stroke-dasharray="2 3" />
                 <circle cx="${leaderLineTo.x}" cy="${leaderLineTo.y}" r="2" fill="hsl(var(--foreground) / 0.45)" />
              </svg>
            `
                : ""
            }
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

      // Extra-large safety margins to avoid any visual overlap even if fonts differ slightly.
      const paddingX = 22;
      const extra = 26; // shadow + rounding + leader-line safety
      const w = Math.ceil(Math.max(measureTextPx(line1), measureTextPx(line2)) + paddingX + extra);
      const h = line2 ? 40 : 26;
      return { w, h };
    };

    const estimateDistanceLabelAabb = (distanceNm: number, rawAngleDeg: number) => {
      const text = `${distanceNm} miili`;
      // Mirror the readability rotation used inside createDistanceIcon
      let labelRotation = rawAngleDeg;
      if (labelRotation > 90) labelRotation -= 180;
      if (labelRotation < -90) labelRotation += 180;

      // Heavier over-estimation: prevents labels that "look" overlapping even if algorithm thinks they don't.
      const baseW = Math.ceil(measureTextPx(text) + 78);
      const baseH = 24;

      const theta = (Math.abs(labelRotation) * Math.PI) / 180;
      const w = Math.abs(baseW * Math.cos(theta)) + Math.abs(baseH * Math.sin(theta));
      const h = Math.abs(baseW * Math.sin(theta)) + Math.abs(baseH * Math.cos(theta));
      return { w: Math.ceil(w) + 16, h: Math.ceil(h) + 16 };
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

    // Create distance label icon with arrow parallel to route, positioned ON the line
    const createDistanceIcon = (distanceNm: number, angleDeg: number, isFlipped: boolean) => {
      const text = `${distanceNm} miili`;
      
      // Label rotation for readability
      let labelRotation = angleDeg;
      if (labelRotation > 90) labelRotation -= 180;
      if (labelRotation < -90) labelRotation += 180;
      
      // Arrow should point in original travel direction
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
            transform: rotate(${labelRotation}deg);
            transform-origin: center;
          ">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style="transform: ${arrowFlip}; flex-shrink: 0;">
              <path d="M7 1L11 4L7 7" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M1 4H10" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span>${text}</span>
          </div>
        `,
        // Anchor at center so the label sits exactly on the line midpoint
        iconSize: [80, 20],
        iconAnchor: [40, 10],
      });
    };

    const rerenderAll = () => {
      const displayPoints = mainStages.map((s) =>
        map.latLngToContainerPoint([s.coordinates.lat, s.coordinates.lng])
      );
      const displayLatLngs = mainStages.map(s => L.latLng(s.coordinates.lat, s.coordinates.lng));
      const mapSize = map.getSize();

      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      const distPx = (a: L.Point, b: L.Point) => Math.hypot(a.x - b.x, a.y - b.y);

      // Update pins position
      stageMarkersRef.current.forEach((m, i) => m.setLatLng(displayLatLngs[i]));
      routeLineRef.current?.setLatLngs(routeCoordinates as unknown as L.LatLngExpression[]);

      // Place distance labels directly ON the route line midpoint (simple & clean)
      const distanceObstacles: LabelRect[] = [];
      for (const { marker, toIndex } of distanceLabelMarkersRef.current) {
        const stage = mainStages[toIndex];
        const distance = stage.distanceFromPrevious || 0;
        const prevStage = mainStages[toIndex - 1];

        // Get the full route segment including waypoints
        const fromId = prevStage.id;
        const toId = stage.id;
        const key = `${fromId}->${toId}`;
        const via = routeLegWaypoints[key] ?? [];

        // Build segment coordinates
        const segmentCoords: L.LatLngExpression[] = [
          [prevStage.coordinates.lat, prevStage.coordinates.lng],
          ...via,
          [stage.coordinates.lat, stage.coordinates.lng],
        ];

        // Find the midpoint along the polyline (by arc length)
        let totalLen = 0;
        const screenPts = segmentCoords.map((c) => {
          const ll = Array.isArray(c) ? L.latLng(c[0], c[1]) : L.latLng(c);
          return map.latLngToContainerPoint(ll);
        });
        for (let k = 1; k < screenPts.length; k++) {
          totalLen += Math.hypot(screenPts[k].x - screenPts[k - 1].x, screenPts[k].y - screenPts[k - 1].y);
        }
        const halfLen = totalLen / 2;

        let accum = 0;
        let midPt = screenPts[0];
        let angleDeg = 0;
        for (let k = 1; k < screenPts.length; k++) {
          const dx = screenPts[k].x - screenPts[k - 1].x;
          const dy = screenPts[k].y - screenPts[k - 1].y;
          const segLen = Math.hypot(dx, dy);
          if (accum + segLen >= halfLen) {
            const t = (halfLen - accum) / segLen;
            midPt = L.point(
              screenPts[k - 1].x + dx * t,
              screenPts[k - 1].y + dy * t
            );
            angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
            break;
          }
          accum += segLen;
        }

        const isFlipped = angleDeg > 90 || angleDeg < -90;
        const midLatLng = map.containerPointToLatLng(midPt);
        marker.setLatLng(midLatLng);
        marker.setIcon(createDistanceIcon(distance, angleDeg, isFlipped));

        // Add to obstacles for city label collision
        const aabb = estimateDistanceLabelAabb(distance, angleDeg);
        distanceObstacles.push({
          x: midPt.x - aabb.w / 2,
          y: midPt.y - aabb.h / 2,
          w: aabb.w,
          h: aabb.h,
        });
      }

      // Place city labels directly next to pins (simple fixed offsets)
      for (let idx = 0; idx < mainStages.length; idx++) {
        const stage = mainStages[idx];
        const p = displayPoints[idx];
        const size = estimateCityLabelSize(stage);

        // Simple offset: place label to the right and slightly above the pin
        let offsetX = 12;
        let offsetY = pinHeadOffsetY - size.h / 2;

        // If pin is on the right edge, place label to the left
        if (p.x + size.w + 20 > mapSize.x) {
          offsetX = -size.w - 12;
        }
        // If pin is near top edge, place label below
        if (p.y + offsetY < 10) {
          offsetY = pinHeadOffsetY + 20;
        }

        cityLabelMarkersRef.current[idx].setLatLng(displayLatLngs[idx]);
        cityLabelMarkersRef.current[idx].setIcon(
          createCityIcon(stage, offsetX, offsetY, size, undefined)
        );
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
