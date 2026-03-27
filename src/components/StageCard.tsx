import { motion } from "framer-motion";
import { MapPin, Calendar, Navigation, Compass, Waves, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoyageStage, sailingTrainingTopics } from "@/data/voyageData";

interface StageCardProps {
  stage: VoyageStage;
  index: number;
  image: string;
}

const StageCard = ({ stage, index, image }: StageCardProps) => {
  const isEven = index % 2 === 0;

  const scrollToBooking = () => {
    window.dispatchEvent(new CustomEvent("select-stage", { detail: stage.id }));
    const element = document.getElementById("broneeri");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Don't show price section for start point
  const showPrice = !stage.isStartPoint && stage.pricePerDay > 0;

  return (
    <motion.article
      className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 items-stretch lg:items-center`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      {/* Image */}
      <div className="w-full lg:w-1/2">
        <motion.div
          className="relative overflow-hidden rounded-2xl shadow-elevated group"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div className="aspect-[16/10] w-full">
            <img
              src={image}
              alt={`${stage.city}, ${stage.country}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          
          {/* Distance badge */}
          {stage.distanceFromPrevious && (
            <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="text-sm font-medium text-ocean-medium flex items-center gap-1">
                <Navigation size={14} />
                {stage.distanceFromPrevious} nm
              </span>
            </div>
          )}

          {/* Sailing training badge */}
          {stage.hasSailingTraining && (
            <div className="absolute top-4 left-4 bg-gold/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="text-sm font-medium text-foreground flex items-center gap-1">
                <GraduationCap size={14} />
                Purjetamiskoolitus
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
              {stage.startDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {stage.startDate}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="w-full lg:w-1/2 px-4 lg:px-8">
        {/* Duration and booking info - only for non-start points */}
        {stage.startDate && (
          <div className="mb-6 p-4 bg-secondary rounded-xl border border-border">
            <div className="flex items-center gap-4 flex-wrap">
              <Calendar className="text-ocean-medium" size={20} />
              <div>
                <span className="font-display text-lg text-foreground">Start: {stage.startDate}</span>
                {stage.duration && (
                  <span className="text-sm text-muted-foreground ml-2">• {stage.duration}</span>
                )}
                {stage.distanceFromPrevious && (
                  <span className="text-sm text-muted-foreground ml-2">• {stage.distanceFromPrevious} nM</span>
                )}
              </div>
            </div>
          </div>
        )}

        {stage.isStartPoint && (
          <div className="mb-6 p-4 bg-ocean-deep/10 rounded-xl border border-ocean-medium/30">
            <div className="flex items-center gap-2">
              <Navigation className="text-ocean-medium" size={20} />
              <span className="font-display text-lg text-ocean-deep">Stardipunkt</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Siit algab meie suur purjeseiklus Vahemere poole
            </p>
          </div>
        )}

        <p className="text-muted-foreground leading-relaxed mb-4">
          {stage.description}
        </p>

        {stage.distanceFromPrevious && stage.id !== "brest-vilamoura" && stage.id !== "moraira-nettuno" && (
          <p className="text-sm text-muted-foreground/80 italic mb-6">
            Igal õhtul jõuame erinevasse sadamasse, kus saab tutvuda kohalike vaatamisväärsustega ja võimalusel kohtuda kohapeal elavate eestlastega.
          </p>
        )}

        {/* Sailing Training Section */}
        {stage.hasSailingTraining && (
          <div className="mb-6 p-4 bg-gold/10 rounded-xl border border-gold/30">
            <h4 className="flex items-center gap-2 font-display text-lg text-foreground mb-3">
              <GraduationCap size={18} className="text-gold" />
              Soovijatele intensiivne purjetamiskoolitus
            </h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {sailingTrainingTopics.map((topic, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gold mt-0.5">•</span>
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        )}

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

        {/* Activities - only if there are any */}
        {stage.activities.length > 0 && (
          <div className="mb-8">
            <h4 className="flex items-center gap-2 font-display text-lg text-foreground mb-3">
              <Waves size={18} className="text-ocean-light" />
              Võimalikud tegevused sihtkohas
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
        )}

        <Button variant="hero" size="lg" onClick={scrollToBooking}>
          Broneeri see etapp
        </Button>
      </div>
    </motion.article>
  );
};

export default StageCard;
