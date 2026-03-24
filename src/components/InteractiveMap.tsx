import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Navigation } from "lucide-react";
import { totalDistanceSection1 } from "@/data/voyageData";
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
  const routeLineRef = useRef<L.Polyline | null>(null);
  const stageMarkersRef = useRef<L.Marker[]>([]);
  const cityLabelMarkersRef = useRef<L.Marker[]>([]);
  const distanceLabelMarkersRef = useRef<Array<{ marker: L.Marker; toIndex: number; distance: number }>>([]);
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
    cities.forEach((stage, index) => {
      const isStart = index === 0;
      const marker = L.marker([stage.coordinates.lat, stage.coordinates.lng], {
        icon: createPinIcon(isStart),
        pane: "markers",
      }).addTo(map);
      stageMarkersRef.current.push(marker);
    });

    // City labels
    cityLabelMarkersRef.current = [];
    cities.forEach((stage) => {
      const marker = L.marker([stage.coordinates.lat, stage.coordinates.lng], {
        icon: L.divIcon({ className: "city-label", html: "", iconSize: [1, 1], iconAnchor: [0, 0] }),
        interactive: false,
        pane: "cityLabels",
      }).addTo(map);
      cityLabelMarkersRef.current.push(marker);
    });

    // Distance labels
    distanceLabelMarkersRef.current = [];
    for (let i = 1; i < cities.length; i++) {
      const from = cities[i - 1];
      const to = cities[i];
      const key = `${from.id}->${to.id}`;
      const distance = legDistances[key];
      if (!distance) continue;

      const marker = L.marker([to.coordinates.lat, to.coordinates.lng], {
        icon: L.divIcon({ className: "distance-label", html: "", iconSize: [1, 1], iconAnchor: [0, 0] }),
        interactive: false,
        pane: "distanceLabels",
      }).addTo(map);
      distanceLabelMarkersRef.current.push({ marker, toIndex: i, distance });
    }

    // Fit bounds
    const bounds = L.latLngBounds(routeCoordinates);
    // More padding keeps points away from the edges so labels can stay close without being clamped far away.
    map.fitBounds(bounds, { padding: [180, 180] });

    // Create city label icon - compact with short date
    // Note: offsetX/offsetY are pixel offsets from the pin's map point (top-left of the label box)
    const createCityIcon = (
      stage: (typeof cities)[number],
      offsetX: number,
      offsetY: number,
      size: { w: number; h: number },
      leaderLineTo?: { x: number; y: number }
    ) => {
      const dateText = stage.date;
      const cityName = stage.name;
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

    const estimateCityLabelSize = (stage: (typeof cities)[number]) => {
      const dateText = stage.date;
      const line1 = `${stage.name} (${stage.countryCode})`;
      const line2 = dateText || "";

      // Extra-large safety margins to avoid any visual overlap even if fonts differ slightly.
      const paddingX = 22;
      const extra = 26; // shadow + rounding + leader-line safety
      const w = Math.ceil(Math.max(measureTextPx(line1), measureTextPx(line2)) + paddingX + extra);
      const h = line2 ? 40 : 26;
      return { w, h };
    };

    const estimateDistanceLabelAabb = (distanceNm: number, rawAngleDeg: number) => {
      const text = `${distanceNm} NM`;

      // Mirror the readability rotation used inside createDistanceIcon
      let labelRotation = rawAngleDeg;
      if (labelRotation > 90) labelRotation -= 180;
      if (labelRotation < -90) labelRotation += 180;

      // More realistic pill size estimate (still slightly conservative).
      // Components: arrow (12px) + gap (3px) + paddings (≈16px) + safety.
      const baseW = Math.ceil(measureTextPx(text) + 52);
      const baseH = 18;

      const theta = (Math.abs(labelRotation) * Math.PI) / 180;
      const w = Math.abs(baseW * Math.cos(theta)) + Math.abs(baseH * Math.sin(theta));
      const h = Math.abs(baseW * Math.sin(theta)) + Math.abs(baseH * Math.cos(theta));

      // Small safety margin for shadow/rounding
      return { w: Math.ceil(w) + 10, h: Math.ceil(h) + 10 };
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
    // NOTE: We anchor the Leaflet icon at the route point (0,0) and use CSS translate(-50%,-50%)
    // so the pill is truly centered on the polyline. This keeps collision math consistent.
    const createDistanceIcon = (distanceNm: number, angleDeg: number, isFlipped: boolean) => {
      const text = `${distanceNm} NM`;

      // Label rotation for readability
      let labelRotation = angleDeg;
      if (labelRotation > 90) labelRotation -= 180;
      if (labelRotation < -90) labelRotation += 180;

      // Arrow should point in original travel direction
      const arrowFlip = isFlipped ? "scaleX(-1)" : "";

      return L.divIcon({
        className: "distance-label",
        html: `
          <div style="position: relative; width: 1px; height: 1px;">
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
              transform: translate(-50%, -50%) rotate(${labelRotation}deg);
              transform-origin: center;
              pointer-events: none;
            ">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style="transform: ${arrowFlip}; flex-shrink: 0;">
                <path d="M7 1L11 4L7 7" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M1 4H10" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span>${text}</span>
            </div>
          </div>
        `,
        // Anchor at the route point; inner pill centers itself with translate(-50%,-50%).
        iconSize: [1, 1],
        iconAnchor: [0, 0],
      });
    };

    const rerenderAll = () => {
      const displayPoints = cities.map((s) =>
        map.latLngToContainerPoint([s.coordinates.lat, s.coordinates.lng])
      );
      const displayLatLngs = cities.map(s => L.latLng(s.coordinates.lat, s.coordinates.lng));
      const mapSize = map.getSize();

      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      const distPx = (a: L.Point, b: L.Point) => Math.hypot(a.x - b.x, a.y - b.y);

      // Update pins position
      stageMarkersRef.current.forEach((m, i) => m.setLatLng(displayLatLngs[i]));
      routeLineRef.current?.setLatLngs(routeCoordinates as unknown as L.LatLngExpression[]);

      // ---- Distance labels: keep them ON the route, but slide ALONG the line to avoid overlaps
      const distanceObstacles: LabelRect[] = [];
      const padDistance = 16;

      const expandedRect = (r: LabelRect, pad: number): LabelRect => ({
        x: r.x - pad,
        y: r.y - pad,
        w: r.w + pad * 2,
        h: r.h + pad * 2,
      });

      const intersectionArea = (a: LabelRect, b: LabelRect) => {
        const x1 = Math.max(a.x, b.x);
        const y1 = Math.max(a.y, b.y);
        const x2 = Math.min(a.x + a.w, b.x + b.w);
        const y2 = Math.min(a.y + a.h, b.y + b.h);
        const w = x2 - x1;
        const h = y2 - y1;
        return w > 0 && h > 0 ? w * h : 0;
      };

      const overlapAreaWithObstacles = (rect: LabelRect, obstacles: LabelRect[], pad: number) => {
        if (obstacles.length === 0) return 0;
        const a = expandedRect(rect, pad);
        let total = 0;
        for (const o of obstacles) {
          total += intersectionArea(a, expandedRect(o, pad));
        }
        return total;
      };

      const pointAtArcLen = (pts: L.Point[], targetLen: number) => {
        if (pts.length === 1) return { pt: pts[0], angleDeg: 0 };

        let accum = 0;
        for (let k = 1; k < pts.length; k++) {
          const a = pts[k - 1];
          const b = pts[k];
          const segLen = distPx(a, b);
          if (accum + segLen >= targetLen) {
            const t = segLen === 0 ? 0 : (targetLen - accum) / segLen;
            const pt = L.point(lerp(a.x, b.x, t), lerp(a.y, b.y, t));
            const angleDeg = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
            return { pt, angleDeg };
          }
          accum += segLen;
        }

        const last = pts[pts.length - 1];
        const prev = pts[pts.length - 2];
        const angleDeg = (Math.atan2(last.y - prev.y, last.x - prev.x) * 180) / Math.PI;
        return { pt: last, angleDeg };
      };

      // Build candidate placements for every leg first, then solve a global non-overlap layout.
      type DistanceCandidate = {
        pt: L.Point;
        angleDeg: number;
        isFlipped: boolean;
        rect: LabelRect;
      };
      type DistanceLeg = {
        marker: L.Marker;
        toIndex: number;
        distance: number;
        candidates: DistanceCandidate[];
      };

      const buildArcLenCandidates = (totalLen: number) => {
        const mid = totalLen / 2;
        // Start with a few “nice” fractions, then add symmetric steps around midpoint.
        const fractions = [0.5, 0.4, 0.6, 0.32, 0.68, 0.25, 0.75, 0.18, 0.82, 0.12, 0.88, 0.08, 0.92];
        const step = Math.max(8, Math.min(56, totalLen * 0.06));

        const base = fractions.map((f) => Math.round(f * totalLen));
        for (let k = 1; k <= 7; k++) {
          base.push(Math.round(mid + k * step));
          base.push(Math.round(mid - k * step));
        }

        // Keep labels off the pins when possible; on very short legs relax the margin.
        let margin = Math.min(44, totalLen * 0.18);
        if (totalLen - margin * 2 < 40) margin = Math.min(18, totalLen * 0.08);

        const minLen = Math.max(0, margin);
        const maxLen = Math.max(minLen, totalLen - margin);

        const clamp = (v: number) => Math.max(minLen, Math.min(maxLen, v));
        const uniq = new Map<number, number>();
        for (const v of base) uniq.set(Math.round(clamp(v)), 1);

        return Array.from(uniq.keys()).sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
      };

      const buildCandidatesForLeg = (screenPts: L.Point[], totalLen: number, distance: number) => {
        const targets = buildArcLenCandidates(totalLen);
        const out = new Map<string, DistanceCandidate>();

        for (const target of targets) {
          const { pt, angleDeg } = pointAtArcLen(screenPts, target);
          const aabb = estimateDistanceLabelAabb(distance, angleDeg);
          const rect: LabelRect = { x: pt.x - aabb.w / 2, y: pt.y - aabb.h / 2, w: aabb.w, h: aabb.h };
          const isFlipped = angleDeg > 90 || angleDeg < -90;
          out.set(`${Math.round(pt.x)}:${Math.round(pt.y)}`, { pt, angleDeg, isFlipped, rect });
        }

        return Array.from(out.values());
      };

      const distanceLegs: DistanceLeg[] = [];
      for (const { marker, toIndex, distance } of distanceLabelMarkersRef.current) {
        const stage = cities[toIndex];
        const prevStage = cities[toIndex - 1];

        const key = `${prevStage.id}->${stage.id}`;
        const via = routeLegWaypoints[key] ?? [];

        const segmentCoords: L.LatLngExpression[] = [
          [prevStage.coordinates.lat, prevStage.coordinates.lng],
          ...via,
          [stage.coordinates.lat, stage.coordinates.lng],
        ];

        const screenPts = segmentCoords.map((c) => {
          const ll = Array.isArray(c) ? L.latLng(c[0], c[1]) : L.latLng(c);
          return map.latLngToContainerPoint(ll);
        });

        let totalLen = 0;
        for (let k = 1; k < screenPts.length; k++) totalLen += distPx(screenPts[k], screenPts[k - 1]);
        if (totalLen < 1) continue;

        const candidates = buildCandidatesForLeg(screenPts, totalLen, distance);
        distanceLegs.push({ marker, toIndex, distance, candidates });
      }

      const solveDistanceLayout = (pad: number) => {
        const order = distanceLegs
          .map((leg, idx) => ({ idx, leg }))
          .sort((a, b) => a.leg.candidates.length - b.leg.candidates.length);

        const placed = new Map<number, DistanceCandidate>();
        const obstacles: LabelRect[] = [];
        const deadline = performance.now() + 30; // keep move/zoom responsive

        const overlapsAny = (rect: LabelRect) => obstacles.some((o) => rectsOverlap(rect, o, pad));

        const dfs = (i: number): boolean => {
          if (performance.now() > deadline) return false;
          if (i >= order.length) return true;

          const { idx, leg } = order[i];
          for (const cand of leg.candidates) {
            if (overlapsAny(cand.rect)) continue;
            placed.set(idx, cand);
            obstacles.push(cand.rect);
            if (dfs(i + 1)) return true;
            obstacles.pop();
            placed.delete(idx);
          }
          return false;
        };

        const ok = dfs(0);
        return ok ? placed : null;
      };

      const placed = solveDistanceLayout(padDistance) ?? solveDistanceLayout(8);

      // Apply layout; if we can't find a full non-overlap solution, fall back to a partial non-overlap layout
      // (hiding labels that can't be placed without collision at the current zoom).
      distanceObstacles.length = 0;
      const appliedObstacles: LabelRect[] = [];

      if (placed) {
        distanceLegs.forEach((leg, idx) => {
          const cand = placed.get(idx);
          if (!cand) return;
          leg.marker.setOpacity(1);
          leg.marker.setLatLng(map.containerPointToLatLng(cand.pt));
          leg.marker.setIcon(createDistanceIcon(leg.distance, cand.angleDeg, cand.isFlipped));
          appliedObstacles.push(cand.rect);
        });
      } else {
        // Greedy partial placement with strict non-overlap.
        const order = distanceLegs
          .map((leg, idx) => ({ idx, leg }))
          .sort((a, b) => a.leg.candidates.length - b.leg.candidates.length);

        for (const leg of distanceLegs) leg.marker.setOpacity(0);

        for (const { idx, leg } of order) {
          const cand = leg.candidates.find((c) => !appliedObstacles.some((o) => rectsOverlap(c.rect, o, 8)));
          if (!cand) continue;
          leg.marker.setOpacity(1);
          leg.marker.setLatLng(map.containerPointToLatLng(cand.pt));
          leg.marker.setIcon(createDistanceIcon(leg.distance, cand.angleDeg, cand.isFlipped));
          appliedObstacles.push(cand.rect);
        }
      }

      distanceObstacles.push(...appliedObstacles);

      // ---- City labels: keep them near pins, choose the nearest non-overlapping slot
      const cityObstacles: LabelRect[] = [...distanceObstacles];
      const padCity = 12;

      // Per-city preferred offset hints to keep labels close to their pins.
      // Values are { dx, dy } pixel offsets from the pin head. Positive dx = right, positive dy = down.
      const cityOffsetHints: Record<string, { dx: number; dy: number }> = {
        kiel: { dx: 14, dy: -30 },          // right-above
        dusseldorf: { dx: -100, dy: -8 },    // left
        vilamoura: { dx: -100, dy: 8 },      // left-below
        moraira: { dx: 14, dy: -30 },        // right-above
        orikum: { dx: -100, dy: -8 },        // left
      };

      const createCityOffsetCandidates = (p: L.Point, size: { w: number; h: number }, mapSize: L.Point, cityId?: string) => {
        const baseY = pinHeadOffsetY - size.h / 2;
        const belowY = pinHeadOffsetY + 20;
        const aboveY = pinHeadOffsetY - size.h - 10;

        const rightX = 14;
        const leftX = -size.w - 14;

        // If we have a manual hint for this city, use it as the first/preferred candidate
        const hint = cityId ? cityOffsetHints[cityId] : undefined;

        const xOrder = p.x + size.w + 20 > mapSize.x ? [leftX, rightX] : [rightX, leftX];
        const yOrder = p.y + baseY < 10 ? [belowY, baseY, aboveY] : [baseY, belowY, aboveY];

        const nudges = [
          { dx: 0, dy: 0 },
          { dx: 0, dy: -8 },
          { dx: 0, dy: 8 },
          { dx: 8, dy: 0 },
          { dx: -8, dy: 0 },
          { dx: 0, dy: -16 },
          { dx: 0, dy: 16 },
        ];

        const out: Array<{ x: number; y: number; preferredDist: number }> = [];
        const preferred = hint ? { x: hint.dx, y: hint.dy } : { x: xOrder[0], y: yOrder[0] };

        // Add the hint offset first if available
        if (hint) {
          const clamped = clampOffsetToMap(p, size, { x: hint.dx, y: hint.dy }, mapSize, 6);
          out.push({ x: clamped.x, y: clamped.y, preferredDist: 0 });
        }

        for (const x of xOrder) {
          for (const y of yOrder) {
            for (const n of nudges) {
              const raw = { x: x + n.dx, y: y + n.dy };
              const clamped = clampOffsetToMap(p, size, raw, mapSize, 6);
              const preferredDist = Math.hypot(clamped.x - preferred.x, clamped.y - preferred.y);
              out.push({ x: clamped.x, y: clamped.y, preferredDist });
            }
          }
        }

        // Remove duplicates (after clamping)
        const unique = new Map<string, { x: number; y: number; preferredDist: number }>();
        for (const c of out) unique.set(`${Math.round(c.x)}:${Math.round(c.y)}`, c);
        return Array.from(unique.values()).sort((a, b) => a.preferredDist - b.preferredDist);
      };

      const overlapAreaAny = (rect: LabelRect, obstacles: LabelRect[], pad: number) => {
        const a = expandedRect(rect, pad);
        let total = 0;
        for (const o of obstacles) total += intersectionArea(a, expandedRect(o, pad));
        return total;
      };

      for (let idx = 0; idx < cities.length; idx++) {
        const stage = cities[idx];
        const p = displayPoints[idx];
        const size = estimateCityLabelSize(stage);

        const candidates = createCityOffsetCandidates(p, size, mapSize, stage.id);

        let best:
          | {
              offset: { x: number; y: number };
              rect: LabelRect;
              overlapArea: number;
              score: number;
            }
          | null = null;

        for (const c of candidates) {
          const rect: LabelRect = { x: p.x + c.x, y: p.y + c.y, w: size.w, h: size.h };
          const overlapArea = overlapAreaAny(rect, cityObstacles, padCity);
          const score = overlapArea * 1000 + c.preferredDist;

          if (overlapArea === 0) {
            best = { offset: { x: c.x, y: c.y }, rect, overlapArea, score };
            break;
          }
          if (!best || score < best.score) best = { offset: { x: c.x, y: c.y }, rect, overlapArea, score };
        }

        const offset = best?.offset ?? { x: 12, y: pinHeadOffsetY - size.h / 2 };
        const rect = best?.rect ?? { x: p.x + offset.x, y: p.y + offset.y, w: size.w, h: size.h };

        cityLabelMarkersRef.current[idx].setLatLng(displayLatLngs[idx]);
        cityLabelMarkersRef.current[idx].setIcon(createCityIcon(stage, offset.x, offset.y, size, undefined));
        cityObstacles.push(rect);
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
  }, [cities]);

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
