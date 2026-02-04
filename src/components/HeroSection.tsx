import { motion } from "framer-motion";
import { Anchor, Compass, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { totalDistanceSection1 } from "@/data/voyageData";
import heroYacht from "@/assets/sylvia-racing-3.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroYacht}
          alt="Purjejht Sylvia merel"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-hero-gradient" />
      </div>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-1/4 left-10 text-primary-foreground/20"
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <Compass size={80} />
      </motion.div>
      <motion.div
        className="absolute bottom-1/4 right-10 text-primary-foreground/20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <Anchor size={60} />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 text-gold font-medium text-sm uppercase tracking-widest mb-6">
            <Anchor size={16} />
            Purjereisid Euroopas 2026
          </span>
        </motion.div>

        <motion.h1
          className="font-display text-5xl md:text-7xl lg:text-8xl text-primary-foreground mb-6 leading-tight"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Purjejaht <span className="italic text-gold">Sylvia</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Avasta Euroopa ilusamaid sadamaid ja rannikuid meie eksklusiivsel purjereisil. 
          Roomassaarest Korfuni ja Kreeka saarestikku – üle {totalDistanceSection1.toLocaleString()} meremiili seiklust!
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button variant="gold" size="xl" asChild>
            <a href="#etapid">
              <MapPin size={20} />
              Vaata etappe
            </a>
          </Button>
          <Button variant="heroOutline" size="xl" asChild>
            <a href="#broneeri">Broneeri koht</a>
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
        {[
            { value: "16", label: "Etappi" },
            { value: `${(totalDistanceSection1 / 1000).toFixed(1)}k+`, label: "Meremiili" },
            { value: "2026", label: "Hooaeg" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-display text-gold mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-primary-foreground/60 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/40 flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-gold rounded-full" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
