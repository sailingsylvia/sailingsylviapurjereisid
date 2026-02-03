import { motion } from "framer-motion";
import { voyageSections } from "@/data/voyageData";
import StageCard from "./StageCard";
import { Sailboat, Anchor } from "lucide-react";

// Import images
import roomassaareHarbor from "@/assets/roomassaare-harbor.jpg";
import kielCanal from "@/assets/kiel-canal.jpg";
import dusseldorfRhine from "@/assets/dusseldorf-rhine.jpg";
import brestCastle from "@/assets/brest-castle.jpg";
import vilamouraPort from "@/assets/vilamoura-port.jpg";
import morairaBeach from "@/assets/moraira-beach-v3.jpg";
import mallorcaLagoon from "@/assets/mallorca-lagoon.jpg";
import sardiniaCalaLuna from "@/assets/sardinia-cala-luna.jpg";
import orikumMarina from "@/assets/orikum-marina.jpg";
import corfuAgiosGordios from "@/assets/corfu-agios-gordios.jpg";
import jooniaMeri from "@/assets/joonia-meri.jpg";
import akropolis from "@/assets/akropolis.jpg";
import parosVillage from "@/assets/paros-village.jpg";
import santoriniCyclades from "@/assets/santorini-cyclades.jpg";
import hydraIsland from "@/assets/hydra-island.jpg";
import peloponneseCoast from "@/assets/peloponnese-coast.jpg";
import piraeusPort from "@/assets/piraeus-port.jpg";

// Import Ibiza image
import ibizaBeach from "@/assets/ibiza-beach.jpg";

// Images for each destination
const stageImages: Record<string, string> = {
  "roomassaare": roomassaareHarbor,
  "kiel": kielCanal,
  "dusseldorf": dusseldorfRhine,
  "brest": brestCastle,
  "vilamoura": vilamouraPort,
  "moraira": morairaBeach,
  "ibiza": ibizaBeach,
  "mallorca": mallorcaLagoon,
  "sardiinia": sardiniaCalaLuna,
  "orikum": orikumMarina,
  "korfu": corfuAgiosGordios,
  "lefkada": jooniaMeri,
  "egeuse": santoriniCyclades,
  "ateena": hydraIsland,
};

const defaultImage = akropolis;

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
                  ? "10 etappi läbi Euroopa kaunimate sadamate. Vali endale sobiv lõik!"
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
