import { motion } from "framer-motion";
import { Anchor, Award, Users, Sailboat } from "lucide-react";

// Import yacht images
import sylviaSailing1 from "@/assets/sylvia-sailing-1.jpeg";
import sylviaRacing2 from "@/assets/sylvia-racing-2.jpg";
import sylviaRacing3 from "@/assets/sylvia-racing-3.jpg";
import sylviaCrew2 from "@/assets/sylvia-crew-2.jpg";

const AboutSection = () => {
  return (
    <section className="py-20 bg-card" id="meist">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 text-ocean-medium font-medium text-sm uppercase tracking-widest mb-4">
            <Anchor size={16} />
            Tutvustus
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Jaht Sylvia & Kapten Aare
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Kogenud kapten ja legendaarne purjejaht – täiuslik kombinatsioon unustamatuks merereisiks
          </p>
        </motion.div>

        {/* Yacht Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <img
                src={sylviaSailing1}
                alt="Purjejaht Sylvia merel"
                className="w-full h-[400px] object-cover rounded-2xl shadow-card"
              />
              <div className="absolute -bottom-6 -right-6 bg-ocean-deep text-primary-foreground p-4 rounded-xl shadow-lg">
                <Sailboat size={32} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="font-display text-3xl text-foreground mb-6">
              Jaht Sylvia
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Ruumikas ja mugav <strong className="text-foreground">Grand Soleil 43</strong> pakub mugavat äraolemist 7+2 reisijale koos magamiskohtadega (kambüüsi mahub magama 2 ja vöörikajutisse 3) ja kuni 10 reisijale lühemateks meresõitudeks.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Laevas on kolm kahekohalist kajutit, avar salong, täisvarustuses köök (meresõitjate keeles kambüüs) ja kaks WC-d/dušširuumi. Välistekk on piisavalt avar, et seal kogu meeskonnaga päevitada.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Sylvia on turvaline, merekindel ja hea varustusega avamerejaht, mis võimaldab nii mugavat meresõitu kui sportlikku mõõduvõtmist.
            </p>

            {/* Yacht specs */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-secondary rounded-xl">
                <div className="text-2xl font-display text-ocean-deep mb-1">43'</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Pikkus</div>
              </div>
              <div className="text-center p-4 bg-secondary rounded-xl">
                <div className="text-2xl font-display text-ocean-deep mb-1">7+2</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Magamiskohti</div>
              </div>
              <div className="text-center p-4 bg-secondary rounded-xl">
                <div className="text-2xl font-display text-ocean-deep mb-1">3</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Kajutit</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Captain Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            className="lg:order-2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <img
                src={sylviaCrew2}
                alt="Kapten Aare Kööp meeskonnaga"
                className="w-full h-[400px] object-cover rounded-2xl shadow-card"
              />
              <div className="absolute -bottom-6 -left-6 bg-gold text-foreground p-4 rounded-xl shadow-lg">
                <Award size={32} />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="font-display text-3xl text-foreground mb-6">
              Kapten Aare Kööp
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Sylvia pardal tervitab Teid kapten <strong className="text-foreground">Aare Kööp</strong>, kes on purjetanud enam kui pool sajandit. Lapsena Pirital Optimistil alustanud ning 15 aastat NL koondises seilanuna võib ta julgelt väita, et tunneb ennast merel kodusemalt kui maismaal!
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Aare ütleb enda kohta naljatledes, et on purjetanud vähemalt neli aastat, seega umbes täpselt 60. Pikk meresõitjateekond, palju kogemusi ja samas kerge huumorimeel, mis aitab hoida meeskonnas head pulssi nii pingelisel võistlushetkel kui ka rahulikul kruiisil.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Lisaks turvalisele merereisile võib Aare jutustada lõputult põnevaid merelugusid, mis on aastatega kogunenud.
            </p>

            {/* Captain achievements */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-secondary rounded-xl">
                <div className="text-2xl font-display text-gold mb-1">60+</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Aastat merel</div>
              </div>
              <div className="text-center p-4 bg-secondary rounded-xl">
                <div className="text-2xl font-display text-gold mb-1">20+</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Medalit</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="font-display text-2xl text-foreground text-center mb-8">
            Sylvia pardal
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="relative group overflow-hidden rounded-xl">
              <img
                src={sylviaRacing2}
                alt="Sylvia regatirajal"
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-primary-foreground font-medium">Regatirajal</span>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-xl">
              <img
                src={sylviaRacing3}
                alt="Sylvia täispurjedes"
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-primary-foreground font-medium">Täispurjedes</span>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-xl md:col-span-1">
              <img
                src={sylviaSailing1}
                alt="Meeskond pardal"
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ocean-deep/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-primary-foreground font-medium">Meeskond</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* What's included */}
        <motion.div
          className="mt-20 bg-secondary rounded-2xl p-8 md:p-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Users className="text-ocean-medium" size={28} />
            <h3 className="font-display text-2xl text-foreground">Mida hind sisaldab?</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Tasu eest saad:</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-ocean-medium mt-1">✓</span>
                  Seilata luksusliku purjejahi Sylvia (Grand Soleil 43) pardal
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-ocean-medium mt-1">✓</span>
                  Õppida purjetamist vilunud kapteni suunamisel
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-ocean-medium mt-1">✓</span>
                  Laevakütus, sadamamaksud ja aluse kindlustus
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-ocean-medium mt-1">✓</span>
                  Kasutada jahis kõike toidu valmistamiseks vajalikku
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Lisaks tuleb arvestada:</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-gold mt-1">•</span>
                  Transport sadamatesse
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold mt-1">•</span>
                  Meelelahutus kaldal (restoranid, vaatamisväärsused)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold mt-1">•</span>
                  Isiklik reisikindlustus
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold mt-1">•</span>
                  Toidukraam – ostetakse ühiselt ja jagatakse meeskonna peale
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
