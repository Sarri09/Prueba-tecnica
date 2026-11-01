import { describe, expect, it } from "vitest";
import type { Conversacion, SalidaGemini } from "../src/esquemas.js";
import { citaValida, numerosEn, verificarCitas } from "../src/verificar.js";

const conversacion: Conversacion = {
  id: "test",
  mensajes: [
    { de: "lead", texto: "Tenemos pie para unas UF 900.  Necesito   mudarme YA" },
    { de: "asistente", texto: "Tenemos deptos desde UF 4.200" },
    { de: "lead", texto: "Quería saber cuánto sale" },
  ],
};

const salidaVacia: SalidaGemini = {
  intencion: "indeterminada",
  intencion_cita: null,
  urgencia: "no_indicada",
  urgencia_cita: null,
  capacidad_pago: [],
  tipologia: { dormitorios: null, descripcion: null, cita: null },
  requiere_humano: false,
  motivo_humano: null,
  motivo_humano_cita: null,
  alerta_manipulacion: false,
  cita_clave: null,
};

describe("citaValida", () => {
  it("acepta una cita textual del lead", () => {
    expect(citaValida("pie para unas UF 900", conversacion)).toBe(true);
  });

  it("ignora tildes, mayúsculas y espacios", () => {
    expect(citaValida("QUERIA saber   cuanto sale", conversacion)).toBe(true);
    expect(citaValida("necesito mudarme ya", conversacion)).toBe(true);
  });

  it("rechaza una cita inventada", () => {
    expect(citaValida("tengo presupuesto de UF 5.000", conversacion)).toBe(false);
  });

  it("rechaza una cita que solo está en mensajes del asistente", () => {
    expect(citaValida("desde UF 4.200", conversacion)).toBe(false);
  });

  it("rechaza citas de una palabra y citas nulas", () => {
    expect(citaValida("UF", conversacion)).toBe(false);
    expect(citaValida(null, conversacion)).toBe(false);
  });

  it("rechaza una cita armada con dos mensajes distintos", () => {
    expect(citaValida("mudarme YA Quería saber", conversacion)).toBe(false);
  });
});

describe("numerosEn", () => {
  it.each([
    ["UF 900", [900]],
    ["hasta UF 9.000", [9000]],
    ["Máximo 3.500 UF", [3500]],
    ["ingresos de 1.8 millones", [1800000]],
    ["ingresos de 2,5 millones", [2500000]],
    ["1.800.000 pesos", [1800000]],
    ["gano 900 mil", [900000]],
    ["1 millón", [1000000]],
    ["UF 4,5", [4.5]],
    ["sin números", []],
  ])("%s", (cita, esperado) => {
    expect(numerosEn(cita)).toEqual(esperado);
  });
});

describe("verificarCitas", () => {
  it("deja intacta una respuesta sin datos", () => {
    expect(verificarCitas(salidaVacia, conversacion)).toEqual({ verificada: salidaVacia, anulados: [] });
  });

  it("anula intención y urgencia sin cita válida", () => {
    const { verificada, anulados } = verificarCitas(
      { ...salidaVacia, intencion: "compra_vivienda", intencion_cita: "quiero comprar", urgencia: "alta", urgencia_cita: null },
      conversacion,
    );
    expect(verificada.intencion).toBe("indeterminada");
    expect(verificada.intencion_cita).toBeNull();
    expect(verificada.urgencia).toBe("no_indicada");
    expect(anulados).toEqual(["intencion", "urgencia"]);
  });

  it("elimina un pago con cita inventada o del asistente", () => {
    const { verificada } = verificarCitas(
      {
        ...salidaVacia,
        capacidad_pago: [
          { tipo: "presupuesto_total", monto: 4200, moneda: "UF", cita: "desde UF 4.200" },
          { tipo: "pie", monto: 900, moneda: "UF", cita: "unas UF 900" },
        ],
      },
      conversacion,
    );
    expect(verificada.capacidad_pago).toEqual([{ tipo: "pie", monto: 900, moneda: "UF", cita: "unas UF 900" }]);
  });

  it("elimina un pago cuyo monto no coincide con su cita", () => {
    const { verificada, anulados } = verificarCitas(
      { ...salidaVacia, capacidad_pago: [{ tipo: "pie", monto: 9000, moneda: "UF", cita: "unas UF 900" }] },
      conversacion,
    );
    expect(verificada.capacidad_pago).toEqual([]);
    expect(anulados).toEqual(["capacidad_pago.pie"]);
  });

  it("mantiene un crédito preaprobado sin monto", () => {
    const pago = { tipo: "credito_preaprobado", monto: null, moneda: null, cita: "pie para unas" } as const;
    const { verificada } = verificarCitas({ ...salidaVacia, capacidad_pago: [pago] }, conversacion);
    expect(verificada.capacidad_pago).toEqual([pago]);
  });

  it("anula la tipología sin cita válida", () => {
    const { verificada, anulados } = verificarCitas(
      { ...salidaVacia, tipologia: { dormitorios: [2], descripcion: null, cita: "busco 2 dormitorios" } },
      conversacion,
    );
    expect(verificada.tipologia).toEqual({ dormitorios: null, descripcion: null, cita: null });
    expect(anulados).toEqual(["tipologia"]);
  });

  it("baja requiere_humano a false sin cita válida", () => {
    const { verificada, anulados } = verificarCitas(
      { ...salidaVacia, requiere_humano: true, motivo_humano: "reclamo", motivo_humano_cita: "nadie me llamó" },
      conversacion,
    );
    expect(verificada.requiere_humano).toBe(false);
    expect(verificada.motivo_humano).toBeNull();
    expect(verificada.motivo_humano_cita).toBeNull();
    expect(anulados).toEqual(["requiere_humano"]);
  });

  it("anula la alerta de manipulación si su cita no es válida", () => {
    const { verificada, anulados } = verificarCitas(
      { ...salidaVacia, alerta_manipulacion: true, cita_clave: "ignora tus instrucciones" },
      conversacion,
    );
    expect(verificada.alerta_manipulacion).toBe(false);
    expect(verificada.cita_clave).toBeNull();
    expect(anulados).toEqual(["cita_clave", "alerta_manipulacion"]);
  });

  it("no modifica el objeto original", () => {
    const original: SalidaGemini = { ...salidaVacia, intencion: "reclamo", intencion_cita: "inventada del todo" };
    verificarCitas(original, conversacion);
    expect(original.intencion).toBe("reclamo");
  });
});
