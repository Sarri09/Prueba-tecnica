---
id: adrs-adr014
title: 'ADR014: Stack con Hono, Zod y modelo de Gemini'
description: Architecture Decision Record (ADR) for Stack con Hono, Zod y modelo de Gemini. Con qué framework, validación y modelo se construye el servicio.
---

## Context

- El enunciado exige TypeScript, por lo que FastAPI, la herramienta que el desarrollador conoce, no es opción.
- El servicio tiene un solo endpoint y la latencia la domina Gemini, así que el rendimiento del framework no es un criterio útil.
- El desarrollador no ha usado Hono, Express ni Zod. Debe poder explicar y modificar el código en vivo.
- ADR002 y ADR005 ya obligan a validar la entrada y la respuesta del modelo. ADR005 también deja el esquema escrito dos veces.
- Precios y estado de los modelos según la documentación oficial de Gemini, consultada el 2026-11-01 (precios actualizados el 2026-10-30), por millón de tokens de entrada / salida:
  - `gemini-3.5-flash-lite`: $0,30 / $2,50. Estable, sin retiro anunciado.
  - `gemini-3.8-flash`: $0,75 / $3,75, que suben a $1,50 / $7,50 el 2027-01-01. Estable, sin retiro anunciado.
  - `gemini-3.1-flash-lite`: $0,25 / $1,50. Se retira desde el 2027-05-07.
  - `gemini-2.5-flash-lite`: $0,10 / $0,40. Acceso limitado a quienes ya lo usaban.

## Decision

- Usaremos Hono como framework HTTP.
- Usaremos Zod como única definición de los esquemas. Con él se valida la entrada y la respuesta del modelo, y se genera el JSON Schema que recibe Gemini. Esto resuelve la duplicación que señala ADR005.
- Usaremos `gemini-3.5-flash-lite`. Solo probaremos `gemini-3.8-flash` si falla un caso crítico de la evaluación (ADR016).
- El costo se calculará como indica ADR013, sumando a la salida los tokens de thinking, porque se cobran como salida.

Alternativas descartadas:

- Express: necesita tipos aparte y una librería adicional para probar el endpoint sin levantar un servidor. Como el desarrollador tampoco lo conoce, no ofrece una ventaja de familiaridad.
- Fastify: su validación con JSON Schema competiría con Zod y su sistema de plugins sobra para un endpoint.
- Validación escrita a mano: evita una dependencia, pero agrega código propio que mantener y el JSON Schema para Gemini seguiría aparte.
- `gemini-3.1-flash-lite`: el ahorro es mínimo y ya tiene fecha de retiro.
- `gemini-2.5-flash-lite`: es el más barato, pero la documentación recomienda otros modelos para proyectos nuevos y limita su acceso.
- Modelos Pro y `gemini-4-argon`: extraer datos de mensajes cortos no justifica su precio.

## Consequences

- Positiva: un esquema se define una sola vez y sirve para validar y para configurar a Gemini.
- Positiva: Zod cumple el mismo papel que Pydantic en FastAPI, lo que facilita aprenderlo.
- Negativa: son dos herramientas nuevas para el desarrollador, que tendrá que aprenderlas para la entrevista.
- Negativa: la elección del modelo se hizo por estado y precio, sin evidencia de calidad. Esa evidencia saldrá de la evaluación.
- Pendiente: confirmar con una llamada real que Gemini acepta el JSON Schema generado por Zod. La documentación indica que admite solo un subconjunto de JSON Schema.
- Pendiente: la temperatura y el nivel de thinking se fijan al probar con Gemini real.
