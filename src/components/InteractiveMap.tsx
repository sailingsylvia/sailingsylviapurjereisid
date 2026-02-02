import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Map, Navigation } from "lucide-react";
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

    // Create custom marker icons
    const createMarkerIcon = (isStart: boolean, isEnd: boolean) => {
      const color = isStart ? "#1e3a5f" : isEnd ? "#b8860b" : "#0891b2";
      return L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
    };

    // Add route line
    const routeCoordinates = mainStages.map((stage) => [
      stage.coordinates.lat,
      stage.coordinates.lng,
    ] as [number, number]);

    L.polyline(routeCoordinates, {
      color: "#0891b2",
      weight: 3,
      opacity: 0.8,
      dashArray: "10, 8",
    }).addTo(map);

    // Add markers for each stage
    mainStages.forEach((stage, index) => {
      const isStart = index === 0;
      const isEnd = index === mainStages.length - 1;

      const marker = L.marker([stage.coordinates.lat, stage.coordinates.lng], {
        icon: createMarkerIcon(isStart, isEnd),
      }).addTo(map);

      // Create popup content with distance info
      const distanceText = stage.distanceFromPrevious
        ? `<span style="color: #0891b2; font-size: 12px;">← ${stage.distanceFromPrevious} nm</span>`
        : "";

      marker.bindPopup(`
        <div style="text-align: center; min-width: 120px;">
          <strong style="font-size: 14px;">${stage.city}</strong>
          <br/>
          <span style="color: #666; font-size: 12px;">${stage.countryCode}</span>
          <br/>
          <span style="color: #888; font-size: 11px;">${stage.duration}</span>
          ${distanceText ? `<br/>${distanceText}` : ""}
        </div>
      `);
    });

    // Fit bounds to show all markers
    const bounds = L.latLngBounds(routeCoordinates);
    map.fitBounds(bounds, { padding: [30, 30] });

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
            Marsruut 2026/2027
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Roomassaarest Korfuni läbi {mainStages.length} sihtkoha – kokku üle{" "}
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
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gold border-2 border-white shadow-sm" />
            <span className="text-sm text-muted-foreground">Finiš (Korfu)</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveMap;
