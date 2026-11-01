---
id: adrs-adr007
title: 'ADR007: Esquema de salida v1'
description: Architecture Decision Record (ADR) for Esquema de salida v1. Campos, tipos y valores permitidos de la respuesta de Gemini.
---

## Context

- El equipo comercial necesita saber: qué busca la persona, qué tan apurada está, si dijo cuánto puede pagar y qué tipo de departamento busca, si hace falta un humano, y un resumen de una línea.
- Se redactó un borrador de esquema y se etiquetaron a mano las 10 conversaciones del fixture con él. El ejercicio mostró vacíos:
  - Un tipo `ingreso_mensual` obligaba a inventar la periodicidad (conv-007 dice "ingresos de 1.8 millones", sin periodo).
  - Faltaba una intención para cuando no hay evidencia suficiente (conv-009).
  - Marcar un intento de manipulación como "requiere humano" enviaría ejecutivos a atender a quien intenta engañar al asistente.
  - Un resumen armado solo desde los campos pierde lo esencial de un reclamo (conv-008).
  - El crédito preaprobado (conv-005) es capacidad de pago, pero no tiene monto.

## Decision

Gemini devolverá este esquema:

```ts
{
  intencion: "compra_vivienda" | "inversion" | "consulta" | "reclamo" | "no_lead" | "indeterminada",
  intencion_cita: string | null,

  urgencia: "alta" | "media" | "baja" | "no_indicada",
  urgencia_cita: string | null,

  capacidad_pago: Array<{
    tipo: "pie" | "precio_maximo" | "presupuesto_total" | "ingreso" | "credito_preaprobado",
    monto: number | null,          // null para credito_preaprobado sin monto
    moneda: "UF" | "CLP" | null,
    cita: string
  }>,                              // lista vacía si no dijo nada

  tipologia: {
    dormitorios: number[] | null,
    descripcion: string | null,
    cita: string | null
  },

  requiere_humano: boolean,
  motivo_humano: "reclamo" | "fuera_de_alcance_asistente" | null,
  motivo_humano_cita: string | null,

  alerta_manipulacion: boolean,

  cita_clave: string | null        // frase textual del lead usada en el resumen (ADR009)
}
```

- La prioridad no forma parte de este esquema; la calcula el código (ADR010).
- El resumen no forma parte de este esquema; lo arma el código (ADR009).
- `fixtures/esperado.json` contiene la respuesta esperada de las 10 conversaciones con este esquema.

## Consequences

- Positiva: cada dato tiene una cita asociada que se puede verificar (ADR006).
- Positiva: la ausencia de datos y la falta de evidencia de intención tienen valores explícitos.
- Negativa: más campos significan un prompt más largo y más superficie de error.
- Negativa: `alerta_manipulacion` no tiene una cita propia; su evidencia queda en `cita_clave`.
- Neutral: cualquier cambio al esquema obliga a actualizar el prompt, la validación (ADR005) y `fixtures/esperado.json`.
