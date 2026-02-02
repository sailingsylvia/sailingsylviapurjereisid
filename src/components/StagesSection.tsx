import { motion } from "framer-motion";
import { voyageStages } from "@/data/voyageData";
import StageCard from "./StageCard";
import { Sailboat } from "lucide-react";

// Placeholder images - these would be replaced with actual destination images
const stageImages = [
  "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=600&fit=crop", // Tallinn
  "https://images.unsplash.com/photo-1513415756790-2ac1db1297d0?w=800&h=600&fit=crop", // Kiel
  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&h=600&fit=crop", // Calais/France
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", // Brest
  "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&h=600&fit=crop", // Lisbon
  "https://images.unsplash.com/photo-1579523858131-c4e1e6d2d8c6?w=800&h=600&fit=crop", // Gibraltar
  "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=600&fit=crop", // Valencia
  "https://images.unsplash.com/photo-1581351123004-757df051db8e?w=800&h=600&fit=crop", // Mallorca
  "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800&h=600&fit=crop", // Monaco
  "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop", // Rome
  "https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=800&h=600&fit=crop", // Vieste/Italy coast
  "https://images.unsplash.com/photo-1555990538-1e4c0f30ab79?w=800&h=600&fit=crop", // Split
  "https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?w=800&h=600&fit=crop", // Patras/Greece
  "https://images.unsplash.com/photo-1568797629192-789acf8e4df3?w=800&h=600&fit=crop", // Valletta
  "https://images.unsplash.com/photo-1518732751612-2c0787ff5684?w=800&h=600&fit=crop", // Tenerife
];

const StagesSection = () => {
  return (
    <section className="py-24 bg-background" id="etapid">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 text-ocean-medium font-medium text-sm uppercase tracking-widest mb-4">
            <Sailboat size={16} />
            Reisi etapid
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            15 Unustamatut Sihtkohta
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Iga etapp on unikaalne seiklus. Vali endale sobiv lõik või tule terve reisi peale!
          </p>
        </motion.div>

        <div className="space-y-24">
          {voyageStages.map((stage, index) => (
            <StageCard
              key={stage.id}
              stage={stage}
              index={index}
              image={stageImages[index]}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StagesSection;
