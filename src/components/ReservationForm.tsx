import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, MessageCircle, Plane, PlaneTakeoff, Mountain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type ServiceType = "airport_arrival" | "airport_departure" | "tourist_transfer";
type View = "form" | "success" | "urgent" | "otros";

const WHATSAPP_NUMBER = "5492966672100";

const SERVICE_LABELS: Record<ServiceType, string> = {
  airport_arrival: "Llegada al aeropuerto",
  airport_departure: "Salida al aeropuerto",
  tourist_transfer: "Traslado turístico",
};

const AIRLINES = [
  "Aerolíneas Argentinas",
  "JetSmart",
  "Flybondi",
  "LADE",
  "Sky Airlines",
  "Privado / charter",
  "Otra",
];

const DESTINATIONS = [
  "Glaciar Perito Moreno",
  "Puerto Bandera",
  "El Chaltén - Traslado simple",
  "El Chaltén - Ida espera y regreso",
  "Otros traslados o combinaciones",
];
const OTROS_DEST = "Otros traslados o combinaciones";

const VEHICLES = [
  "Mini Bus",
  "Mercedes Sprinter",
  "Mercedes Vito",
  "Toyota HiAce",
  "Taxi / Auto privado",
  "Sin preferencia",
];

type FormState = {
  serviceType: ServiceType | "";
  airline: string;
  flightNumber: string;
  destination: string;
  date: string;
  time: string;
  address: string;
  passengers: number;
  luggage: number;
  vehicle: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
};

const initialState: FormState = {
  serviceType: "",
  airline: "",
  flightNumber: "",
  destination: "",
  date: "",
  time: "",
  address: "",
  passengers: 1,
  luggage: 1,
  vehicle: "",
  name: "",
  email: "",
  phone: "",
  notes: "",
};

const inputCls =
  "block w-full min-h-11 rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-calafate-600 focus:border-calafate-600";
const labelCls = "block text-sm font-medium text-calafate-900 mb-1";
const errCls = "mt-1 text-sm text-red-600";

function buildWhatsAppText(s: FormState, bookingRef: string, urgent: boolean) {
  const lines: string[] = [];
  if (urgent) {
    lines.push("Hola, quisiera consultar por una reserva urgente con los siguientes datos:");
  } else {
    lines.push("*NUEVA RESERVA DE TRASLADO*");
  }
  lines.push("", `*Referencia:* ${bookingRef}`);
  lines.push(`*Tipo de servicio:* ${SERVICE_LABELS[s.serviceType as ServiceType]}`);
  if (s.serviceType === "airport_arrival" || s.serviceType === "airport_departure") {
    lines.push(`*Compañía aérea:* ${s.airline}`);
    lines.push(`*Número de vuelo:* ${s.flightNumber}`);
  } else if (s.serviceType === "tourist_transfer") {
    lines.push(`*Destino:* ${s.destination}`);
  }
  lines.push(`*Fecha:* ${s.date}`);
  lines.push(`*Hora:* ${s.time}`);
  lines.push(`*Hotel / dirección:* ${s.address}`);
  lines.push(`*Pasajeros:* ${s.passengers}`);
  lines.push(`*Valijas:* ${s.luggage}`);
  lines.push(`*Vehículo preferido:* ${s.vehicle}`);
  lines.push("", "*Contacto:*");
  lines.push(`*Nombre:* ${s.name}`);
  lines.push(`*Email:* ${s.email}`);
  lines.push(`*WhatsApp:* ${s.phone}`);
  if (s.notes.trim()) lines.push("", `*Notas:* ${s.notes}`);
  return lines.join("\n");
}

function openWhatsApp(text: string) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

export default function ReservationForm() {
  const [view, setView] = useState<View>("form");
  const [step, setStep] = useState<1 | 2>(1);
  const [state, setState] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState<string>("");
  const [urgentText, setUrgentText] = useState<string>("");

  const isAirport =
    state.serviceType === "airport_arrival" || state.serviceType === "airport_departure";
  const isTransfer = state.serviceType === "tourist_transfer";

  const maxLuggage = useMemo(() => Math.max(1, (state.passengers || 1) * 2), [state.passengers]);

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setState((s) => ({ ...s, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k as string]: "" }));
  }

  function validateStep1() {
    const e: Record<string, string> = {};
    if (!state.serviceType) e.serviceType = "Seleccione el tipo de servicio";
    if (isAirport) {
      if (!state.airline) e.airline = "Seleccione la compañía aérea";
      if (!state.flightNumber.trim()) e.flightNumber = "Ingrese el número de vuelo";
      if (!state.address.trim()) e.address = "Ingrese hotel o dirección";
    }
    if (isTransfer) {
      if (!state.destination) e.destination = "Seleccione el destino";
      if (!state.address.trim()) e.address = "Ingrese dirección de recogida";
    }
    if (!state.date) e.date = "Seleccione la fecha";
    if (!state.time) e.time = "Seleccione la hora";
    if (!state.passengers || state.passengers < 1 || state.passengers > 19)
      e.passengers = "Entre 1 y 19 pasajeros";
    if (!state.luggage || state.luggage < 1 || state.luggage > maxLuggage)
      e.luggage = `Entre 1 y ${maxLuggage} valijas`;
    if (!state.vehicle) e.vehicle = "Seleccione un tipo de vehículo";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e: Record<string, string> = {};
    if (state.name.trim().length < 3) e.name = "Ingrese su nombre completo";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) e.email = "Email inválido";
    if (state.phone.trim().length < 8) e.phone = "Ingrese un WhatsApp válido";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleContinue() {
    if (!validateStep1()) return;
    setStep(2);
  }

  function handleServiceType(t: ServiceType) {
    update("serviceType", t);
    if (t !== "tourist_transfer") update("destination", "");
    if (t === "tourist_transfer") {
      update("airline", "");
      update("flightNumber", "");
    }
  }

  function handleDestination(v: string) {
    if (v === OTROS_DEST) {
      setView("otros");
      return;
    }
    update("destination", v);
  }

  async function handleSubmit() {
    if (!validateStep2()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const serviceDate = new Date(`${state.date}T${state.time}`);
      const hours = (serviceDate.getTime() - Date.now()) / 3_600_000;
      const isUrgent = hours < 12;
      const year = new Date().getFullYear();
      const ref = `TC-${year}-${Date.now()}`;
      const token = crypto.randomUUID();

      const isoDt = serviceDate.toISOString();
      const airportSvc = state.serviceType === "airport_arrival" || state.serviceType === "airport_departure";

      const { error } = await supabase.from("bookings").insert({
        booking_ref: ref,
        status: "pending",
        service_type: state.serviceType as ServiceType,
        passenger_name: state.name.trim(),
        passenger_email: state.email.trim(),
        passenger_whatsapp: state.phone.trim(),
        passenger_count: state.passengers,
        luggage_count: state.luggage,
        flight_number: airportSvc ? state.flightNumber.trim() : null,
        airline: airportSvc ? state.airline : null,
        flight_datetime: airportSvc ? isoDt : null,
        hotel_address: state.address.trim(),
        destination: state.serviceType === "tourist_transfer" ? state.destination : null,
        excursion_datetime: state.serviceType === "tourist_transfer" ? isoDt : null,
        vehicle_preference: state.vehicle,
        notes: state.notes.trim() || null,
        is_urgent: isUrgent,
        confirmation_token: token,
      });
      if (error) throw error;

      setBookingRef(ref);
      const waText = buildWhatsAppText(state, ref, isUrgent);
      if (isUrgent) {
        setUrgentText(waText);
        setView("urgent");
      } else {
        openWhatsApp(waText);
        setView("success");
      }
    } catch (err) {
      console.error("Booking insert failed:", err);
      setSubmitError("No pudimos guardar la reserva. Por favor intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setState(initialState);
    setErrors({});
    setSubmitError(null);
    setBookingRef("");
    setUrgentText("");
    setStep(1);
    setView("form");
  }

  // ----- Alternate views -----

  if (view === "otros") {
    return (
      <Section>
        <Card>
          <div className="flex flex-col items-center text-center p-6 sm:p-10">
            <div className="rounded-full bg-orange-100 p-4 mb-4">
              <MessageCircle className="h-10 w-10 text-[#f07820]" aria-hidden />
            </div>
            <h3 className="text-2xl font-bold text-calafate-900 mb-3">Traslado personalizado</h3>
            <p className="text-gray-700 max-w-xl mb-6">
              Para traslados especiales o combinaciones, contactanos por WhatsApp y armamos un servicio a tu medida.
            </p>
            <button
              type="button"
              onClick={() =>
                openWhatsApp(
                  "Hola, quisiera consultar por un traslado personalizado o combinación que no figura en la lista.",
                )
              }
              className="w-full sm:w-auto min-h-12 px-6 rounded-md bg-[#f07820] hover:bg-[#d96a18] text-white font-semibold inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              Consultar por WhatsApp
            </button>
            <button
              type="button"
              onClick={reset}
              className="mt-4 text-sm text-calafate-700 hover:underline"
            >
              Volver al formulario
            </button>
          </div>
        </Card>
      </Section>
    );
  }

  if (view === "urgent") {
    return (
      <Section>
        <Card>
          <div className="flex flex-col items-center text-center p-6 sm:p-10">
            <div className="rounded-full bg-orange-100 p-4 mb-4">
              <AlertTriangle className="h-10 w-10 text-[#f07820]" aria-hidden />
            </div>
            <h3 className="text-2xl font-bold text-calafate-900 mb-3">Consulta urgente</h3>
            <p className="text-gray-700 max-w-xl mb-6">
              Por la cercanía del horario solicitado, no podemos garantizar disponibilidad inmediata.
              Esta NO es una reserva confirmada, sino una consulta que será evaluada por nuestro equipo.
              Por favor consultanos por WhatsApp tocando el botón de abajo. Si podemos cumplir con tu pedido,
              te confirmaremos por ese medio.
            </p>
            <button
              type="button"
              onClick={() => openWhatsApp(urgentText)}
              className="w-full sm:w-auto min-h-12 px-6 rounded-md bg-[#f07820] hover:bg-[#d96a18] text-white font-semibold inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              Consultar por WhatsApp
            </button>
            <p className="mt-4 text-sm text-gray-500">
              Tu consulta quedó registrada con la referencia <span className="font-semibold">{bookingRef}</span>
            </p>
          </div>
        </Card>
      </Section>
    );
  }

  if (view === "success") {
    return (
      <Section>
        <Card>
          <div className="flex flex-col items-center text-center p-6 sm:p-10">
            <div className="rounded-full bg-green-100 p-4 mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" aria-hidden />
            </div>
            <h3 className="text-2xl font-bold text-calafate-900 mb-3">¡Reserva recibida!</h3>
            <p className="text-gray-700 mb-2">
              Tu reserva quedó registrada con la referencia{" "}
              <span className="font-semibold">{bookingRef}</span>.
            </p>
            <p className="text-gray-600 mb-6">
              Te contactaremos pronto por WhatsApp para confirmar los detalles.
            </p>
            <button
              type="button"
              onClick={reset}
              className="min-h-12 px-6 rounded-md bg-calafate-700 hover:bg-calafate-800 text-white font-semibold"
            >
              Hacer otra reserva
            </button>
          </div>
        </Card>
      </Section>
    );
  }

  // ----- Form view -----

  const serviceOptions: { value: ServiceType; icon: typeof Plane; label: string }[] = [
    { value: "airport_arrival", icon: Plane, label: "Llegada al aeropuerto" },
    { value: "airport_departure", icon: PlaneTakeoff, label: "Salida al aeropuerto" },
    { value: "tourist_transfer", icon: Mountain, label: "Traslado turístico" },
  ];

  return (
    <Section>
      <Card>
        <div className="p-5 sm:p-8">
          <div className="mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-calafate-900">
              {step === 1 ? "Detalles del viaje" : "Datos de contacto"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Paso {step} de 2</p>
          </div>

          {step === 1 ? (
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Tipo de servicio</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {serviceOptions.map((opt) => {
                    const Icon = opt.icon;
                    const selected = state.serviceType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleServiceType(opt.value)}
                        className={cn(
                          "text-left p-4 rounded-lg border-2 transition-all min-h-[88px]",
                          selected
                            ? "border-calafate-700 bg-calafate-50 ring-2 ring-calafate-600/20"
                            : "border-gray-200 hover:border-calafate-400",
                        )}
                      >
                        <Icon className="h-6 w-6 text-[#f07820] mb-2" />
                        <div className="font-medium text-sm text-calafate-900">{opt.label}</div>
                      </button>
                    );
                  })}
                </div>
                {errors.serviceType && <p className={errCls}>{errors.serviceType}</p>}
              </div>

              {isAirport && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Compañía aérea</label>
                    <select
                      className={inputCls}
                      value={state.airline}
                      onChange={(e) => update("airline", e.target.value)}
                    >
                      <option value="">Seleccione la aerolínea</option>
                      {AIRLINES.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                    {errors.airline && <p className={errCls}>{errors.airline}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Número de vuelo</label>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="Ej: AR1234"
                      value={state.flightNumber}
                      onChange={(e) => update("flightNumber", e.target.value)}
                    />
                    {errors.flightNumber && <p className={errCls}>{errors.flightNumber}</p>}
                  </div>
                </div>
              )}

              {isTransfer && (
                <div>
                  <label className={labelCls}>Destino</label>
                  <select
                    className={inputCls}
                    value={state.destination}
                    onChange={(e) => handleDestination(e.target.value)}
                  >
                    <option value="">Seleccione el destino</option>
                    {DESTINATIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.destination && <p className={errCls}>{errors.destination}</p>}
                </div>
              )}

              {state.serviceType && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>
                        {isAirport ? "Fecha del vuelo" : "Fecha del traslado"}
                      </label>
                      <input
                        type="date"
                        className={inputCls}
                        value={state.date}
                        onChange={(e) => update("date", e.target.value)}
                      />
                      {errors.date && <p className={errCls}>{errors.date}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>
                        {isAirport ? "Hora del vuelo" : "Hora del traslado"}
                      </label>
                      <input
                        type="time"
                        className={inputCls}
                        value={state.time}
                        onChange={(e) => update("time", e.target.value)}
                      />
                      {errors.time && <p className={errCls}>{errors.time}</p>}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>
                      {isAirport ? "Hotel o dirección" : "Hotel o dirección de recogida"}
                    </label>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="Ej: Hotel Posada Los Alamos"
                      value={state.address}
                      onChange={(e) => update("address", e.target.value)}
                    />
                    {errors.address && <p className={errCls}>{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Pasajeros</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={19}
                        className={inputCls}
                        value={state.passengers}
                        onChange={(e) => update("passengers", Math.max(1, Number(e.target.value) || 1))}
                      />
                      {errors.passengers && <p className={errCls}>{errors.passengers}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>Valijas</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={maxLuggage}
                        className={inputCls}
                        value={state.luggage}
                        onChange={(e) => update("luggage", Math.max(1, Number(e.target.value) || 1))}
                      />
                      <p className="mt-1 text-xs text-gray-500">Máximo 2 valijas por pasajero</p>
                      {errors.luggage && <p className={errCls}>{errors.luggage}</p>}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Tipo de vehículo preferido</label>
                    <select
                      className={inputCls}
                      value={state.vehicle}
                      onChange={(e) => update("vehicle", e.target.value)}
                    >
                      <option value="">Seleccione un vehículo</option>
                      {VEHICLES.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                    {errors.vehicle && <p className={errCls}>{errors.vehicle}</p>}
                  </div>
                </>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="w-full min-h-12 rounded-md bg-[#f07820] hover:bg-[#d96a18] text-white font-semibold"
                >
                  Continuar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className={labelCls}>Nombre completo</label>
                <input
                  type="text"
                  className={inputCls}
                  value={state.name}
                  onChange={(e) => update("name", e.target.value)}
                  autoComplete="name"
                />
                {errors.name && <p className={errCls}>{errors.name}</p>}
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email"
                  className={inputCls}
                  value={state.email}
                  onChange={(e) => update("email", e.target.value)}
                  autoComplete="email"
                />
                {errors.email && <p className={errCls}>{errors.email}</p>}
              </div>
              <div>
                <label className={labelCls}>WhatsApp (con código de país)</label>
                <input
                  type="tel"
                  className={inputCls}
                  placeholder="+54 9 2966 XXXXXX"
                  value={state.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  autoComplete="tel"
                />
                {errors.phone && <p className={errCls}>{errors.phone}</p>}
              </div>
              <div>
                <label className={labelCls}>Notas adicionales (opcional)</label>
                <textarea
                  rows={3}
                  className={cn(inputCls, "min-h-[90px]")}
                  value={state.notes}
                  onChange={(e) => update("notes", e.target.value)}
                />
              </div>

              {submitError && (
                <div className="rounded-md border border-red-300 bg-red-50 text-red-700 p-3 text-sm">
                  {submitError}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={submitting}
                  className="w-full sm:w-1/3 min-h-12 rounded-md border-2 border-calafate-700 text-calafate-700 font-semibold hover:bg-calafate-50 disabled:opacity-50"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 min-h-12 rounded-md bg-[#f07820] hover:bg-[#d96a18] text-white font-semibold disabled:opacity-60"
                >
                  {submitting ? "Enviando..." : "Confirmar Reserva"}
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </Section>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <section id="reservation-form" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-calafate-900">
            Reservá tu traslado
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Completá el formulario y te confirmamos por WhatsApp.
          </p>
          {children}
        </div>
      </div>
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-calafate-200 shadow-lg overflow-hidden">
      {children}
    </div>
  );
}