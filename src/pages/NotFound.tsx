
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-calafate-50 py-20">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-6xl font-bold text-calafate-600 mb-4">404</h1>
          <p className="text-2xl text-gray-700 mb-8">
            Lo sentimos, la página que estás buscando no existe.
          </p>
          <Button asChild className="bg-calafate-600 hover:bg-calafate-500">
            <Link to="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
