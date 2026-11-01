---
id: adrs-adr010
title: 'ADR010: Prioridad calculada con reglas en código'
description: Architecture Decision Record (ADR) for Prioridad calculada con reglas en código. Quién decide la prioridad de atención de una conversación.
---

## Context

- El enunciado pide indicar si vale la pena atender la conversación y con qué prioridad. Cómo modelarlo queda a decisión del desarrollador.
- La prioridad no depende solo de la calidad comercial del lead. Un reclamo (conv-008) no es una venta, pero necesita atención inmediata.
- En la entrevista hay que defender el criterio y poder cambiarlo en vivo.

## Decision

- Gemini no devolverá la prioridad.
- El código calculará la prioridad con reglas explícitas a partir de los campos ya verificados (ADR006, ADR007).
- Las reglas concretas y la escala de prioridad aún no están definidas; se registrarán en un ADR posterior y en `fixtures/esperado.json`.

Alternativa descartada:

- Prioridad decidida por Gemini. Se descarta porque no es explicable, es difícil de probar y puede cambiar con la versión del modelo o entre corridas.

## Consequences

- Positiva: las reglas se prueban con tests unitarios sin llamar al modelo.
- Positiva: la prioridad se ajusta sin tocar el prompt.
- Negativa: las reglas son rígidas y pueden no cubrir combinaciones no previstas.
- Negativa: las reglas se definen con solo 10 casos de referencia.
