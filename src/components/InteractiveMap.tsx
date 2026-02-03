import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Navigation } from "lucide-react";
import { voyageSections, totalDistanceSection1 } from "@/data/voyageData";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const InteractiveMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const stageMarkersRef = useRef<L.Marker[]>([]);
  const cityLabelMarkersRef = useRef<L.Marker[]>([]);
  const distanceLabelMarkersRef = useRef<Array<{ marker: L.Marker; toIndex: number }>>([]);
  const leaderLinesRef = useRef<L.Polyline[]>([]);
  const mainStages = voyageSections[0].stages;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Europe
    const map = L.map(mapRef.current, {
      center: [45, 5],
      zoom: 4,
      scrollWheelZoom: false,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // Add tile layer with a light style
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    // Use design tokens (HSL CSS vars) for all colors
    const markerColor = "hsl(var(--ocean-light))";
    const labelBgColor = "hsl(var(--foreground) / 0.92)";
    const labelMuted = "hsl(var(--muted-foreground))";
    const labelText = "hsl(var(--primary-foreground))";

    // Panes: route at bottom, leader lines above it, distance labels, city labels, pins on top
    map.createPane("routeLine");
    const routePane = map.getPane("routeLine");
    if (routePane) routePane.style.zIndex = "350";

    map.createPane("leaderLines");
    const leaderPane = map.getPane("leaderLines");
    if (leaderPane) leaderPane.style.zIndex = "380";

    map.createPane("distanceLabels");
    const distanceLabelsPane = map.getPane("distanceLabels");
    if (distanceLabelsPane) distanceLabelsPane.style.zIndex = "400";

    map.createPane("cityLabels");
    const cityLabelsPane = map.getPane("cityLabels");
    if (cityLabelsPane) cityLabelsPane.style.zIndex = "450";

    map.createPane("markers");
    const markersPane = map.getPane("markers");
    if (markersPane) markersPane.style.zIndex = "500";

    // Create custom pin marker icon (like reference image - teardrop/pin shape)
    const createPinIcon = (isStart: boolean) => {
      const size = isStart ? 36 : 28;
      const innerSize = isStart ? 14 : 10;
      return L.divIcon({
        className: "custom-pin-marker",
        html: `
          <div style="
            position: relative;
            width: ${size}px;
            height: ${size + 8}px;
          ">
            <svg width="${size}" height="${size + 8}" viewBox="0 0 ${size} ${size + 8}" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M${size / 2} ${size + 6} C${size / 2} ${size + 6} ${size - 2} ${size * 0.55} ${size - 2} ${size / 2.2} C${size - 2} ${size / 5} ${size * 0.78} 2 ${size / 2} 2 C${size * 0.22} 2 2 ${size / 5} 2 ${size / 2.2} C2 ${size * 0.55} ${size / 2} ${size + 6} ${size / 2} ${size + 6} Z" fill="${markerColor}" stroke="white" stroke-width="2"/>
              <circle cx="${size / 2}" cy="${size / 2.2}" r="${innerSize / 2}" fill="white"/>
            </svg>
          </div>
        `,
        iconSize: [size, size + 8],
        iconAnchor: [size / 2, size + 6], // Bottom tip of pin
      });
    };

    // Add route line (dashed) – we'll keep a ref and update its points on zoom/move when we spiderfy.
    const routeCoordinates = mainStages.map((stage) => [
      stage.coordinates.lat,
      stage.coordinates.lng,
    ] as [number, number]);

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

    // City labels and distance labels are created once and then positioned on each re-render.
    cityLabelMarkersRef.current.forEach((m) => m.remove());
    cityLabelMarkersRef.current = [];

    mainStages.forEach((stage) => {
      const marker = L.marker([stage.coordinates.lat, stage.coordinates.lng], {
        icon: L.divIcon({ className: "city-label", html: "", iconSize: [1, 1], iconAnchor: [0, 0] }),
        interactive: false,
        pane: "cityLabels",
      }).addTo(map);

      cityLabelMarkersRef.current.push(marker);
    });

    distanceLabelMarkersRef.current.forEach(({ marker }) => marker.remove());
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

    // Fit bounds to show all markers (bigger padding so labels fit without being clamped)
    const bounds = L.latLngBounds(routeCoordinates);
    map.fitBounds(bounds, { padding: [110, 110] });

    type Rect = { left: number; top: number; right: number; bottom: number };

    const inflateRect = (r: Rect, pad: number): Rect => ({
      left: r.left - pad,
      top: r.top - pad,
      right: r.right + pad,
      bottom: r.bottom + pad,
    });

    const overlapArea = (a: Rect, b: Rect) => {
      const x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      return x * y;
    };

    const rectFromLTWH = (left: number, top: number, w: number, h: number): Rect => ({
      left,
      top,
      right: left + w,
      bottom: top + h,
    });

    const clampRectToViewport = (rect: Rect, size: L.Point, padding: number) => {
      let dx = 0;
      let dy = 0;
      if (rect.left < padding) dx += padding - rect.left;
      if (rect.top < padding) dy += padding - rect.top;
      if (rect.right > size.x - padding) dx -= rect.right - (size.x - padding);
      if (rect.bottom > size.y - padding) dy -= rect.bottom - (size.y - padding);
      return { dx, dy };
    };

    const estimateCityLabelSize = (title: string, hasDate: boolean) => {
      // Approximate sizes (in px) so we can do collision checks without measuring DOM.
      // Keeping conservative values prevents accidental overlaps.
      const w = Math.min(180, Math.max(110, Math.round(title.length * 7.4) + 44));
      const h = hasDate ? 40 : 24;
      return { w, h };
    };

    const computeSpiderfiedPoints = (basePoints: L.Point[], minDist: number) => {
      // Deterministic spiral placement in pixel space so pins don't stack at low zoom.
      const placed: L.Point[] = [];
      const result: L.Point[] = [];

      const isFarEnough = (p: L.Point) => placed.every((q) => q.distanceTo(p) >= minDist);
      const spiralFind = (p: L.Point) => {
        for (let step = 0; step < 48; step++) {
          const angle = step * 0.82;
          const r = 6 + step * 3;
          const cand = L.point(p.x + Math.cos(angle) * r, p.y + Math.sin(angle) * r);
          if (isFarEnough(cand)) return cand;
        }
        return p;
      };

      for (const p of basePoints) {
        const candidate = isFarEnough(p) ? p : spiralFind(p);
        placed.push(candidate);
        result.push(candidate);
      }

      return result;
    };

    const buildRouteKeepoutRects = (displayPoints: L.Point[]) => {
      const rects: Rect[] = [];
      const pad = 8;
      const sampleTs = [0.18, 0.36, 0.5, 0.64, 0.82];
      for (let i = 1; i < displayPoints.length; i++) {
        const a = displayPoints[i - 1];
        const b = displayPoints[i];
        for (const t of sampleTs) {
          const x = a.x + (b.x - a.x) * t;
          const y = a.y + (b.y - a.y) * t;
          rects.push({ left: x - pad, top: y - pad, right: x + pad, bottom: y + pad });
        }
      }
      return rects;
    };

    const estimateDistanceLabelSize = (text: string) => {
      // Fixed-size icon => collision math is reliable.
      // 9px bold: ~6px/char is a safe approximation.
      const w = Math.max(44, Math.min(86, Math.round(text.length * 6.2) + 22));
      const h = 22;
      return { w, h };
    };

    const createDistanceIcon = (distanceNm: number) => {
      const text = `${distanceNm} nm`;
      const { w, h } = estimateDistanceLabelSize(text);

      return L.divIcon({
        className: "distance-label",
        html: `
          <div style="
            width: ${w}px;
            height: ${h}px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: ${markerColor};
            border-radius: 999px;
            font-size: 9px;
            font-weight: 700;
            color: ${labelText};
            white-space: nowrap;
            box-shadow: 0 1px 4px hsl(var(--foreground) / 0.2);
          ">${text}</div>
        `,
        iconSize: [w, h],
        iconAnchor: [w / 2, h / 2],
      });
    };

    const createCityIcon = (stage: (typeof mainStages)[number], w: number, h: number, dx: number, dy: number) => {
      const dateText = stage.id === "roomassaare" ? "20.07" : stage.arrivalDate;
      return L.divIcon({
        className: "city-label",
        html: `
          <div style="
            width: ${w}px;
            height: ${h}px;
            background: ${labelBgColor};
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            color: ${labelText};
            white-space: nowrap;
            box-shadow: 0 6px 18px hsl(var(--foreground) / 0.18);
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 1px;
            overflow: hidden;
          ">
            <div style="line-height: 1; max-width: 100%; overflow: hidden; text-overflow: ellipsis;">
              ${stage.city}
              <span style="color: ${labelMuted}; font-weight: 500; font-size: 9px;"> (${stage.countryCode})</span>
            </div>
            ${dateText ? `<div style="line-height: 1; font-size: 9px; color: ${labelMuted}; font-weight: 500;">${dateText}</div>` : ""}
          </div>
        `,
        iconSize: [w, h],
        // Place top-left at (dx,dy) from pin tip: anchor is (-dx, -dy)
        iconAnchor: [-dx, -dy],
      });
    };

    const clearLeaderLines = () => {
      leaderLinesRef.current.forEach((l) => l.remove());
      leaderLinesRef.current = [];
    };

    const rerenderAll = () => {
      const size = map.getSize();
      const viewportPad = 14;
      const collisionPad = 6; // visual padding so shadows/pixels never overlap

      // 1) Compute (optionally) spiderfied display points in pixel space, then map back to LatLng.
      const basePoints = mainStages.map((s) =>
        map.latLngToContainerPoint([s.coordinates.lat, s.coordinates.lng])
      );
      const zoom = map.getZoom();
      const useSpiderfy = zoom <= 5;
      // More breathing room at low zoom so labels/distances can all stay visible.
      const displayPoints = useSpiderfy ? computeSpiderfiedPoints(basePoints, 54) : basePoints;
      const displayLatLngs = displayPoints.map((p) => map.containerPointToLatLng(p));

      // Update pins + route to match display points.
      stageMarkersRef.current.forEach((m, i) => m.setLatLng(displayLatLngs[i]));
      routeLineRef.current?.setLatLngs(displayLatLngs as unknown as L.LatLngExpression[]);

      // Common obstacles
      const pinKeepout = 24;
      const pinRects: Rect[] = displayPoints.map((p) => ({
        left: p.x - pinKeepout,
        top: p.y - pinKeepout,
        right: p.x + pinKeepout,
        bottom: p.y + pinKeepout,
      }));

      const routeKeepoutRects = buildRouteKeepoutRects(displayPoints);

      // 2) Place city labels first (keep them near pins), then fit distance labels around them.
      clearLeaderLines();
      const placedCityRects: Rect[] = [];

      // Place the most crowded labels first so they get the best spots.
      const cityOrder = mainStages
        .map((_, idx) => {
          const p = displayPoints[idx];
          let neighbors = 0;
          for (let j = 0; j < displayPoints.length; j++) {
            if (j === idx) continue;
            if (p.distanceTo(displayPoints[j]) < 130) neighbors++;
          }
          return { idx, neighbors };
        })
        .sort((a, b) => b.neighbors - a.neighbors)
        .map((x) => x.idx);

      const angleDegs = [90, 60, 120, 30, 150, 0, 180, 210, 330, 240, 300];
      const radii = [12, 18, 26, 36, 48, 62, 78, 96, 118, 142, 168];

      for (const idx of cityOrder) {
        const stage = mainStages[idx];
        const p = displayPoints[idx];
        const hasDate = Boolean(stage.arrivalDate) || stage.id === "roomassaare";
        const { w, h } = estimateCityLabelSize(stage.city, hasDate);

        // Preferred: below pin, centered
        const preferred = { left: p.x - w / 2, top: p.y + 10 };

        let best = { left: preferred.left, top: preferred.top };
        let bestRect = rectFromLTWH(best.left, best.top, w, h);
        let bestPenalty = Number.POSITIVE_INFINITY;

        const tryCandidate = (left: number, top: number) => {
          let rect = rectFromLTWH(left, top, w, h);
          const clamp = clampRectToViewport(rect, size, viewportPad);
          rect = { left: rect.left + clamp.dx, right: rect.right + clamp.dx, top: rect.top + clamp.dy, bottom: rect.bottom + clamp.dy };

          let penalty = 0;

          // City vs city
          const rectC = inflateRect(rect, collisionPad);
          for (const prev of placedCityRects) {
            const area = overlapArea(rectC, prev);
            if (area > 0) penalty += area * 45 + 300000;
          }

          // Avoid pins (including own pin)
          for (let mi = 0; mi < pinRects.length; mi++) {
            const area = overlapArea(rectC, pinRects[mi]);
            if (area <= 0) continue;
            penalty += mi === idx ? 1_200_000 : area * 45 + 250000;
          }

          // Avoid route line (so label doesn't sit on dashed line)
          for (const rr of routeKeepoutRects) {
            const area = overlapArea(rectC, rr);
            if (area > 0) penalty += area * 16 + 60000;
          }

          // Prefer being below the pin
          if (rect.top < p.y - 6) penalty += 260000;

          // Prefer close to preferred anchor
          const dxPref = rect.left - preferred.left;
          const dyPref = rect.top - preferred.top;
          penalty += Math.hypot(dxPref, dyPref) * 24;

          if (penalty < bestPenalty) {
            bestPenalty = penalty;
            best = { left: rect.left, top: rect.top };
            bestRect = rect;
          }
        };

        // Primary candidate
        tryCandidate(preferred.left, preferred.top);

        // Explore nearby candidates (biased downward)
        for (const r of radii) {
          for (const a of angleDegs) {
            const rad = (a * Math.PI) / 180;
            const cx = p.x + Math.cos(rad) * r;
            const cy = p.y + Math.sin(rad) * r;
            tryCandidate(cx - w / 2, cy - h / 2);
          }
        }

        placedCityRects.push(inflateRect(bestRect, collisionPad));

        const dxTL = bestRect.left - p.x;
        const dyTL = bestRect.top - p.y;
        cityLabelMarkersRef.current[idx].setLatLng(displayLatLngs[idx]);
        cityLabelMarkersRef.current[idx].setIcon(createCityIcon(stage, w, h, dxTL, dyTL));

        // If label moved away from the pin, draw a leader line so association stays obvious.
        const dist = Math.hypot((bestRect.left + w / 2) - p.x, (bestRect.top + h / 2) - p.y);
        if (dist > 40) {
          const anchor = L.point(bestRect.left + w / 2, bestRect.top);
          const line = L.polyline([
            map.containerPointToLatLng(p),
            map.containerPointToLatLng(anchor),
          ], {
            color: "hsl(var(--foreground) / 0.45)",
            weight: 1,
            opacity: 0.85,
            dashArray: "3, 4",
            pane: "leaderLines",
          }).addTo(map);
          leaderLinesRef.current.push(line);
        }
      }

      // 3) Place distance labels on route segments (avoid pins + city labels + other distances).
      const placedDistanceRects: Rect[] = [];

      const buildDistanceTs = (tMin: number, tMax: number) => {
        const ts: number[] = [];
        const clampT = (v: number) => Math.max(tMin, Math.min(tMax, v));

        // Midpoint-first ordering
        const base = [0.5, 0.42, 0.58, 0.34, 0.66, 0.26, 0.74, 0.18, 0.82];
        for (const t of base) ts.push(clampT(t));

        // Finer sweep for tight segments
        for (let t = tMin; t <= tMax + 1e-6; t += 0.06) ts.push(t);

        return Array.from(new Set(ts.map((x) => Math.round(x * 1000) / 1000)));
      };

      // Place distance labels for the tightest segments first.
      const distanceOrder = [...distanceLabelMarkersRef.current]
        .map((seg) => {
          const i = seg.toIndex;
          const p1 = displayPoints[i - 1];
          const p2 = displayPoints[i];
          const len = p1.distanceTo(p2);
          return { seg, len };
        })
        .sort((a, b) => a.len - b.len)
        .map((x) => x.seg);

      for (const seg of distanceOrder) {
        const i = seg.toIndex;
        const distance = mainStages[i].distanceFromPrevious || 0;
        const text = `${distance} nm`;
        const { w: distanceRectW, h: distanceRectH } = estimateDistanceLabelSize(text);

        const p1 = displayPoints[i - 1];
        const p2 = displayPoints[i];
        const vx = p2.x - p1.x;
        const vy = p2.y - p1.y;
        const len = Math.hypot(vx, vy) || 1;

        const endKeepoutPx = 26;
        const tMin = Math.min(0.49, Math.max(0.1, endKeepoutPx / len));
        const tMax = Math.max(0.51, Math.min(0.9, 1 - endKeepoutPx / len));
        const distanceTs = buildDistanceTs(tMin, tMax);

        // Tiny nudge off the exact line only if absolutely necessary
        const nx = -vy / len;
        const ny = vx / len;
        const nudges = [0, 10, -10, 18, -18, 26, -26];

        let bestPoint = L.point(p1.x + vx * 0.5, p1.y + vy * 0.5);
        let bestRect = rectFromLTWH(bestPoint.x - distanceRectW / 2, bestPoint.y - distanceRectH / 2, distanceRectW, distanceRectH);
        let bestPenalty = Number.POSITIVE_INFINITY;
        let bestNudge = 0;
        let bestT = 0.5;

        for (const t of distanceTs) {
          for (const nudge of nudges) {
            const cx = p1.x + vx * t + nx * nudge;
            const cy = p1.y + vy * t + ny * nudge;
            let rect = rectFromLTWH(cx - distanceRectW / 2, cy - distanceRectH / 2, distanceRectW, distanceRectH);
            const clamp = clampRectToViewport(rect, size, viewportPad);
            rect = { left: rect.left + clamp.dx, right: rect.right + clamp.dx, top: rect.top + clamp.dy, bottom: rect.bottom + clamp.dy };

            let penalty = 0;

            const rectC = inflateRect(rect, collisionPad);

            // Avoid pins
            for (const pr of pinRects) {
              const area = overlapArea(rectC, pr);
              if (area > 0) penalty += area * 80 + 600000;
            }

            // Avoid city labels
            for (const cr of placedCityRects) {
              const area = overlapArea(rectC, cr);
              if (area > 0) penalty += area * 90 + 700000;
            }

            // Avoid other distance labels
            for (const dr of placedDistanceRects) {
              const area = overlapArea(rectC, dr);
              if (area > 0) penalty += area * 100 + 800000;
            }

            // Prefer on-line and near midpoint
            penalty += Math.abs(nudge) * 900;
            penalty += Math.abs(t - 0.5) * 1400;
            penalty += Math.hypot(clamp.dx, clamp.dy) * 500;

            if (penalty < bestPenalty) {
              bestPenalty = penalty;
              bestPoint = L.point(cx + clamp.dx, cy + clamp.dy);
              bestRect = rect;
              bestNudge = nudge;
              bestT = t;
            }
          }
        }

        placedDistanceRects.push(inflateRect(bestRect, collisionPad));
        seg.marker.setLatLng(map.containerPointToLatLng(bestPoint));
        seg.marker.setIcon(createDistanceIcon(distance));

        // If we had to push the label off the line, draw a short leader line back to the segment.
        if (bestNudge !== 0) {
          const onLine = L.point(p1.x + vx * bestT, p1.y + vy * bestT);
          const labelCenter = L.point((bestRect.left + bestRect.right) / 2, (bestRect.top + bestRect.bottom) / 2);
          const line = L.polyline([
            map.containerPointToLatLng(onLine),
            map.containerPointToLatLng(labelCenter),
          ], {
            color: "hsl(var(--foreground) / 0.35)",
            weight: 1,
            opacity: 0.8,
            dashArray: "2, 4",
            pane: "leaderLines",
          }).addTo(map);
          leaderLinesRef.current.push(line);
        }
      }
    };

    map.on("zoomend", rerenderAll);
    map.on("resize", rerenderAll);
    map.on("moveend", rerenderAll);
    rerenderAll();

    return () => {
      if (mapInstanceRef.current) {
        clearLeaderLines();
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

        {/* Interactive Map */}
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

        {/* Legend */}
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
