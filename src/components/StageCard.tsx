import { motion } from "framer-motion";
import { MapPin, Calendar, Navigation, Compass, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoyageStage } from "@/data/voyageData";

interface StageCardProps {
  stage: VoyageStage;
  index: number;
  image: string;
}

const StageCard = ({ stage, index, image }: StageCardProps) => {
  const isEven = index % 2 === 0;

  return (
    <motion.article
      className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-center`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      {/* Image */}
      <div className="lg:w-1/2">
        <motion.div
          className="relative overflow-hidden rounded-2xl shadow-elevated group"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={image}
            alt={`${stage.city}, ${stage.country}`}
            className="w-full h-80 lg:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          
          {/* Stage number badge */}
          <div className="absolute top-4 left-4 h-12 px-4 rounded-full bg-ocean-gradient flex items-center justify-center">
            <span className="font-display text-lg text-primary-foreground">{stage.id}</span>
          </div>

          {/* Distance badge */}
          {stage.distanceFromPrevious && (
            <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="text-sm font-medium text-ocean-medium flex items-center gap-1">
                <Navigation size={14} />
                {stage.distanceFromPrevious} nm
              </span>
            </div>
          )}

          {/* City overlay */}
          <div className="absolute bottom-6 left-6 right-6">
            <h3 className="font-display text-3xl text-primary-foreground mb-1">
              {stage.city}
            </h3>
            <div className="flex items-center gap-4 text-primary-foreground/80 text-sm">
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {stage.country}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {stage.duration}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="lg:w-1/2 px-4 lg:px-8">
        <p className="text-muted-foreground leading-relaxed mb-6">
          {stage.description}
        </p>

        {/* Highlights */}
        <div className="mb-6">
          <h4 className="flex items-center gap-2 font-display text-lg text-foreground mb-3">
            <Compass size={18} className="text-ocean-medium" />
            Vaatamisväärsused
          </h4>
          <div className="flex flex-wrap gap-2">
            {stage.highlights.map((highlight, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm rounded-full"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>

        {/* Activities */}
        <div className="mb-8">
          <h4 className="flex items-center gap-2 font-display text-lg text-foreground mb-3">
            <Waves size={18} className="text-ocean-light" />
            Tegevused
          </h4>
          <div className="flex flex-wrap gap-2">
            {stage.activities.map((activity, i) => (
              <span
                key={i}
                className="px-3 py-1.5 border border-border text-muted-foreground text-sm rounded-full"
              >
                {activity}
              </span>
            ))}
          </div>
        </div>

        <Button variant="hero" size="lg">
          Broneeri see etapp
        </Button>
      </div>
    </motion.article>
  );
};

export default StageCard;
