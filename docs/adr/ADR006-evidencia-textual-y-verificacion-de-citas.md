---
id: adrs-adr006
title: 'ADR006: Evidencia textual y verificación determinista de citas'
description: Architecture Decision Record (ADR) for Evidencia textual y verificación determinista de citas. Cómo se detectan en código los datos sin respaldo en la conversación.
---

## Context

- El enunciado da como ejemplo de falla grave un ejecutivo que llama con un "presupuesto" que nunca existió.
- Ni el prompt (ADR003) ni el esquema (ADR005) garantizan que un dato extraído esté en la conversación.
- Algunas conversaciones contienen montos dichos por el asistente y no por el lead. En conv-001 el asistente dice "desde UF 4.200", que no es la capacidad de pago del lead.
- Al citar, el modelo puede alterar tildes, mayúsculas o espacios.

## Decision

- Cada dato extraído vendrá acompañado de una cita textual de un mensaje del lead.
- Nuestro código verificará que cada cita aparezca en los mensajes con `de: "lead"` después de normalizar el texto (minúsculas, sin tildes, espacios colapsados).
- Si la cita no aparece, el dato asociado se anula (`null` o se elimina de la lista).
- Una cita que solo existe en mensajes del asistente no cuenta como evidencia.

## Consequences

- Positiva: las invenciones sin respaldo textual se detectan de forma determinista, sin depender del modelo.
- Negativa: no detecta malinterpretaciones con cita real. Por ejemplo, "Tenemos pie para unas UF 900" clasificado como presupuesto total pasaría la verificación. Ese error solo lo previenen los criterios del prompt (ADR003, ADR008) y solo lo mide la evaluación (ADR012).
- Negativa: una cita muy corta (por ejemplo "UF" o "sí") coincidiría con casi cualquier conversación. Puede ser necesario exigir un largo mínimo.
- Pendiente: no está decidido cómo verificar que el `monto` corresponde a la cita. Comparar dígitos funciona con "UF 900", pero falla con "1.8 millones" → `1800000`.
