
import { Card, CardContent } from "@/components/ui/card";

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
                    <svg width="45" height="36" className="text-calafate-300 mb-5" viewBox="0 0 45 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.2 36C11 36 9.1 35.2 7.5 33.6C5.9 32 5.1 30.1 5.1 27.9C5.1 26.9 5.3 25.9 5.7 24.9C6.1 23.9 6.7 22.9 7.5 21.9C8.3 20.9 9 20.1 9.6 19.5C10.2 18.9 11.1 18 12.3 16.8C13.1 16 13.8 15.1 14.4 14.1C15 13.1 15.3 12.2 15.3 11.4C15.3 10.8 15.1 10.3 14.7 9.9C14.3 9.5 13.8 9.3 13.2 9.3C11.6 9.3 10.6 10.3 10.2 12.3C9.8 14.3 8.5 15.3 6.3 15.3C5.1 15.3 4.2 15 3.6 14.4C3 13.8 2.7 13 2.7 12C2.7 10.2 3.1 8.6 3.9 7.2C4.7 5.8 5.8 4.7 7.2 3.9C8.6 3.1 10.2 2.7 12 2.7C14.8 2.7 17.1 3.7 18.9 5.7C20.7 7.7 21.6 10.2 21.6 13.2C21.6 16.8 19.8 20.4 16.2 24C15.2 25 14.5 25.8 14.1 26.4C13.7 27 13.5 27.7 13.5 28.5C13.5 29.3 13.8 30 14.4 30.6C15 31.2 15.7 31.5 16.5 31.5C17.7 31.5 18.7 31.1 19.5 30.3C20.3 29.5 20.7 28.5 20.7 27.3C20.7 26.7 20.9 26.2 21.3 25.8C21.7 25.4 22.2 25.2 22.8 25.2C23.4 25.2 23.9 25.4 24.3 25.8C24.7 26.2 24.9 26.7 24.9 27.3C24.9 29.5 24.1 31.4 22.5 33C20.7 34.6 18.7 35.7 16.5 36.3C15.5 36.1 14.4 36 13.2 36ZM34.8 36C32.6 36 30.7 35.2 29.1 33.6C27.5 32 26.7 30.1 26.7 27.9C26.7 26.9 26.9 25.9 27.3 24.9C27.7 23.9 28.3 22.9 29.1 21.9C29.9 20.9 30.6 20.1 31.2 19.5C31.8 18.9 32.7 18 33.9 16.8C34.7 16 35.4 15.1 36 14.1C36.6 13.1 36.9 12.2 36.9 11.4C36.9 10.8 36.7 10.3 36.3 9.9C35.9 9.5 35.4 9.3 34.8 9.3C33.2 9.3 32.2 10.3 31.8 12.3C31.4 14.3 30.1 15.3 27.9 15.3C26.7 15.3 25.8 15 25.2 14.4C24.6 13.8 24.3 13 24.3 12C24.3 10.2 24.7 8.6 25.5 7.2C26.3 5.8 27.4 4.7 28.8 3.9C30.2 3.1 31.8 2.7 33.6 2.7C36.4 2.7 38.7 3.7 40.5 5.7C42.3 7.7 43.2 10.2 43.2 13.2C43.2 16.8 41.4 20.4 37.8 24C36.8 25 36.1 25.8 35.7 26.4C35.3 27 35.1 27.7 35.1 28.5C35.1 29.3 35.4 30 36 30.6C36.6 31.2 37.3 31.5 38.1 31.5C39.3 31.5 40.3 31.1 41.1 30.3C41.9 29.5 42.3 28.5 42.3 27.3C42.3 26.7 42.5 26.2 42.9 25.8C43.3 25.4 43.8 25.2 44.4 25.2C45 25.2 45.5 25.4 45.9 25.8C46.3 26.2 46.5 26.7 46.5 27.3C46.5 29.5 45.7 31.4 44.1 33C42.5 34.6 40.5 35.7 38.1 36.3C37.1 36.1 36 36 34.8 36Z" fill="currentColor" />
                    </svg>
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
