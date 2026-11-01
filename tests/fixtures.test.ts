// Pasa la respuesta esperada por el código real, sin Gemini: si el modelo respondiera perfecto,
// ninguna regla debería anular datos y la prioridad debería ser la acordada en ADR016.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { comparar, type Resultado } from "../scripts/comparar.js";
import { Conversacion, SalidaGemini } from "../src/esquemas.js";
import { calcularPrioridad } from "../src/prioridad.js";
import { armarResumen } from "../src/resumen.js";
import { verificarCitas } from "../src/verificar.js";

const conversaciones: Conversacion[] = JSON.parse(readFileSync("fixtures/conversaciones.json", "utf8"));
const esperados: (Resultado & { _nota: string | null })[] = JSON.parse(readFileSync("fixtures/esperado.json", "utf8"));

describe.each(esperados)("$id", (esperado) => {
  const conversacion = conversaciones.find((c) => c.id === esperado.id)!;
  const salida = SalidaGemini.parse(esperado);
  const { verificada, anulados } = verificarCitas(salida, conversacion);

  it("cumple el esquema y no anula ningún dato", () => {
    expect(Conversacion.safeParse(conversacion).success).toBe(true);
    expect(anulados).toEqual([]);
    expect(verificada).toEqual(salida);
  });

  it("calcula la prioridad esperada", () => {
    expect(calcularPrioridad(verificada)).toBe(esperado.prioridad);
  });

  it("arma un resumen de una línea que incluye la cita clave", () => {
    const resumen = armarResumen(verificada);
    expect(resumen).not.toContain("\n");
    expect(resumen).toContain(esperado.cita_clave);
  });
});

describe("comparar", () => {
  const base = esperados[0];

  it("no reporta diferencias si el resultado es igual", () => {
    expect(comparar(base, base)).toEqual([]);
  });

  it("no compara el texto de las citas", () => {
    expect(comparar({ ...base, cita_clave: "otra frase válida" }, base)).toEqual([]);
  });

  it("marca como crítico un dato de pago inventado, incluso en un caso no crítico", () => {
    const noCritico = esperados.find((e) => e.id === "conv-004")!;
    const pago = { tipo: "pie", monto: 100, moneda: "UF", cita: "inventada" };
    const [diferencia] = comparar({ ...noCritico, capacidad_pago: [pago] }, noCritico);
    expect(diferencia.campo).toBe("capacidad_pago (inventado)");
    expect(diferencia.critica).toBe(true);
  });

  it("marca como crítica una categoría distinta en un caso crítico", () => {
    const [diferencia] = comparar({ ...base, prioridad: "baja" }, base);
    expect(diferencia.campo).toBe("prioridad");
    expect(diferencia.critica).toBe(true);
  });
});
