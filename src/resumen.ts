import type { SalidaGemini } from "./esquemas.js";

const INTENCIONES: Record<SalidaGemini["intencion"], string> = {
  compra_vivienda: "Compra vivienda",
  inversion: "Inversión",
  consulta: "Consulta",
  reclamo: "Reclamo",
  no_lead: "No es lead",
  indeterminada: "Intención indeterminada",
};

const TIPOS_PAGO: Record<SalidaGemini["capacidad_pago"][number]["tipo"], string> = {
  pie: "pie",
  precio_maximo: "precio máximo",
  presupuesto_total: "presupuesto total",
  ingreso: "ingreso",
  credito_preaprobado: "crédito preaprobado",
};

function describirPago(item: SalidaGemini["capacidad_pago"][number]): string {
  if (item.monto === null) return TIPOS_PAGO[item.tipo];
  const monto = item.monto.toLocaleString("es-CL");
  return `${TIPOS_PAGO[item.tipo]} ${item.moneda ?? ""} ${monto}`.replace(/\s+/g, " ");
}

// Se arma solo con campos ya verificados y con cita_clave (ADR009).
export function armarResumen(salida: SalidaGemini): string {
  const partes = [INTENCIONES[salida.intencion]];

  if (salida.urgencia !== "no_indicada") partes.push(`urgencia ${salida.urgencia}`);
  partes.push(...salida.capacidad_pago.map(describirPago));

  const { dormitorios, descripcion } = salida.tipologia;
  if (dormitorios !== null) partes.push(`${dormitorios.join(" o ")}D`);
  if (descripcion !== null) partes.push(descripcion);

  if (salida.requiere_humano) partes.push("requiere humano");
  if (salida.alerta_manipulacion) partes.push("posible manipulación");
  if (salida.cita_clave !== null) partes.push(`"${salida.cita_clave}"`);

  return partes.join(" · ");
}
