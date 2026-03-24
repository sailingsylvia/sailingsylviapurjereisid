import { motion } from "framer-motion";
import { voyageSections } from "@/data/voyageData";
import StageCard from "./StageCard";
import { Sailboat, Anchor, Moon, Phone, Info } from "lucide-react";

// Import images
import roomassaareHarbor from "@/assets/roomassaare-harbor.jpg";
import kielCanal from "@/assets/kiel-canal.jpg";
import dusseldorfRhine from "@/assets/dusseldorf-rhine.jpg";
import brestCastle from "@/assets/brest-castle.jpg";
import vilamouraPort from "@/assets/vilamoura-port.jpg";
import morairaBeach from "@/assets/moraira-beach-v3.jpg";
import marinaDelNettuno from "@/assets/marina-del-nettuno.jpg";
import orikumMarina from "@/assets/orikum-marina.jpg";
import jooniaMeri from "@/assets/joonia-meri.jpg";
import akropolis from "@/assets/akropolis.jpg";
import santoriniCyclades from "@/assets/santorini-cyclades.jpg";
import hydraIsland from "@/assets/hydra-island.jpg";

// Images for each destination
const stageImages: Record<string, string> = {
  "roomassaare-kiel": roomassaareHarbor,
  "kiel-dusseldorf": kielCanal,
  "dusseldorf-brest": dusseldorfRhine,
  "brest-vilamoura": brestCastle,
  "vilamoura-moraira": vilamouraPort,
  "moraira-nettuno": morairaBeach,
  "nettuno-orikum": marinaDelNettuno,
  "lefkada": jooniaMeri,
  "egeuse": santoriniCyclades,
  "ateena": hydraIsland,
};

const defaultImage = akropolis;

const StagesSection = () => {
  return (
    <section className="py-24 bg-background" id="etapid">
      <div className="container mx-auto px-4">
        {/* Info boxes */}
        <div className="max-w-3xl mx-auto mb-16 space-y-4">
          <motion.div
            className="p-5 bg-secondary rounded-xl border border-border flex items-start gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Moon className="text-ocean-medium mt-0.5 shrink-0" size={22} />
            <div>
              <h3 className="font-display text-lg text-foreground mb-1">Ööetapid</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Igal õhtul jõuame erinevasse sadamasse, <strong>välja arvatud</strong> kolmel pikemal üleminekul: 
                Brestist Hispaania suunas, Mallorcalt Sardiinia suunas ja Sardiiniast Sitsiilia suunas — need on ööetapid, 
                kus purjetame läbi öö.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="p-5 bg-secondary rounded-xl border border-border flex items-start gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Phone className="text-ocean-medium mt-0.5 shrink-0" size={22} />
            <div>
              <h3 className="font-display text-lg text-foreground mb-1">Erisoovid</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Erisoovide korral (nt varem peale tulemine, varem maha minemine vms) palun võtke kapteniga personaalselt ühendust — 
                leiame koos parima lahenduse.
              </p>
            </div>
          </motion.div>
        </div>

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
                  ? "7 etappi läbi Euroopa kaunimate sadamate. Vali endale sobiv lõik!"
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
