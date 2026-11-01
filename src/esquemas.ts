import { z } from "zod";

// Entrada del endpoint (ADR002). Los máximos acotan cuánto se puede gastar por request (ADR015).
export const Conversacion = z.object({
  id: z.string().min(1),
  mensajes: z
    .array(
      z.object({
        de: z.enum(["lead", "asistente"]),
        texto: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(100),
});
export type Conversacion = z.infer<typeof Conversacion>;

// Respuesta de Gemini (ADR007). De aquí también sale el JSON Schema que recibe el modelo (ADR014).
export const SalidaGemini = z.object({
  intencion: z.enum(["compra_vivienda", "inversion", "consulta", "reclamo", "no_lead", "indeterminada"]),
  intencion_cita: z.string().nullable(),

  urgencia: z.enum(["alta", "media", "baja", "no_indicada"]),
  urgencia_cita: z.string().nullable(),

  capacidad_pago: z.array(
    z.object({
      tipo: z.enum(["pie", "precio_maximo", "presupuesto_total", "ingreso", "credito_preaprobado"]),
      monto: z.number().nullable(),
      moneda: z.enum(["UF", "CLP"]).nullable(),
      cita: z.string(),
    }),
  ),

  tipologia: z.object({
    dormitorios: z.array(z.number()).nullable(),
    descripcion: z.string().nullable(),
    cita: z.string().nullable(),
  }),

  requiere_humano: z.boolean(),
  motivo_humano: z.enum(["reclamo", "fuera_de_alcance_asistente"]).nullable(),
  motivo_humano_cita: z.string().nullable(),

  alerta_manipulacion: z.boolean(),

  cita_clave: z.string().nullable(),
});
export type SalidaGemini = z.infer<typeof SalidaGemini>;

export type Prioridad = "alta" | "media" | "baja" | "no_atender";

export type Uso = {
  modelo: string;
  tokens_entrada: number;
  tokens_salida: number;
  tokens_thinking: number;
};

export type LlamarGemini = (conversacion: Conversacion) => Promise<{ salida: SalidaGemini; uso: Uso }>;
