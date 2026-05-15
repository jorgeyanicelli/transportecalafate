import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Booking = {
  id: string;
  created_at: string;
  booking_ref: string | null;
  status: string;
  service_type: string;
  passenger_name: string;
  passenger_email: string;
  passenger_whatsapp: string;
  passenger_count: number | null;
  vehicle_preference: string | null;
};

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        navigate("/admin/login", { replace: true });
        return;
      }
      const { data: rows } = await supabase
        .from("bookings")
        .select("id,created_at,booking_ref,status,service_type,passenger_name,passenger_email,passenger_whatsapp,passenger_count,vehicle_preference")
        .order("created_at", { ascending: false });
      if (mounted) {
        setBookings((rows ?? []) as Booking[]);
        setLoading(false);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/admin/login", { replace: true });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1e3a6e] text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Panel — Transporte Calafate</h1>
        <Button onClick={handleLogout} className="bg-[#f07820] hover:bg-[#f59240] text-white">
          Cerrar sesión
        </Button>
      </header>
      <main className="p-6 max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1e3a6e]">Reservas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Cargando...</p>
            ) : bookings.length === 0 ? (
              <p className="text-gray-500">Aún no hay reservas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-left">
                    <tr>
                      <th className="p-2">Ref</th>
                      <th className="p-2">Fecha</th>
                      <th className="p-2">Servicio</th>
                      <th className="p-2">Pasajero</th>
                      <th className="p-2">WhatsApp</th>
                      <th className="p-2">Pax</th>
                      <th className="p-2">Vehículo</th>
                      <th className="p-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-t">
                        <td className="p-2 font-mono">{b.booking_ref}</td>
                        <td className="p-2">{new Date(b.created_at).toLocaleString()}</td>
                        <td className="p-2">{b.service_type}</td>
                        <td className="p-2">{b.passenger_name}</td>
                        <td className="p-2">{b.passenger_whatsapp}</td>
                        <td className="p-2">{b.passenger_count}</td>
                        <td className="p-2">{b.vehicle_preference}</td>
                        <td className="p-2">{b.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}