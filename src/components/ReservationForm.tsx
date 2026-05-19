import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Plane, PlaneTakeoff, Mountain } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z
  .object({
    serviceType: z.enum(["airport_arrival", "airport_departure", "excursion"], {
      required_error: "Por favor seleccione el tipo de servicio",
    }),
    destination: z.string().optional(),
    destinationOther: z.string().optional(),
    address: z.string().optional(),
    date: z.date({ required_error: "Por favor seleccione una fecha" }),
    time: z.string().min(1, { message: "Por favor seleccione una hora" }),
    flightCompany: z.string().optional(),
    flightNumber: z.string().optional(),
    passengers: z.coerce.number().min(1, { message: "Mínimo 1 pasajero" }).max(50, { message: "Máximo 50 pasajeros" }),
    luggage: z.coerce.number().min(0, { message: "Mínimo 0 valijas" }).default(0),
    vehicleType: z.string().min(1, { message: "Por favor seleccione un tipo de vehículo" }),
    name: z.string().min(3, { message: "Por favor ingrese su nombre" }),
    email: z.string().email({ message: "Por favor ingrese un correo electrónico válido" }),
    phone: z.string().min(5, { message: "Por favor ingrese un WhatsApp válido" }),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const isAirport = data.serviceType === "airport_arrival" || data.serviceType === "airport_departure";
    if (isAirport) {
      if (!data.flightCompany) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["flightCompany"], message: "Seleccione la compañía aérea" });
      if (!data.flightNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["flightNumber"], message: "Ingrese el número de vuelo" });
      if (!data.address) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["address"], message: "Ingrese hotel o dirección" });
    }
    if (data.serviceType === "excursion") {
      if (!data.destination) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["destination"], message: "Seleccione el destino" });
      if (data.destination === "otro" && !data.destinationOther) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["destinationOther"], message: "Especifique el destino" });
      }
      if (!data.address) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["address"], message: "Ingrese dirección de recogida" });
    }
  });

type FormValues = z.infer<typeof formSchema>;

const SERVICE_TYPE_LABELS: Record<string, string> = {
  airport_arrival: "Llegada al aeropuerto",
  airport_departure: "Salida desde el aeropuerto",
  excursion: "Excursión / traslado turístico",
};

const AIRLINE_LABELS: Record<string, string> = {
  aerolineas: "Aerolíneas Argentinas",
  jetsmart: "JetSmart",
  flybondi: "Flybondi",
  lade: "LADE",
  sky: "Sky Airlines",
  privado: "Privado / charter",
  otra: "Otra",
};

const VEHICLE_LABELS: Record<string, string> = {
  minibus: "Mini Bus (hasta 20 pasajeros)",
  sprinter: "Mercedes Sprinter (hasta 19 pasajeros)",
  vito: "Mercedes Vito (hasta 8 pasajeros)",
  hiace: "Toyota HiAce (hasta 12 pasajeros)",
  taxi: "Taxi / Auto privado (hasta 4 pasajeros)",
  any: "Sin preferencia",
};

const EXCURSION_LABELS: Record<string, string> = {
  perito_moreno: "Glaciar Perito Moreno",
  lago_argentino: "Lago Argentino",
  punta_bandera: "Punta Bandera",
  cueva_manos: "Cueva de las Manos",
  otro: "Otro",
};

const FIELD_LABELS: Record<string, string> = {
  serviceType: "Tipo de servicio",
  date: "Fecha",
  time: "Hora",
  address: "Hotel/Dirección",
  flightCompany: "Compañía aérea",
  flightNumber: "Número de vuelo",
  destination: "Destino",
  destinationOther: "Especifique destino",
  passengers: "Pasajeros",
  luggage: "Valijas",
  vehicleType: "Tipo de vehículo",
};

export default function ReservationForm() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceType: undefined as unknown as FormValues["serviceType"],
      destination: "",
      destinationOther: "",
      address: "",
      passengers: 1,
      luggage: 0,
      vehicleType: "",
      name: "",
      email: "",
      phone: "",
      flightCompany: "",
      flightNumber: "",
      time: "",
      notes: "",
    },
  });

  const serviceType = form.watch("serviceType");
  const destination = form.watch("destination");
  const isAirport = serviceType === "airport_arrival" || serviceType === "airport_departure";
  const isExcursion = serviceType === "excursion";

  async function onSubmit(values: FormValues) {
    console.log("onSubmit fired", values);
    setSubmitting(true);
    try {
      // Generate booking_ref: TC-YYYY-XXXX
      const year = new Date().getFullYear();
      const { count } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true });
      const seq = String((count ?? 0) + 1).padStart(4, "0");
      const bookingRef = `TC-${year}-${seq}`;

      // Combine date + time into a timestamptz
      const [hh, mm] = (values.time || "00:00").split(":").map(Number);
      const dt = new Date(values.date);
      dt.setHours(hh || 0, mm || 0, 0, 0);
      const isAirportSvc =
        values.serviceType === "airport_arrival" || values.serviceType === "airport_departure";

      const destinationLabel =
        values.destination === "otro"
          ? `Otro - ${values.destinationOther ?? ""}`
          : EXCURSION_LABELS[values.destination ?? ""] ?? null;

      const { error } = await supabase.from("bookings").insert({
        booking_ref: bookingRef,
        status: "pending",
        service_type: values.serviceType,
        passenger_name: values.name,
        passenger_email: values.email,
        passenger_whatsapp: values.phone,
        passenger_count: values.passengers,
        luggage_count: values.luggage ?? 0,
        flight_number: isAirportSvc ? values.flightNumber || null : null,
        airline: isAirportSvc ? AIRLINE_LABELS[values.flightCompany ?? ""] ?? values.flightCompany ?? null : null,
        flight_datetime: isAirportSvc ? dt.toISOString() : null,
        hotel_address: isAirportSvc ? values.address || null : null,
        destination: values.serviceType === "excursion" ? destinationLabel : null,
        excursion_datetime: values.serviceType === "excursion" ? dt.toISOString() : null,
        vehicle_preference: VEHICLE_LABELS[values.vehicleType] ?? values.vehicleType,
        notes: values.notes || null,
      });

      if (error) throw error;

      const whatsappMessage = formatWhatsAppMessage(values, bookingRef);
      const whatsappURL = `https://wa.me/+5492966672100?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappURL, "_blank");
      toast({
        title: `¡Reserva ${bookingRef} recibida!`,
        description: "Te contactaremos pronto por WhatsApp.",
      });
    } catch (err) {
      console.error("Booking insert failed:", err);
      toast({
        title: "Error",
        description: "Error al guardar la reserva. Por favor intentá de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleContinue() {
    console.log("Continuar tapped", form.getValues());
    console.log("Continuar clicked", {
      values: form.getValues(),
      errors: form.formState.errors,
    });
    const step1Fields: (keyof FormValues)[] = [
      "serviceType",
      "date",
      "time",
      "passengers",
      "luggage",
      "vehicleType",
      "address",
    ];
    if (isAirport) step1Fields.push("flightCompany", "flightNumber");
    if (isExcursion) {
      step1Fields.push("destination");
      if (destination === "otro") step1Fields.push("destinationOther");
    }
    const ok = await form.trigger(step1Fields as any);
    if (!ok) {
      const errorKeys = Object.keys(form.formState.errors);
      const labels = errorKeys.map((k) => FIELD_LABELS[k] ?? k);
      setValidationErrors(labels);
      const missing = labels.join(", ");
      toast({
        title: "Faltan datos",
        description: missing
          ? `Por favor complete: ${missing}`
          : "Por favor complete los campos requeridos antes de continuar.",
        variant: "destructive",
      });
      return;
    }
    setValidationErrors([]);
    setStep(2);
  }

  function formatWhatsAppMessage(v: FormValues, bookingRef?: string) {
    const lines: string[] = [];
    lines.push("*NUEVA RESERVA DE TRASLADO*", "");
    if (bookingRef) lines.push(`*Referencia:* ${bookingRef}`);
    lines.push(`*Tipo de servicio:* ${SERVICE_TYPE_LABELS[v.serviceType]}`);

    if (v.serviceType === "airport_arrival" || v.serviceType === "airport_departure") {
      lines.push(`*Compañía Aérea:* ${AIRLINE_LABELS[v.flightCompany ?? ""] ?? v.flightCompany ?? "-"}`);
      lines.push(`*Número de Vuelo:* ${v.flightNumber ?? "-"}`);
      lines.push(
        `*${v.serviceType === "airport_arrival" ? "Hotel/dirección de destino" : "Hotel/dirección de origen"}:* ${v.address ?? "-"}`,
      );
    } else if (v.serviceType === "excursion") {
      const destLabel =
        v.destination === "otro"
          ? `Otro - ${v.destinationOther ?? ""}`
          : EXCURSION_LABELS[v.destination ?? ""] ?? "-";
      lines.push(`*Destino:* ${destLabel}`);
      lines.push(`*Dirección de recogida:* ${v.address ?? "-"}`);
    }

    lines.push(`*Fecha:* ${format(v.date, "dd/MM/yyyy")}`);
    lines.push(`*Hora:* ${v.time}`);
    lines.push(`*Pasajeros:* ${v.passengers}`);
    lines.push(`*Cantidad de valijas:* ${v.luggage ?? 0}`);
    lines.push(`*Tipo de Vehículo:* ${VEHICLE_LABELS[v.vehicleType] ?? v.vehicleType}`);
    lines.push("", "*Información de Contacto:*");
    lines.push(`*Nombre:* ${v.name}`);
    lines.push(`*Email:* ${v.email}`);
    lines.push(`*WhatsApp:* ${v.phone}`);
    if (v.notes && v.notes.trim().length > 0) {
      lines.push("", `*Notas adicionales:* ${v.notes}`);
    }
    return lines.join("\n");
  }

  const serviceOptions = [
    { value: "airport_arrival", icon: Plane, emoji: "✈️", label: "Llegada al aeropuerto" },
    { value: "airport_departure", icon: PlaneTakeoff, emoji: "🛫", label: "Salida desde el aeropuerto" },
    { value: "excursion", icon: Mountain, emoji: "🏔️", label: "Excursión / traslado turístico" },
  ] as const;

  return (
    <section id="reservation-form" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-calafate-900">Reserva Tu Traslado</h2>
          <p className="text-center text-gray-600 mb-8">
            Complete el formulario para reservar su traslado en El Calafate
          </p>

          <Card className="border-calafate-200 shadow-lg">
            <CardHeader>
              <CardTitle>Formulario de Reserva</CardTitle>
              <CardDescription>
                {step === 1 ? "Detalles del viaje" : "Información de contacto"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={(e) => {
                    try {
                      form.handleSubmit(onSubmit)(e);
                    } catch (err) {
                      console.error("Form submit threw:", err);
                    }
                  }}
                  className="space-y-6"
                >
                  {step === 1 ? (
                    <>
                      {validationErrors.length > 0 && (
                        <div
                          role="alert"
                          className="rounded-md border border-destructive bg-destructive/10 text-destructive p-3 text-sm"
                        >
                          <p className="font-medium mb-1">
                            Por favor complete los siguientes campos:
                          </p>
                          <ul className="list-disc list-inside">
                            {validationErrors.map((e) => (
                              <li key={e}>{e}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {/* Service type selector */}
                      <FormField
                        control={form.control}
                        name="serviceType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de servicio</FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {serviceOptions.map((opt) => {
                                const selected = field.value === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => field.onChange(opt.value)}
                                    className={cn(
                                      "text-left p-4 rounded-lg border-2 transition-all",
                                      selected
                                        ? "border-calafate-600 bg-calafate-50 ring-2 ring-calafate-600/20"
                                        : "border-gray-200 hover:border-calafate-400",
                                    )}
                                  >
                                    <div className="text-2xl mb-1">{opt.emoji}</div>
                                    <div className="font-medium text-sm text-calafate-900">{opt.label}</div>
                                  </button>
                                );
                              })}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {serviceType && (
                        <div key={serviceType} className="space-y-6">
                          {isAirport && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={form.control}
                                name="flightCompany"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Compañía Aérea</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Seleccione la aerolínea" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {Object.entries(AIRLINE_LABELS).filter(([v]) => v).map(([v, l]) => (
                                          <SelectItem key={v} value={v}>
                                            {l}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="flightNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Número de Vuelo</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Ej: AR1234" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}

                          {isExcursion && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={form.control}
                                name="destination"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Destino</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Seleccione el destino" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {Object.entries(EXCURSION_LABELS).filter(([v]) => v).map(([v, l]) => (
                                          <SelectItem key={v} value={v}>
                                            {l}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              {destination === "otro" && (
                                <FormField
                                  control={form.control}
                                  name="destinationOther"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Especifique destino</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Indique el destino" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="date"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Fecha</FormLabel>
                                  {isMobile ? (
                                    <FormControl>
                                      <Input
                                        type="date"
                                        value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                                        min={format(new Date(), "yyyy-MM-dd")}
                                        onChange={(e) =>
                                          field.onChange(
                                            e.target.value
                                              ? new Date(e.target.value + "T00:00:00")
                                              : undefined,
                                          )
                                        }
                                      />
                                    </FormControl>
                                  ) : (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          className={cn(
                                            "pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground",
                                          )}
                                        >
                                          {field.value ? format(field.value, "PPP") : <span>Seleccione una fecha</span>}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date < new Date()}
                                        initialFocus
                                        className={cn("p-3 pointer-events-auto")}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="time"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Hora</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center">
                                      <Input type="time" {...field} className="flex-grow" />
                                      <Clock className="ml-2 h-4 w-4 text-gray-400" />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  {serviceType === "airport_arrival"
                                    ? "Hotel o dirección de destino"
                                    : serviceType === "airport_departure"
                                    ? "Hotel o dirección de origen"
                                    : "Dirección de recogida"}
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="Ej: Hotel Alto Calafate, Av. Libertador 1234" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="passengers"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Pasajeros</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} min={1} max={50} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="luggage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cantidad de valijas</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} min={0} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="vehicleType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de Vehículo</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccione un tipo de vehículo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Object.entries(VEHICLE_LABELS).filter(([v]) => v).map(([v, l]) => (
                                      <SelectItem key={v} value={v}>
                                        {l}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription>Seleccione el tipo de vehículo para su traslado</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      <Button type="button" onClick={handleContinue} className="w-full min-h-[48px] py-3 text-base bg-calafate-600 hover:bg-calafate-500">
                        Continuar
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre completo</FormLabel>
                              <FormControl>
                                <Input placeholder="Ingrese su nombre completo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Correo electrónico</FormLabel>
                              <FormControl>
                                <Input placeholder="ejemplo@correo.com" {...field} />
                              </FormControl>
                              <FormDescription>Recibirá la confirmación en este correo</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>WhatsApp</FormLabel>
                              <FormControl>
                                <Input placeholder="+54 9 2966 XXXXXX" {...field} />
                              </FormControl>
                              <FormDescription>WhatsApp de contacto para el día del traslado</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notas adicionales (opcional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Cuéntenos cualquier requisito especial: sillas para bebés, equipaje voluminoso, etc."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 justify-between mt-8">
                        <Button type="button" variant="outline" onClick={() => setStep(1)}>
                          Volver
                        </Button>
                        <Button type="submit" disabled={submitting} className="bg-calafate-600 hover:bg-calafate-500">
                          {submitting ? "Enviando..." : "Confirmar Reserva"}
                        </Button>
                      </div>
                    </>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
