import type { Prioridad, SalidaGemini } from "./esquemas.js";

// Gana la primera regla que se cumple (ADR016).
export function calcularPrioridad(salida: SalidaGemini): Prioridad {
  if (salida.intencion === "reclamo") return "alta";
  if (salida.intencion === "no_lead") return "no_atender";
  if (salida.alerta_manipulacion && salida.intencion === "indeterminada") return "no_atender";
  if (salida.urgencia === "alta") return "alta";

  const quiereComprar = salida.intencion === "compra_vivienda" || salida.intencion === "inversion";
  const dijoCuantoPuedePagar = salida.capacidad_pago.some((item) =>
    ["pie", "precio_maximo", "presupuesto_total"].includes(item.tipo),
  );
  if (quiereComprar && dijoCuantoPuedePagar) return "alta";

  if (salida.requiere_humano) return "media";
  return "baja";
}
