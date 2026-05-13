
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Traslados desde y hacia el Aeropuerto de El Calafate
          </h1>
          <p className="text-lg md:text-xl text-white mb-8">
            Transporte cómodo, seguro y puntual a todos los hoteles y destinos de El Calafate.
            Servicio profesional con los mejores vehículos.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-calafate-600 hover:bg-calafate-500 text-white px-8"
              onClick={() => document.getElementById('reservation-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Reservar Traslado <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/20"
            >
              Conocer Más
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
