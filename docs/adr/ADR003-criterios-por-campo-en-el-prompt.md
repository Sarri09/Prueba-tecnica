---
id: adrs-adr003
title: 'ADR003: Criterios por campo dentro del prompt'
description: Architecture Decision Record (ADR) for Criterios por campo dentro del prompt. Cómo recibe Gemini los criterios ("playbooks") para responder cada campo.
---

## Context

- Sin criterios explícitos, un modelo de lenguaje tiende a rellenar vacíos con supuestos. El enunciado declara innegociable que la herramienta no invente información.
- La idea original fue un "playbook" por pregunta: una guía estructurada por campo que Gemini consultaría como documento externo, buscándolo mediante function calling.
- Hay 5 necesidades del equipo comercial, son fijas y aplican a todas las conversaciones. No hay un corpus grande del cual seleccionar solo una parte.
- El presupuesto es de 3–4 horas y el código debe poder explicarse y modificarse en vivo en la entrevista.

## Decision

- Los criterios de cada campo irán dentro del prompt como instrucciones, con una sección por campo que incluye definición, reglas y ejemplos.
- El prompt vivirá en el repo como un archivo propio y versionado, separado de la lógica de llamada a la API.

Alternativa descartada:

- Playbooks como documentos que Gemini solicita mediante function calling. Se descarta porque agrega un viaje de ida y vuelta por conversación, aumenta la latencia y el código, y el modelo podría no solicitarlos. La recuperación de documentos se justifica cuando el corpus es grande y solo una parte es relevante por consulta, que no es el caso.

## Consequences

- Positiva: el contexto que recibe el modelo es siempre el mismo y es conocido, lo que facilita depurar y evaluar.
- Positiva: menos piezas móviles; una sola llamada a la API por conversación (ver ADR004).
- Negativa: el prompt crece con cada criterio, lo que aumenta los tokens de entrada y el costo por llamada.
- Negativa: un prompt reduce las invenciones, pero no las elimina. Por eso se complementa con verificación en código (ADR006) y con evaluación (ADR012).
- Neutral: cambiar un criterio implica editar el prompt y volver a correr la evaluación.
