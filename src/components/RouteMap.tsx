import { motion } from "framer-motion";
import { voyageStages } from "@/data/voyageData";
import { MapPin, Navigation } from "lucide-react";

const RouteMap = () => {
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
            Marsruut 2025
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tallinnast Tenerifeni läbi 15 unustamatu sihtkoha. 
            Iga peatuskoht pakub ainulaadseid elamusi ja avastusi.
          </p>
        </motion.div>

        {/* Route visualization - horizontal timeline */}
        <div className="relative overflow-x-auto pb-8">
          <div className="min-w-[1200px] px-8">
            {/* Connection line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-ocean-deep via-ocean-medium to-ocean-light" 
                 style={{ transform: 'translateY(-50%)' }} 
            />

            {/* Route points */}
            <div className="relative flex justify-between items-center">
              {voyageStages.map((stage, index) => (
                <motion.div
                  key={stage.id}
                  className="relative flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Distance badge - alternating top/bottom */}
                  {stage.distanceFromPrevious && (
                    <div 
                      className={`absolute ${index % 2 === 0 ? '-top-16' : 'top-20'} left-1/2 -translate-x-1/2 whitespace-nowrap`}
                    >
                      <span className="text-xs font-medium text-ocean-medium bg-card px-2 py-1 rounded-full shadow-soft">
                        {stage.distanceFromPrevious} miili
                      </span>
                    </div>
                  )}

                  {/* Point marker */}
                  <motion.div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-card cursor-pointer transition-all duration-300 hover:scale-110 ${
                      index === 0 
                        ? 'bg-ocean-deep' 
                        : index === voyageStages.length - 1 
                        ? 'bg-gold' 
                        : 'bg-ocean-light'
                    }`}
                    whileHover={{ y: -5 }}
                  >
                    <MapPin size={18} className="text-primary-foreground" />
                  </motion.div>

                  {/* City info - alternating top/bottom */}
                  <div 
                    className={`absolute ${index % 2 === 0 ? 'top-14' : '-top-14'} text-center min-w-[80px]`}
                  >
                    <div className="font-display text-sm font-semibold text-foreground">
                      {stage.city}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stage.arrivalDate}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-8 mt-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-ocean-deep" />
            <span className="text-sm text-muted-foreground">Start (Tallinn)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-ocean-light" />
            <span className="text-sm text-muted-foreground">Peatused</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gold" />
            <span className="text-sm text-muted-foreground">Finiš (Tenerife)</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RouteMap;
