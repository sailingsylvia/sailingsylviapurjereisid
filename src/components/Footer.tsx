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
              <span className="font-display text-2xl">Purjejaht Sylvia</span>
            </div>
            <p className="text-primary-foreground/70 leading-relaxed">
              Purjereisid Euroopa kauneimatesse sadamatesse. 
              Liitu meiega 2026/2027 aasta suurimal purjeseiklusel!
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display text-lg mb-4">Lingid</h4>
            <ul className="space-y-2 text-primary-foreground/70">
              <li><a href="#marsruut" className="hover:text-gold transition-colors">Marsruut</a></li>
              <li><a href="#meist" className="hover:text-gold transition-colors">Meist</a></li>
              <li><a href="#etapid" className="hover:text-gold transition-colors">Etapid</a></li>
              <li><a href="#broneeri" className="hover:text-gold transition-colors">Broneeri</a></li>
              <li>
                <a 
                  href="https://www.sailingsylvia.ee" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  Jaht Sylviast
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg mb-4">Võta ühendust</h4>
            <ul className="space-y-3 text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <Mail size={18} />
                <a href="mailto:aarekoop@gmail.com" className="hover:text-gold transition-colors">
                  aarekoop@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={18} />
                <a href="tel:+3725030001" className="hover:text-gold transition-colors">
                  +372 503 0001
                </a>
              </li>
            </ul>
            <div className="flex gap-4 mt-6">
              <a 
                href="https://www.instagram.com/sailing_sylvia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://www.facebook.com/merelesylviaga" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold transition-colors"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-primary-foreground/50 text-sm">
          © 2026 Purjejaht Sylvia. Kõik õigused kaitstud.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
