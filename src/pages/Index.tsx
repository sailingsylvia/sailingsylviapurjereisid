import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import RouteMap from "@/components/RouteMap";
import StagesSection from "@/components/StagesSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <RouteMap />
        <StagesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
