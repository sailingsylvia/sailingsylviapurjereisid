import { motion } from "framer-motion";
import { voyageSections } from "@/data/voyageData";
import StageCard from "./StageCard";
import { Sailboat, Anchor } from "lucide-react";

// Images for each destination
const stageImages: Record<string, string> = {
  "1.1": "https://images.unsplash.com/photo-1565022536102-f7645c84354a?w=800&h=600&fit=crop", // Saaremaa/Estonia coast
  "1.2": "https://images.unsplash.com/photo-1513415756790-2ac1db1297d0?w=800&h=600&fit=crop", // Kiel
  "1.3": "https://images.unsplash.com/photo-1577462281852-31e5e8c5b1ea?w=800&h=600&fit=crop", // Düsseldorf
  "1.4": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", // Brest
  "1.5": "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&h=600&fit=crop", // Algarve/Vilamoura
  "1.6": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop", // Costa Blanca/Moraira
  "1.7": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop", // Ibiza
  "1.8": "https://images.unsplash.com/photo-1581351123004-757df051db8e?w=800&h=600&fit=crop", // Mallorca
  "1.9": "https://images.unsplash.com/photo-1523365154888-8a758819b720?w=800&h=600&fit=crop", // Sardinia
  "1.10": "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&h=600&fit=crop", // Albania coast
  "1.11": "https://images.unsplash.com/photo-1586861635167-e5e559139600?w=800&h=600&fit=crop", // Corfu
  "2.1": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop", // Lefkada
  "2.2": "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&h=600&fit=crop", // Mykonos
  "2.3": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop", // Santorini
  "2.4": "https://images.unsplash.com/photo-1555400082-86c2a35fb725?w=800&h=600&fit=crop", // Hydra
  "2.5": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", // Nafplio
  "2.6": "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&h=600&fit=crop", // Athens
};

const defaultImage = "https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800&h=600&fit=crop";

const StagesSection = () => {
  return (
    <section className="py-24 bg-background" id="etapid">
      <div className="container mx-auto px-4">
        {voyageSections.map((section) => (
          <div key={section.id} className="mb-32 last:mb-0">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 text-ocean-medium font-medium text-sm uppercase tracking-widest mb-4">
                {section.id === 1 ? <Sailboat size={16} /> : <Anchor size={16} />}
                {section.period}
              </span>
              <h2 className="font-display text-4xl md:text-5xl text-foreground mb-2">
                {section.title}
              </h2>
              <p className="font-display text-xl text-ocean-medium italic mb-4">
                {section.subtitle}
              </p>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {section.id === 1 
                  ? `${section.stages.length} etappi läbi Euroopa kaunimate sadamate. Vali endale sobiv lõik!`
                  : "Kreeka saarestiku avastamine 10-päevaste etappidena."}
              </p>
            </motion.div>

            <div className="space-y-24">
              {section.stages.map((stage, index) => (
                <StageCard
                  key={stage.id}
                  stage={stage}
                  index={index}
                  image={stageImages[stage.id] || defaultImage}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StagesSection;
