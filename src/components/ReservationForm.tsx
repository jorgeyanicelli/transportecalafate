
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

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

const formSchema = z.object({
  origin: z.string().min(1, {
    message: "Por favor seleccione el origen",
  }),
  destination: z.string().min(1, {
    message: "Por favor seleccione el destino",
  }),
  date: z.date({
    required_error: "Por favor seleccione una fecha",
  }),
  time: z.string().min(1, {
    message: "Por favor seleccione una hora",
  }),
  passengers: z.coerce.number().min(1, {
    message: "Mínimo 1 pasajero",
  }).max(50, {
    message: "Máximo 50 pasajeros",
  }),
  vehicleType: z.string().min(1, {
    message: "Por favor seleccione un tipo de vehículo",
  }),
  name: z.string().min(3, {
    message: "Por favor ingrese su nombre",
  }),
  email: z.string().email({
    message: "Por favor ingrese un correo electrónico válido",
  }),
  phone: z.string().min(5, {
    message: "Por favor ingrese un número de teléfono válido",
  }),
});

export default function ReservationForm() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      origin: "",
      destination: "",
      passengers: 1,
      vehicleType: "",
      name: "",
      email: "",
      phone: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (step === 1) {
      setStep(2);
      return;
    }
    
    toast({
      title: "Reserva recibida",
      description: "Su solicitud de reserva ha sido enviada con éxito.",
    });
    
    console.log(values);
    // In a real app, we would send this to an API
  }

  return (
    <section 
      id="reservation-form" 
      className="py-16 bg-white"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-calafate-900">
            Reserva Tu Traslado
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Complete el formulario para reservar su traslado desde el Aeropuerto de El Calafate
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {step === 1 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="origin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Origen</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione el punto de partida" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="airport">Aeropuerto El Calafate</SelectItem>
                                  <SelectItem value="downtown">Centro de El Calafate</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Punto de inicio de su traslado
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="destination"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Destino</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione el destino" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="downtown">Centro de El Calafate</SelectItem>
                                  <SelectItem value="alto_calafate">Hotel Alto Calafate</SelectItem>
                                  <SelectItem value="xelena">Hotel Xelena</SelectItem>
                                  <SelectItem value="kosten_aike">Hotel Kosten Aike</SelectItem>
                                  <SelectItem value="los_alamos">Hotel Los Álamos</SelectItem>
                                  <SelectItem value="airport">Aeropuerto El Calafate</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Destino final de su traslado
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Fecha</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Seleccione una fecha</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date < new Date()
                                    }
                                    initialFocus
                                    className={cn("p-3 pointer-events-auto")}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>
                                Fecha de su traslado
                              </FormDescription>
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
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione una hora" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="06:00">06:00</SelectItem>
                                  <SelectItem value="07:00">07:00</SelectItem>
                                  <SelectItem value="08:00">08:00</SelectItem>
                                  <SelectItem value="09:00">09:00</SelectItem>
                                  <SelectItem value="10:00">10:00</SelectItem>
                                  <SelectItem value="11:00">11:00</SelectItem>
                                  <SelectItem value="12:00">12:00</SelectItem>
                                  <SelectItem value="13:00">13:00</SelectItem>
                                  <SelectItem value="14:00">14:00</SelectItem>
                                  <SelectItem value="15:00">15:00</SelectItem>
                                  <SelectItem value="16:00">16:00</SelectItem>
                                  <SelectItem value="17:00">17:00</SelectItem>
                                  <SelectItem value="18:00">18:00</SelectItem>
                                  <SelectItem value="19:00">19:00</SelectItem>
                                  <SelectItem value="20:00">20:00</SelectItem>
                                  <SelectItem value="21:00">21:00</SelectItem>
                                  <SelectItem value="22:00">22:00</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Hora prevista para su traslado
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="passengers"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pasajeros</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Número de pasajeros" 
                                  {...field}
                                  min={1}
                                  max={50}
                                />
                              </FormControl>
                              <FormDescription>
                                Cantidad de pasajeros
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="vehicleType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Vehículo</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un tipo de vehículo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="sedan">Sedán (hasta 3 pasajeros)</SelectItem>
                                  <SelectItem value="van">Van (hasta 7 pasajeros)</SelectItem>
                                  <SelectItem value="minibus">Minibús (hasta 15 pasajeros)</SelectItem>
                                  <SelectItem value="bus">Bus (hasta 50 pasajeros)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Seleccione el tipo de vehículo para su traslado
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-calafate-600 hover:bg-calafate-700"
                      >
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
                              <FormDescription>
                                Recibirá la confirmación en este correo
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Teléfono</FormLabel>
                              <FormControl>
                                <Input placeholder="+54 9 XX XXXX XXXX" {...field} />
                              </FormControl>
                              <FormDescription>
                                Teléfono de contacto para el día del traslado
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                        
                      <div className="flex flex-col sm:flex-row gap-4 justify-between mt-8">
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => setStep(1)}
                        >
                          Volver
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-calafate-600 hover:bg-calafate-700"
                        >
                          Confirmar Reserva
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
