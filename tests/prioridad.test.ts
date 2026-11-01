import { describe, expect, it } from "vitest";
import type { SalidaGemini } from "../src/esquemas.js";
import { calcularPrioridad } from "../src/prioridad.js";

const base: SalidaGemini = {
  intencion: "consulta",
  intencion_cita: "una cita",
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
const pie = { tipo: "pie", monto: 900, moneda: "UF", cita: "una cita" } as const;
const ingreso = { tipo: "ingreso", monto: 1800000, moneda: "CLP", cita: "una cita" } as const;

describe("calcularPrioridad", () => {
  it("un reclamo es alta", () => {
    expect(calcularPrioridad({ ...base, intencion: "reclamo" })).toBe("alta");
  });

  it("un no_lead es no_atender, aunque diga que está apurado", () => {
    expect(calcularPrioridad({ ...base, intencion: "no_lead", urgencia: "alta" })).toBe("no_atender");
  });

  it("una manipulación sin intención clara es no_atender", () => {
    expect(calcularPrioridad({ ...base, intencion: "indeterminada", alerta_manipulacion: true })).toBe("no_atender");
  });

  it("una alerta no descarta a un lead con interés real", () => {
    expect(
      calcularPrioridad({ ...base, intencion: "compra_vivienda", alerta_manipulacion: true, capacidad_pago: [pie] }),
    ).toBe("alta");
  });

  it("urgencia alta es alta", () => {
    expect(calcularPrioridad({ ...base, urgencia: "alta" })).toBe("alta");
  });

  it("comprar o invertir con capacidad de pago es alta", () => {
    expect(calcularPrioridad({ ...base, intencion: "compra_vivienda", capacidad_pago: [pie] })).toBe("alta");
    expect(calcularPrioridad({ ...base, intencion: "inversion", capacidad_pago: [pie] })).toBe("alta");
  });

  it("un ingreso no cuenta como capacidad de pago para subir a alta", () => {
    expect(calcularPrioridad({ ...base, intencion: "compra_vivienda", capacidad_pago: [ingreso] })).toBe("baja");
  });

  it("requiere_humano sin otra señal es media", () => {
    expect(calcularPrioridad({ ...base, requiere_humano: true })).toBe("media");
  });

  it("cualquier otro caso es baja", () => {
    expect(calcularPrioridad(base)).toBe("baja");
    expect(calcularPrioridad({ ...base, intencion: "indeterminada" })).toBe("baja");
  });
});
