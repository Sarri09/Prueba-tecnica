---
id: adrs-adr017
title: 'ADR017: Ajustes a urgencia y alerta de manipulación'
description: Architecture Decision Record (ADR) for Ajustes a urgencia y alerta de manipulación. Precisa ADR008 y ADR016 con dos criterios que surgieron al evaluar con Gemini real.
---

## Context

- Estos dos criterios se implementaron antes de escribir este ADR, durante la evaluación con Gemini real. El proceso pide lo contrario; este ADR los deja registrados.
- ADR008 define `alta` como "fecha concreta cercana". El modelo no recibe la fecha de hoy, así que no puede saber si un mes nombrado está cerca. En las pruebas clasificó "antes de marzo" (conv-001) como `alta`, aunque ADR008 espera `media`.
- ADR007 dice que la evidencia de `alerta_manipulacion` es `cita_clave`, pero ADR016 no indica qué pasa con la alerta si esa cita no es válida.

## Decision

Reemplaza el criterio de urgencia `alta` y `media` de ADR008:

- `alta`: urgencia explícita o un plazo de días o pocas semanas.
- `media`: un plazo de meses. Un mes nombrado como límite, sin expresar apuro, siempre es `media`.

Complementa la verificación de ADR016:

- Si `cita_clave` no es válida, `alerta_manipulacion` pasa a `false` y queda registrado en el log.

Alternativa descartada:

- Entregar la fecha de hoy al modelo para que calcule la cercanía. Resolvería el caso de fondo, pero agrega un dato variable al prompt y haría que la evaluación dependa del día en que se ejecuta.

## Consequences

- Positiva: conv-001 se clasifica como `media` de forma estable, sin depender de la fecha.
- Positiva: una alerta sin evidencia no puede descartar una conversación.
- Negativa: "antes de diciembre" dicho a fines de noviembre sale `media`, aunque sea urgente, salvo que el lead exprese apuro.
- Negativa: si `cita_clave` no es válida en un intento real de manipulación, la conversación no se marca y queda en prioridad `baja` en lugar de `no_atender`.
- Neutral: la regla de urgencia se ajustó mirando un caso del fixture. No demuestra que funcione con conversaciones nuevas.
