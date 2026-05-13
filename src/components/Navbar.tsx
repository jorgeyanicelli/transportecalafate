
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Phone } from "lucide-react";

const Navbar = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/9e0b2e07-a1bf-480a-a9aa-0d68f506c0a9.png" 
              alt="Transporte Calafate" 
              className="h-16"
            />
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 hover:text-calafate-700 transition-colors">
            Inicio
          </Link>
          <Link to="/servicios" className="text-gray-700 hover:text-calafate-700 transition-colors">
            Servicios
          </Link>
          <Link to="/tarifas" className="text-gray-700 hover:text-calafate-700 transition-colors">
            Tarifas
          </Link>
          <Link to="/contacto" className="text-gray-700 hover:text-calafate-700 transition-colors">
            Contacto
          </Link>
        </nav>
        <div className="flex items-center">
          <Button className="bg-calafate-600 hover:bg-calafate-500 flex items-center">
            <Phone className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Reservar Ahora</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
