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
      const mapSize = map.getSize();

      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      const distPx = (a: L.Point, b: L.Point) => Math.hypot(a.x - b.x, a.y - b.y);

      // Update pins position
      stageMarkersRef.current.forEach((m, i) => m.setLatLng(displayLatLngs[i]));
      routeLineRef.current?.setLatLngs(routeCoordinates as unknown as L.LatLngExpression[]);

       // Place distance labels first so city-label collision avoidance can treat them as obstacles.
      const distanceObstacles: LabelRect[] = [];
      {
        const alreadyPlaced: LabelRect[] = [];
         // More candidates to avoid distance-label stacking in dense areas (Ibiza/Mallorca etc.)
         const tCandidates = [
           0.5, 0.44, 0.56, 0.38, 0.62, 0.32, 0.68, 0.26, 0.74, 0.2, 0.8, 0.14, 0.86, 0.1, 0.9,
         ];
         const tangentialOffsetsPx = [0, -18, 18, -32, 32, -48, 48, -68, 68, -92, 92, -124, 124];
         const normalOffsets = [0, 12, -12, 22, -22, 34, -34, 48, -48, 64, -64, 86, -86, 112, -112, 140, -140];

         const clampRectToMap = (center: L.Point, size: { w: number; h: number }, margin = 8) => {
           let x = center.x;
           let y = center.y;
           const halfW = size.w / 2;
           const halfH = size.h / 2;
           if (x - halfW < margin) x = margin + halfW;
           if (y - halfH < margin) y = margin + halfH;
           if (x + halfW > mapSize.x - margin) x = mapSize.x - margin - halfW;
           if (y + halfH > mapSize.y - margin) y = mapSize.y - margin - halfH;
           return L.point(x, y);
         };

         // Place dense clusters first (more robust in tight areas)
         const distItems = distanceLabelMarkersRef.current.map((seg) => {
           const i = seg.toIndex;
           const distance = mainStages[i].distanceFromPrevious || 0;
           const p1 = displayPoints[i - 1];
           const p2 = displayPoints[i];
           const dx = p2.x - p1.x;
           const dy = p2.y - p1.y;
           const rawAngleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
           const aabb = estimateDistanceLabelAabb(distance, rawAngleDeg);
           const mid = L.point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
           return { seg, i, distance, p1, p2, rawAngleDeg, aabb, mid };
         });

         const nearestSegDist = new Map<number, number>();
         for (const a of distItems) {
           let best = Number.POSITIVE_INFINITY;
           for (const b of distItems) {
             if (a.i === b.i) continue;
             best = Math.min(best, Math.hypot(a.mid.x - b.mid.x, a.mid.y - b.mid.y));
           }
           nearestSegDist.set(a.i, best);
         }

         distItems.sort((a, b) => {
           const da = nearestSegDist.get(a.i) ?? Number.POSITIVE_INFINITY;
           const db = nearestSegDist.get(b.i) ?? Number.POSITIVE_INFINITY;
           if (da !== db) return da - db;
           return b.aabb.w * b.aabb.h - a.aabb.w * a.aabb.h;
         });

         for (const item of distItems) {
           const { seg, distance, p1, p2, rawAngleDeg, aabb } = item;
          const isFlipped = rawAngleDeg > 90 || rawAngleDeg < -90;

           // Normal vector (screen space) for small "lift" off the line in tight clusters.
           const segDx = p2.x - p1.x;
           const segDy = p2.y - p1.y;
           const segLen = Math.hypot(segDx, segDy) || 1;
           const nx = -segDy / segLen;
           const ny = segDx / segLen;

           const pickBest = (minEndPadPx: number) => {
             let best: { t: number; normal: number; rect: LabelRect; overlaps: number; score: number } | null = null;

             for (const tBase of tCandidates) {
               for (const tanPx of tangentialOffsetsPx) {
                 const t = Math.max(0.02, Math.min(0.98, tBase + tanPx / segLen));

                 for (const normal of normalOffsets) {
                   const x0 = lerp(p1.x, p2.x, t);
                   const y0 = lerp(p1.y, p2.y, t);
                   const x = x0 + nx * normal;
                   const y = y0 + ny * normal;

                   const pt = L.point(x0, y0);
                   if (minEndPadPx > 0) {
                     if (distPx(pt, p1) < minEndPadPx || distPx(pt, p2) < minEndPadPx) continue;
                   }

                   const clampedCenter = clampRectToMap(L.point(x, y), { w: aabb.w, h: aabb.h });
                   const rect: LabelRect = {
                     x: clampedCenter.x - aabb.w / 2,
                     y: clampedCenter.y - aabb.h / 2,
                     w: aabb.w,
                     h: aabb.h,
                   };

                   let overlaps = 0;
                   for (const other of alreadyPlaced) {
                     if (rectsOverlap(rect, other, 16)) overlaps += 1;
                   }

                   // Prefer: 0 overlaps, then stay near segment midpoint and near the line.
                   const shift = Math.abs(t - 0.5);
                   const score = overlaps * 1_000_000 + shift * 1500 + Math.abs(normal) * 18 + Math.abs(tanPx) * 2.2;

                   if (!best || score < best.score) {
                     best = { t, normal, rect, overlaps, score };
                     if (overlaps === 0 && shift < 0.16 && Math.abs(normal) <= 12 && Math.abs(tanPx) <= 18) return best;
                   }
                 }
               }
             }

            return best;
          };

           const best =
             pickBest(46) ??
             pickBest(28) ??
             pickBest(0) ?? {
               t: 0.5,
               normal: 0,
               rect: {
                 x: (p1.x + p2.x) / 2 - aabb.w / 2,
                 y: (p1.y + p2.y) / 2 - aabb.h / 2,
                 w: aabb.w,
                 h: aabb.h,
               },
               overlaps: 0,
               score: 0,
             };

            // Hard fallback: brute-force search for ANY zero-overlap placement.
            // This guarantees we don't leave distance labels stacked on top of each other.
            if (best.overlaps > 0) {
              let forced: { t: number; normal: number; rect: LabelRect } | null = null;
              const tScan = [
                0.5, 0.42, 0.58, 0.34, 0.66, 0.26, 0.74, 0.18, 0.82, 0.1, 0.9,
              ];
              const tanScan = [0, -32, 32, -68, 68, -124, 124, -180, 180];
              const normalScan = [0, 22, -22, 48, -48, 86, -86, 140, -140, 200, -200, 260, -260];

              outer: for (const tBase of tScan) {
                for (const tanPx of tanScan) {
                  const t = Math.max(0.02, Math.min(0.98, tBase + tanPx / segLen));
                  for (const normal of normalScan) {
                    const x0 = lerp(p1.x, p2.x, t);
                    const y0 = lerp(p1.y, p2.y, t);
                    const x = x0 + nx * normal;
                    const y = y0 + ny * normal;
                    const clampedCenter = clampRectToMap(L.point(x, y), { w: aabb.w, h: aabb.h });
                    const rect: LabelRect = {
                      x: clampedCenter.x - aabb.w / 2,
                      y: clampedCenter.y - aabb.h / 2,
                      w: aabb.w,
                      h: aabb.h,
                    };
                    let overlaps = 0;
                    for (const other of alreadyPlaced) if (rectsOverlap(rect, other, 20)) overlaps += 1;
                    if (overlaps === 0) {
                      forced = { t, normal, rect };
                      break outer;
                    }
                  }
                }
              }
              if (forced) {
                (best as any).t = forced.t;
                (best as any).normal = forced.normal;
                (best as any).rect = forced.rect;
              }
            }

           const x = lerp(p1.x, p2.x, best.t) + nx * best.normal;
           const y = lerp(p1.y, p2.y, best.t) + ny * best.normal;
            const posLatLng = map.containerPointToLatLng(
              clampRectToMap(L.point(x, y), { w: aabb.w, h: aabb.h })
            );
          seg.marker.setLatLng(posLatLng);
          seg.marker.setIcon(createDistanceIcon(distance, rawAngleDeg, isFlipped));

          alreadyPlaced.push(best.rect);
          distanceObstacles.push(best.rect);
        }
      }

       // Place city labels next to pins; if forced further away, add a subtle leader line.
      {
        const placed: LabelRect[] = [...distanceObstacles];

         type CityCandidate = { x: number; y: number; expand: number; slide: number; pref: number };
         const candidateOffsetsFor = (size: { w: number; h: number }): CityCandidate[] => {
           // Offsets are “top-left of label box” relative to the pin's container point.
           // Strategy: try near-the-pin placements first; then expand outward along the same direction.
            const gap = 12;
           const base = [
             // Preferred: above the pin (like the sample), then corners, then sides.
              { pref: 0, x: 12, y: pinHeadOffsetY - size.h - gap, dir: { x: 1, y: -1 }, perp: { x: 1, y: 1 } }, // top-right
              { pref: 1, x: -size.w - 12, y: pinHeadOffsetY - size.h - gap, dir: { x: -1, y: -1 }, perp: { x: 1, y: -1 } }, // top-left
              { pref: 2, x: -size.w / 2, y: pinHeadOffsetY - size.h - 16, dir: { x: 0, y: -1 }, perp: { x: 1, y: 0 } }, // centered top
              { pref: 3, x: 12, y: pinHeadOffsetY + gap, dir: { x: 1, y: 1 }, perp: { x: 1, y: -1 } }, // bottom-right
              { pref: 4, x: -size.w - 12, y: pinHeadOffsetY + gap, dir: { x: -1, y: 1 }, perp: { x: 1, y: 1 } }, // bottom-left
              { pref: 5, x: -size.w / 2, y: pinHeadOffsetY + 16, dir: { x: 0, y: 1 }, perp: { x: 1, y: 0 } }, // centered bottom
              { pref: 6, x: 16, y: pinHeadOffsetY - size.h / 2, dir: { x: 1, y: 0 }, perp: { x: 0, y: 1 } }, // centered right
              { pref: 7, x: -size.w - 16, y: pinHeadOffsetY - size.h / 2, dir: { x: -1, y: 0 }, perp: { x: 0, y: 1 } }, // centered left
           ] as const;

            // Keep labels close by default; only expand further when needed to avoid overlaps.
            const expansions = [0, 10, 20, 30, 42, 54, 68, 84];
           const slides = [0, -12, 12, -24, 24, -36, 36];
           const out: CityCandidate[] = [];
           const seen = new Set<string>();

           for (const b of base) {
             for (const expand of expansions) {
               for (const slide of slides) {
                 const x = b.x + b.dir.x * expand + b.perp.x * slide;
                 const y = b.y + b.dir.y * expand + b.perp.y * slide;
                 const key = `${Math.round(x)}:${Math.round(y)}`;
                 if (seen.has(key)) continue;
                 seen.add(key);
                 out.push({ x, y, expand, slide, pref: b.pref });
               }
             }
           }

           return out;
         };

        // Place dense clusters first so they get the best nearby slots.
        const cityIndices = mainStages.map((_, i) => i);
        const neighborDistance = (i: number) => {
          let best = Number.POSITIVE_INFINITY;
          for (let j = 0; j < displayPoints.length; j++) {
            if (j === i) continue;
            best = Math.min(best, distPx(displayPoints[i], displayPoints[j]));
          }
          return best;
        };
        cityIndices.sort((a, b) => neighborDistance(a) - neighborDistance(b));

        for (const idx of cityIndices) {
          const stage = mainStages[idx];
          const p = displayPoints[idx];
          const size = estimateCityLabelSize(stage);
           const candidates = candidateOffsetsFor(size).map((o) => ({
             ...o,
             ...clampOffsetToMap(p, size, o, mapSize),
           }));

           let best = candidates[0];
          let bestOverlaps = Number.POSITIVE_INFINITY;
          let bestScore = Number.POSITIVE_INFINITY;

          for (const o of candidates) {
            const rect: LabelRect = { x: p.x + o.x, y: p.y + o.y, w: size.w, h: size.h };
            let overlaps = 0;
            for (const other of placed) {
              if (rectsOverlap(rect, other, 16)) overlaps += 1;
            }

            // Prefer: 0 overlaps first; then keep label center close to the pin.
            const centerDist = Math.hypot(o.x + size.w / 2, o.y + size.h / 2);
             const score =
               (overlaps > 0 ? overlaps * 1_000_000 : 0) +
                centerDist * 1.8 +
               o.pref * 6 +
               Math.abs(o.slide) * 0.15 +
                o.expand * 0.8;

            if (overlaps < bestOverlaps || (overlaps === bestOverlaps && score < bestScore)) {
              bestOverlaps = overlaps;
              bestScore = score;
              best = o;
                if (overlaps === 0 && centerDist < 54) break;
            }
          }

          // Hard fallback: spiral search to guarantee 0 overlaps.
          if (bestOverlaps > 0) {
            const radii = [96, 120, 144, 168, 192, 220, 252, 288, 320];
            const angles = Array.from({ length: 16 }, (_, k) => k * 22.5);
            outer: for (const r of radii) {
              for (const a of angles) {
                const rad = (a * Math.PI) / 180;
                const ox = Math.cos(rad) * r - size.w / 2;
                const oy = Math.sin(rad) * r - size.h / 2;
                const clamped = clampOffsetToMap(p, size, { x: ox, y: oy } as any, mapSize);
                const rect: LabelRect = { x: p.x + clamped.x, y: p.y + clamped.y, w: size.w, h: size.h };
                let overlaps = 0;
                for (const other of placed) if (rectsOverlap(rect, other, 16)) overlaps += 1;
                if (overlaps === 0) {
                  best = { x: clamped.x, y: clamped.y, expand: r, slide: 0, pref: 99 };
                  bestOverlaps = 0;
                  break outer;
                }
              }
            }
          }

          placed.push({ x: p.x + best.x, y: p.y + best.y, w: size.w, h: size.h });
          cityLabelMarkersRef.current[idx].setLatLng(displayLatLngs[idx]);

           const bestCenterDist = Math.hypot(best.x + size.w / 2, best.y + size.h / 2);
           const showLeader = bestCenterDist > 58;
           cityLabelMarkersRef.current[idx].setIcon(
             createCityIcon(
               stage,
               best.x,
               best.y,
               size,
               showLeader ? { x: best.x + size.w / 2, y: best.y + size.h / 2 } : undefined
             )
           );
        }
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
