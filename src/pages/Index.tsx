import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import InteractiveMap from "@/components/InteractiveMap";
import StagesSection from "@/components/StagesSection";
import BookingForm from "@/components/BookingForm";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <InteractiveMap />
        <AboutSection />
        <StagesSection />
        <BookingForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
