import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Anchor, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#marsruut", label: "Marsruut" },
    { href: "#etapid", label: "Etapid" },
    { href: "#broneeri", label: "Broneeri" },
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-card/95 backdrop-blur-md shadow-soft"
          : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <Anchor
              size={28}
              className={isScrolled ? "text-ocean-deep" : "text-gold"}
            />
            <span
              className={`font-display text-xl ${
                isScrolled ? "text-foreground" : "text-primary-foreground"
              }`}
            >
              Sylvia
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-gold ${
                  isScrolled
                    ? "text-foreground"
                    : "text-primary-foreground/80"
                }`}
              >
                {link.label}
              </a>
            ))}
            <Button
              variant={isScrolled ? "hero" : "gold"}
              size="sm"
            >
              Võta ühendust
            </Button>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X
                size={24}
                className={isScrolled ? "text-foreground" : "text-primary-foreground"}
              />
            ) : (
              <Menu
                size={24}
                className={isScrolled ? "text-foreground" : "text-primary-foreground"}
              />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden bg-card rounded-lg shadow-elevated mb-4 p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-3 text-foreground hover:text-ocean-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Button variant="hero" className="w-full mt-4">
              Võta ühendust
            </Button>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
