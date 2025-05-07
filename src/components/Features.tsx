
import FeatureCard from "./FeatureCard";
import { Car, Clock, MapPin, Bus } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Car,
      title: "Traslados Privados",
      description: "Servicio exclusivo en vehículos modernos para su comodidad durante el traslado."
    },
    {
      icon: Bus,
      title: "Traslados Compartidos",
      description: "Opción económica para viajar con otros pasajeros hacia el mismo destino."
    },
    {
      icon: Clock,
      title: "Puntualidad Garantizada",
      description: "Monitoreamos los vuelos para asegurar que estemos allí cuando usted llegue."
    },
    {
      icon: MapPin,
      title: "Todos los Destinos",
      description: "Servicio a todos los hoteles y puntos turísticos de El Calafate."
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-calafate-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-calafate-900">
          Nuestros Servicios
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              icon={feature.icon} 
              title={feature.title} 
              description={feature.description} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
