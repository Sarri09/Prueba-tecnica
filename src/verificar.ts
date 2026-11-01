import type { Conversacion, SalidaGemini } from "./esquemas.js";

// Minúsculas, sin tildes y con espacios colapsados (ADR006).
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Una cita vale si tiene al menos 2 palabras y aparece en un solo mensaje del lead (ADR016).
export function citaValida(cita: string | null, conversacion: Conversacion): boolean {
  if (cita === null) return false;
  const buscada = normalizar(cita);
  if (buscada.split(" ").length < 2) return false;
  return conversacion.mensajes
    .filter((mensaje) => mensaje.de === "lead")
    .some((mensaje) => normalizar(mensaje.texto).includes(buscada));
}

// Extrae los números de una cita: "UF 9.000" -> [9000], "1.8 millones" -> [1800000].
export function numerosEn(cita: string): number[] {
  const encontrados = normalizar(cita).matchAll(/(\d+(?:[.,]\d+)*)(?:\s*(millones|millon|mil)\b)?/g);
  return [...encontrados].map(([, numero, unidad]) => {
    if (unidad === undefined) return leerNumero(numero);
    // Se redondea porque multiplicar decimales puede dejar residuos: 1.1 * 1000000 = 1100000.0000000002.
    return Math.round(leerNumero(numero) * (unidad === "mil" ? 1_000 : 1_000_000));
  });
}

// En Chile el punto separa miles: si todos los grupos tienen 3 dígitos son miles; si no, es decimal.
function leerNumero(numero: string): number {
  const [, ...grupos] = numero.split(/[.,]/);
  if (grupos.length > 0 && grupos.every((grupo) => grupo.length === 3)) {
    return Number(numero.replace(/[.,]/g, ""));
  }
  return Number(numero.replace(",", "."));
}

// Anula todo dato sin respaldo en lo que dijo el lead (ADR006, ADR016).
export function verificarCitas(
  salida: SalidaGemini,
  conversacion: Conversacion,
): { verificada: SalidaGemini; anulados: string[] } {
  const verificada = structuredClone(salida);
  const anulados: string[] = [];
  const respaldada = (cita: string | null) => citaValida(cita, conversacion);

  if (salida.intencion !== "indeterminada" && !respaldada(salida.intencion_cita)) {
    verificada.intencion = "indeterminada";
    anulados.push("intencion");
  }
  if (verificada.intencion === "indeterminada") verificada.intencion_cita = null;

  if (salida.urgencia !== "no_indicada" && !respaldada(salida.urgencia_cita)) {
    verificada.urgencia = "no_indicada";
    anulados.push("urgencia");
  }
  if (verificada.urgencia === "no_indicada") verificada.urgencia_cita = null;

  verificada.capacidad_pago = salida.capacidad_pago.filter((item) => {
    const valido =
      respaldada(item.cita) && (item.monto === null || numerosEn(item.cita).includes(item.monto));
    if (!valido) anulados.push(`capacidad_pago.${item.tipo}`);
    return valido;
  });

  const tieneTipologia = salida.tipologia.dormitorios !== null || salida.tipologia.descripcion !== null;
  if (!tieneTipologia || !respaldada(salida.tipologia.cita)) {
    if (tieneTipologia) anulados.push("tipologia");
    verificada.tipologia = { dormitorios: null, descripcion: null, cita: null };
  }

  if (salida.requiere_humano && !respaldada(salida.motivo_humano_cita)) {
    verificada.requiere_humano = false;
    anulados.push("requiere_humano");
  }
  if (!verificada.requiere_humano) {
    verificada.motivo_humano = null;
    verificada.motivo_humano_cita = null;
  }

  if (salida.cita_clave !== null && !respaldada(salida.cita_clave)) {
    verificada.cita_clave = null;
    anulados.push("cita_clave");
  }
  // La evidencia de una alerta es cita_clave (ADR007): sin ella, la alerta no se sostiene.
  if (salida.alerta_manipulacion && verificada.cita_clave === null) {
    verificada.alerta_manipulacion = false;
    anulados.push("alerta_manipulacion");
  }

  return { verificada, anulados };
}
