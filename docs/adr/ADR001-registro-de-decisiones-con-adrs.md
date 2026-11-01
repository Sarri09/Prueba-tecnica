---
id: adrs-adr001
title: 'ADR001: Registro de decisiones con ADRs'
description: Architecture Decision Record (ADR) for Registro de decisiones con ADRs. Cómo y dónde se documentan las decisiones de desarrollo del proyecto.
---

## Context

- La prueba técnica tiene un presupuesto de 3–4 horas y pide "algo chico que funcione y que puedas defender".
- El `README.md` debe estar escrito por el desarrollador, no por una IA, y debe explicar qué se decidió, por qué y qué alternativas se descartaron.
- Las decisiones se están tomando en conversación con un asistente de IA. Sin un registro, las razones y las alternativas descartadas se pierden entre conversaciones y herramientas.
- En la entrevista de seguimiento el desarrollador tiene que defender las decisiones y modificar código en vivo.
- El proyecto usa Gemini para analizar conversaciones. Las decisiones de desarrollo (cómo se construye la herramienta) son distintas de las instrucciones que recibe Gemini (cómo analiza una conversación).

## Decision

- Registraremos cada decisión de arquitectura y diseño como un ADR en `docs/adr/`, usando la plantilla de Michael Nygard (Context, Decision, Consequences).
- El asistente de IA redacta los ADRs; el desarrollador los revisa y aprueba antes de escribir el código asociado.
- Si una decisión cambia, escribiremos un ADR nuevo que reemplace al anterior e indique cuál reemplaza, en lugar de reescribir el antiguo.
- Los ADRs son documentación de desarrollo. No se envían a Gemini ni forman parte del prompt.
- El desarrollador usa los ADRs como referencia para escribir el `README.md` con sus propias palabras. El texto de los ADRs no se copia en el README.

## Consequences

- Positiva: las alternativas descartadas y sus razones quedan escritas, lo que alimenta directamente la sección del README que las pide.
- Positiva: cualquier sesión nueva (otra herramienta, otro día) puede retomar el contexto leyendo `docs/adr/`.
- Negativa: escribir y aprobar ADRs consume parte del presupuesto de 3–4 horas.
- Negativa: los ADRs están redactados por IA. Copiarlos en el README violaría una regla explícita de la prueba.
- Neutral: el criterio de interpretación de campos queda documentado en un ADR (ADR008) y también implementado en el prompt. Son dos artefactos distintos que hay que mantener coherentes.
