---
id: adrs-adr009
title: 'ADR009: Resumen de una línea generado en código'
description: Architecture Decision Record (ADR) for Resumen de una línea generado en código. Quién produce el resumen para el ejecutivo y a partir de qué.
---

## Context

- El equipo comercial pide un resumen de una línea para decidir rápido.
- El resumen es el único campo de texto libre. A diferencia de los demás, no se puede verificar con una cita, por lo que una invención podría colarse ahí.
- Un resumen armado solo desde los campos categóricos pierde información clave. Para conv-008 quedaría como "Reclamo · requiere humano", sin mencionar la visita agendada a la que nadie llegó.

## Decision

- Gemini no generará el resumen.
- El código armará el resumen con una plantilla a partir de los campos ya verificados y de `cita_clave`, una frase textual del lead que también pasa por la verificación de citas (ADR006).
- La plantilla exacta se define en la implementación.

Alternativa descartada:

- Resumen redactado por Gemini con la instrucción de usar solo información de los otros campos. Se descarta porque el resultado suena más natural, pero no se puede verificar.

## Consequences

- Positiva: todo lo que dice el resumen tiene respaldo verificado.
- Negativa: el resumen será más rígido y menos natural que uno redactado por un modelo.
- Negativa: la utilidad del resumen depende de qué frase elija el modelo como `cita_clave`. Una cita válida pero poco informativa produce un resumen pobre.
