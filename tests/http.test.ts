import { describe, expect, it, vi } from "vitest";
import type { LlamarGemini, SalidaGemini } from "../src/esquemas.js";
import { crearApp } from "../src/index.js";

const conversacion = {
  id: "conv-x",
  mensajes: [{ de: "lead", texto: "Busco un depto, tengo pie de UF 900" }],
};

const salida: SalidaGemini = {
  intencion: "compra_vivienda",
  intencion_cita: "Busco un depto",
  urgencia: "no_indicada",
  urgencia_cita: null,
  capacidad_pago: [{ tipo: "pie", monto: 900, moneda: "UF", cita: "pie de UF 900" }],
  tipologia: { dormitorios: null, descripcion: null, cita: null },
  requiere_humano: false,
  motivo_humano: null,
  motivo_humano_cita: null,
  alerta_manipulacion: false,
  cita_clave: "Busco un depto",
};

const uso = { modelo: "simulado", tokens_entrada: 10, tokens_salida: 5, tokens_thinking: 1 };

function enviar(llamar: LlamarGemini, cuerpo: unknown) {
  return crearApp(llamar).request("/analizar", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo),
  });
}

describe("POST /analizar", () => {
  it("devuelve el análisis con prioridad, resumen y uso", async () => {
    const respuesta = await enviar(async () => ({ salida, uso }), conversacion);
    const cuerpo = await respuesta.json();
    expect(respuesta.status).toBe(200);
    expect(cuerpo.id).toBe("conv-x");
    expect(cuerpo.prioridad).toBe("alta");
    expect(cuerpo.resumen).toBe('Compra vivienda · pie UF 900 · "Busco un depto"');
    expect(cuerpo.uso).toEqual(uso);
  });

  it("calcula la prioridad después de anular datos sin respaldo", async () => {
    const inventada: SalidaGemini = {
      ...salida,
      capacidad_pago: [{ tipo: "pie", monto: 5000, moneda: "UF", cita: "pie de UF 5.000" }],
    };
    const cuerpo = await (await enviar(async () => ({ salida: inventada, uso }), conversacion)).json();
    expect(cuerpo.capacidad_pago).toEqual([]);
    expect(cuerpo.prioridad).toBe("baja");
  });

  it.each([
    ["JSON roto", "{no es json"],
    ["sin mensajes", { id: "x", mensajes: [] }],
    ["rol desconocido", { id: "x", mensajes: [{ de: "vendedor", texto: "hola" }] }],
    ["texto vacío", { id: "x", mensajes: [{ de: "lead", texto: "" }] }],
    ["mensaje demasiado largo", { id: "x", mensajes: [{ de: "lead", texto: "a".repeat(2001) }] }],
  ])("responde 400 sin llamar a Gemini: %s", async (_caso, cuerpo) => {
    const llamar = vi.fn<LlamarGemini>();
    const respuesta = await enviar(llamar, cuerpo);
    expect(respuesta.status).toBe(400);
    expect(llamar).not.toHaveBeenCalled();
  });

  it("responde 502 si Gemini falla, sin filtrar el mensaje de error", async () => {
    const respuesta = await enviar(async () => {
      throw new Error("API key secreta-123 inválida");
    }, conversacion);
    expect(respuesta.status).toBe(502);
    expect(await respuesta.text()).not.toContain("secreta-123");
  });
});
