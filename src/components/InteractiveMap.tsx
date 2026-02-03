import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Navigation } from "lucide-react";
import { voyageSections, totalDistanceSection1 } from "@/data/voyageData";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const InteractiveMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
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

    const markerColor = "#2196F3"; // Bright blue like reference image
    const labelBgColor = "#2d3748"; // Dark gray/charcoal for labels

    // Panes: route at bottom, distance labels middle, city labels above, blue pins on top
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

    // Add route line (dashed)
    const routeCoordinates = mainStages.map((stage) => [
      stage.coordinates.lat,
      stage.coordinates.lng,
    ] as [number, number]);

    L.polyline(routeCoordinates, {
      color: markerColor,
      weight: 2,
      opacity: 0.7,
      dashArray: "8, 6",
      pane: "routeLine",
    }).addTo(map);

    // Add stage markers (pins)
    mainStages.forEach((stage, index) => {
      const isStart = index === 0;
      L.marker([stage.coordinates.lat, stage.coordinates.lng], {
        icon: createPinIcon(isStart),
        pane: "markers",
      }).addTo(map);
    });

    // Add city labels DIRECTLY BELOW each pin (like reference image)
    mainStages.forEach((stage, index) => {
      const isStart = index === 0;
      const pinHeight = isStart ? 44 : 36; // Pin SVG height
      
      // Create label HTML matching reference image style
      const labelHtml = `
        <div style="
          background: ${labelBgColor};
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          color: white;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          text-align: center;
          display: inline-block;
        ">
          <div style="font-weight: 700; font-size: 11px;">
            ${stage.city} <span style="color: #94a3b8; font-weight: 400; font-size: 9px;">(${stage.countryCode})</span>
          </div>
          ${stage.arrivalDate ? `<div style="font-size: 9px; color: #cbd5e1; font-weight: 400; margin-top: 1px;">${stage.arrivalDate}</div>` : ""}
        </div>
      `;

      const labelIcon = L.divIcon({
        className: "city-label-below",
        html: labelHtml,
        iconSize: [0, 0], // Auto-size
        iconAnchor: [0, -pinHeight + 10], // Position below pin (anchor at top-center of label)
      });

      L.marker([stage.coordinates.lat, stage.coordinates.lng], {
        icon: labelIcon,
        interactive: false,
        pane: "cityLabels",
      }).addTo(map);
    });

    // Add distance labels ON the route segments (like reference image)
    for (let i = 1; i < mainStages.length; i++) {
      const stage = mainStages[i];
      const prevStage = mainStages[i - 1];

      if (stage.distanceFromPrevious) {
        // Calculate midpoint of segment
        const midLat = (stage.coordinates.lat + prevStage.coordinates.lat) / 2;
        const midLng = (stage.coordinates.lng + prevStage.coordinates.lng) / 2;

        // Calculate angle of segment for rotation
        const dx = stage.coordinates.lng - prevStage.coordinates.lng;
        const dy = stage.coordinates.lat - prevStage.coordinates.lat;
        let angle = Math.atan2(-dx, dy) * (180 / Math.PI); // Convert to degrees
        
        // Keep text readable (not upside down)
        if (angle > 90) angle -= 180;
        if (angle < -90) angle += 180;

        const distanceIcon = L.divIcon({
          className: "distance-label-rotated",
          html: `
            <div style="
              background: ${markerColor};
              padding: 3px 8px;
              border-radius: 10px;
              font-size: 9px;
              font-weight: 600;
              color: white;
              white-space: nowrap;
              box-shadow: 0 1px 4px rgba(0,0,0,0.2);
              transform: rotate(${angle}deg);
              transform-origin: center center;
            ">${stage.distanceFromPrevious} miili</div>
          `,
          iconSize: [60, 20],
          iconAnchor: [30, 10],
        });

        L.marker([midLat, midLng], {
          icon: distanceIcon,
          interactive: false,
          pane: "distanceLabels",
        }).addTo(map);
      }
    }

    // Fit bounds to show all markers
    const bounds = L.latLngBounds(routeCoordinates);
    map.fitBounds(bounds, { padding: [60, 60] });

    return () => {
      if (mapInstanceRef.current) {
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
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#2196F3", border: "2px solid white", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
            <span className="text-sm text-muted-foreground">Sihtkohad</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5" style={{ backgroundColor: "#2196F3", backgroundImage: "repeating-linear-gradient(90deg, #2196F3, #2196F3 8px, transparent 8px, transparent 14px)" }} />
            <span className="text-sm text-muted-foreground">Marsruut</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveMap;
