import { Anchor, Mail, Phone, Instagram, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-ocean-gradient text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Anchor size={32} className="text-gold" />
              <span className="font-display text-2xl">Sylvia</span>
            </div>
            <p className="text-primary-foreground/70 leading-relaxed">
              Purjereisid Euroopa kauneimates sadamates. 
              Liitu meiega 2025. aasta suurimal purjeseiklusel!
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display text-lg mb-4">Kiirlingid</h4>
            <ul className="space-y-2 text-primary-foreground/70">
              <li><a href="#marsruut" className="hover:text-gold transition-colors">Marsruut</a></li>
              <li><a href="#etapid" className="hover:text-gold transition-colors">Etapid</a></li>
              <li><a href="#broneeri" className="hover:text-gold transition-colors">Broneeri</a></li>
              <li><a href="#kontakt" className="hover:text-gold transition-colors">Kontakt</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg mb-4">Võta ühendust</h4>
            <ul className="space-y-3 text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <Mail size={18} />
                <a href="mailto:info@sylvia-sailing.ee" className="hover:text-gold transition-colors">
                  info@sylvia-sailing.ee
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={18} />
                <a href="tel:+3725551234" className="hover:text-gold transition-colors">
                  +372 555 1234
                </a>
              </li>
            </ul>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold transition-colors">
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-primary-foreground/50 text-sm">
          © 2025 Purjejht Sylvia. Kõik õigused kaitstud.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
