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

    // Gold color from CSS - #cba747
    const goldColor = "#cba747";
    const oceanColor = "#1e3a5f";
    const accentColor = "#0891b2";

    // Create custom marker icons
    const createMarkerIcon = (isStart: boolean, isEnd: boolean) => {
      const color = isStart ? oceanColor : isEnd ? goldColor : accentColor;
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

    // Add distance labels on route segments
    for (let i = 1; i < mainStages.length; i++) {
      const stage = mainStages[i];
      const prevStage = mainStages[i - 1];
      
      if (stage.distanceFromPrevious) {
        // Calculate midpoint
        const midLat = (stage.coordinates.lat + prevStage.coordinates.lat) / 2;
        const midLng = (stage.coordinates.lng + prevStage.coordinates.lng) / 2;
        
        // Add distance label
        const distanceIcon = L.divIcon({
          className: "distance-label",
          html: `
            <div style="
              background: white;
              padding: 2px 6px;
              border-radius: 10px;
              font-size: 10px;
              font-weight: 600;
              color: ${accentColor};
              white-space: nowrap;
              box-shadow: 0 1px 4px rgba(0,0,0,0.2);
              border: 1px solid ${accentColor};
            ">${stage.distanceFromPrevious} nm</div>
          `,
          iconSize: [50, 20],
          iconAnchor: [25, 10],
        });
        
        L.marker([midLat, midLng], { icon: distanceIcon, interactive: false }).addTo(map);
      }
    }

    // Add markers and labels for each stage
    mainStages.forEach((stage, index) => {
      const isStart = index === 0;
      const isEnd = index === mainStages.length - 1;

      // Add marker
      L.marker([stage.coordinates.lat, stage.coordinates.lng], {
        icon: createMarkerIcon(isStart, isEnd),
      }).addTo(map);

      // Add persistent label with city name and date
      const labelOffset = index % 2 === 0 ? -35 : 35;
      const labelIcon = L.divIcon({
        className: "city-label",
        html: `
          <div style="
            background: white;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            color: ${oceanColor};
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            border-left: 3px solid ${isStart ? oceanColor : isEnd ? goldColor : accentColor};
            text-align: left;
          ">
            <div style="font-weight: 700; font-size: 12px;">${stage.city}</div>
            ${stage.arrivalDate ? `<div style="font-size: 10px; color: #666; font-weight: 400;">${stage.arrivalDate}</div>` : ''}
          </div>
        `,
        iconSize: [100, 40],
        iconAnchor: [-15, 20 + labelOffset * 0.3],
      });

      L.marker([stage.coordinates.lat, stage.coordinates.lng], { 
        icon: labelIcon,
        interactive: false 
      }).addTo(map);
    });

    // Fit bounds to show all markers
    const bounds = L.latLngBounds(routeCoordinates);
    map.fitBounds(bounds, { padding: [50, 50] });

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
