
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Excelente servicio. El conductor llegó puntual y fue muy amable. El vehículo estaba impecable. Totalmente recomendable.",
    author: "María González",
    location: "Buenos Aires, Argentina",
  },
  {
    quote: "Utilizamos el servicio para ir desde el aeropuerto a nuestro hotel. La reserva fue muy fácil y todo salió como lo planeado.",
    author: "Juan Pérez",
    location: "Santiago, Chile",
  },
  {
    quote: "Personal muy profesional y atento. Monitorearon nuestro vuelo que se retrasó y estuvieron esperándonos a la salida. Muy confiable.",
    author: "Laura Torres",
    location: "Montevideo, Uruguay",
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-calafate-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-calafate-900">
          Lo que dicen nuestros clientes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-none shadow-md bg-white">
              <CardContent className="pt-6">
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <Quote className="text-calafate-300 mb-5 h-9 w-12" />
                  </div>
                  <p className="text-gray-700 flex-1 mb-4">{testimonial.quote}</p>
                  <div className="mt-auto">
                    <p className="font-semibold text-calafate-800">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
