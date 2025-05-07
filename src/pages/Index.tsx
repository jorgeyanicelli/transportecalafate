
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Features from "@/components/Features";
import ReservationForm from "@/components/ReservationForm";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col calafate-background">
      <Navbar />
      <HeroSection />
      <Features />
      <ReservationForm />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;

