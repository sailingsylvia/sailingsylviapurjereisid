import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Navigation } from "lucide-react";
import { voyageSections, totalDistanceSection1 } from "@/data/voyageData";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const InteractiveMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const cityLabelMarkersRef = useRef<L.Marker[]>([]);
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

    // Gold color from CSS - #cba747
    const goldColor = "#cba747";
    const oceanColor = "#1e3a5f";
    const accentColor = "#0891b2";

    // Create custom marker icons - no "finish" distinction anymore
    const createMarkerIcon = (isStart: boolean) => {
      const color = isStart ? oceanColor : accentColor;
      return L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            width: 28px;
            height: 28px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
    };

    // Add route line
    const routeCoordinates = mainStages.map((stage) => [
      stage.coordinates.lat,
      stage.coordinates.lng,
    ] as [number, number]);

    L.polyline(routeCoordinates, {
      color: accentColor,
      weight: 3,
      opacity: 0.8,
      dashArray: "10, 8",
    }).addTo(map);

    // Add distance labels on route segments with offset to avoid overlap
    for (let i = 1; i < mainStages.length; i++) {
      const stage = mainStages[i];
      const prevStage = mainStages[i - 1];
      
      if (stage.distanceFromPrevious) {
        // Calculate midpoint with slight offset to avoid line overlap
        const midLat = (stage.coordinates.lat + prevStage.coordinates.lat) / 2;
        const midLng = (stage.coordinates.lng + prevStage.coordinates.lng) / 2;
        
        // Add perpendicular offset based on segment direction
        const latDiff = stage.coordinates.lat - prevStage.coordinates.lat;
        const lngDiff = stage.coordinates.lng - prevStage.coordinates.lng;
        const length = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
        const offsetDistance = 0.3;
        const offsetLat = midLat + (lngDiff / length) * offsetDistance * (i % 2 === 0 ? 1 : -1);
        const offsetLng = midLng - (latDiff / length) * offsetDistance * (i % 2 === 0 ? 1 : -1);
        
        // Add distance label
        const distanceIcon = L.divIcon({
          className: "distance-label",
          html: `
            <div style="
              background: rgba(255,255,255,0.95);
              padding: 2px 5px;
              border-radius: 8px;
              font-size: 9px;
              font-weight: 600;
              color: ${accentColor};
              white-space: nowrap;
              box-shadow: 0 1px 3px rgba(0,0,0,0.15);
              border: 1px solid ${accentColor};
            ">${stage.distanceFromPrevious} nm</div>
          `,
          iconSize: [45, 18],
          iconAnchor: [22, 9],
        });
        
        L.marker([offsetLat, offsetLng], { icon: distanceIcon, interactive: false }).addTo(map);
      }
    }

    const clearCityLabels = () => {
      cityLabelMarkersRef.current.forEach((m) => m.remove());
      cityLabelMarkersRef.current = [];
    };

    type Rect = { left: number; top: number; right: number; bottom: number };
    const overlapArea = (a: Rect, b: Rect) => {
      const x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      return x * y;
    };

    const renderCityLabels = () => {
      clearCityLabels();

      const size = map.getSize();
      const padding = 10;
      const placed: Rect[] = [];

      mainStages.forEach((stage, index) => {
        const isStart = index === 0;
        const hasDate = Boolean(stage.arrivalDate);

        // Slightly adaptive sizing reduces overlap without making labels tiny.
        const labelW = Math.min(160, Math.max(112, stage.city.length * 8 + 32));
        const labelH = hasDate ? 44 : 28;

        const point = map.latLngToContainerPoint([
          stage.coordinates.lat,
          stage.coordinates.lng,
        ]);

        // Candidate top-left offsets relative to the blue dot (in px)
        const candidates = [
          { dx: 12, dy: -labelH - 12 }, // top-right
          { dx: 12, dy: 12 }, // bottom-right
          { dx: -labelW - 12, dy: -labelH - 12 }, // top-left
          { dx: -labelW - 12, dy: 12 }, // bottom-left
          { dx: -labelW / 2, dy: -labelH - 12 }, // top
          { dx: -labelW / 2, dy: 12 }, // bottom
        ];

        let best = candidates[0];
        let bestPenalty = Number.POSITIVE_INFINITY;
        let bestRect: Rect | null = null;

        for (const c of candidates) {
          const rect: Rect = {
            left: point.x + c.dx,
            top: point.y + c.dy,
            right: point.x + c.dx + labelW,
            bottom: point.y + c.dy + labelH,
          };

          let penalty = 0;

          // Keep inside map viewport
          if (rect.left < padding) penalty += (padding - rect.left) * 2000;
          if (rect.top < padding) penalty += (padding - rect.top) * 2000;
          if (rect.right > size.x - padding) penalty += (rect.right - (size.x - padding)) * 2000;
          if (rect.bottom > size.y - padding) penalty += (rect.bottom - (size.y - padding)) * 2000;

          for (const prev of placed) {
            const area = overlapArea(rect, prev);
            if (area > 0) penalty += area + 8000;
          }

          // Prefer a closer label (smaller displacement)
          penalty += Math.abs(c.dx) * 2 + Math.abs(c.dy) * 1.5;

          if (penalty < bestPenalty) {
            bestPenalty = penalty;
            best = c;
            bestRect = rect;
          }
        }

        if (bestRect) placed.push(bestRect);

        const labelIcon = L.divIcon({
          className: "city-label",
          html: `
            <div style="
              width: ${labelW}px;
              height: ${labelH}px;
              background: rgba(255,255,255,0.95);
              padding: 5px 8px;
              border-radius: 6px;
              font-size: 10px;
              font-weight: 600;
              color: ${oceanColor};
              white-space: nowrap;
              box-shadow: 0 1px 4px rgba(0,0,0,0.12);
              border-left: 2px solid ${isStart ? oceanColor : accentColor};
              text-align: left;
              overflow: hidden;
            ">
              <div style="font-weight: 700; font-size: 10px; overflow: hidden; text-overflow: ellipsis;">${stage.city}</div>
              ${stage.arrivalDate ? `<div style="font-size: 9px; color: #555; font-weight: 400; overflow: hidden; text-overflow: ellipsis;">${stage.arrivalDate}</div>` : ""}
            </div>
          `,
          iconSize: [labelW, labelH],
          // iconAnchor is the point (within the icon) that is placed at the marker's LatLng.
          // We want the label top-left to be offset by (dx, dy) from the dot -> anchor = (-dx, -dy)
          iconAnchor: [-best.dx, -best.dy],
        });

        const labelMarker = L.marker([stage.coordinates.lat, stage.coordinates.lng], {
          icon: labelIcon,
          interactive: false,
        }).addTo(map);

        cityLabelMarkersRef.current.push(labelMarker);
      });
    };

    // Add markers (dots) for each stage
    mainStages.forEach((stage, index) => {
      const isStart = index === 0;
      L.marker([stage.coordinates.lat, stage.coordinates.lng], {
        icon: createMarkerIcon(isStart),
      }).addTo(map);
    });

    // Fit bounds to show all markers
    const bounds = L.latLngBounds(routeCoordinates);
    map.fitBounds(bounds, { padding: [50, 50] });

    // Render labels after fitBounds (and keep them non-overlapping on zoom/resize)
    const rerender = () => renderCityLabels();
    map.on("zoomend", rerender);
    map.on("resize", rerender);
    map.on("moveend", rerender);
    // In case moveend doesn't fire (rare), render once right away.
    renderCityLabels();

    return () => {
      if (mapInstanceRef.current) {
        clearCityLabels();
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
            <div className="w-4 h-4 rounded-full bg-ocean-deep border-2 border-white shadow-sm" />
            <span className="text-sm text-muted-foreground">Start (Roomassaare)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-ocean-light border-2 border-white shadow-sm" />
            <span className="text-sm text-muted-foreground">Peatused</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveMap;
