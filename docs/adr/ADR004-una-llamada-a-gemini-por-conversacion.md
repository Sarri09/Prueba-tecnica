---
id: adrs-adr004
title: 'ADR004: Una sola llamada a Gemini por conversación'
description: Architecture Decision Record (ADR) for Una sola llamada a Gemini por conversación. Cuántas llamadas al modelo se hacen para analizar una conversación.
---

## Context

- Hay que responder varias preguntas sobre cada conversación: intención, urgencia, capacidad de pago, tipología, necesidad de intervención humana.
- Las preguntas dependen entre sí. Si una conversación no es un lead, la capacidad de pago deja de ser relevante. Si es un reclamo, eso determina la necesidad de intervención humana.
- El diseño inicial contemplaba entregar cada playbook por separado, lo que podía implicar una llamada por pregunta.
- La API key tiene límite de gasto y el enunciado pide reportar el costo de procesar las 10 conversaciones.

## Decision

- Haremos una sola llamada a Gemini por conversación, que devuelve todos los campos juntos en una única respuesta estructurada (ver ADR005).
- La política de reintentos ante errores de la API se define en la implementación.

Alternativa descartada:

- Una llamada por pregunta. Se descarta porque multiplica el costo y la latencia por el número de preguntas, y porque llamadas independientes pueden producir respuestas contradictorias entre campos (por ejemplo, "no es lead" junto con "urgencia alta").

## Consequences

- Positiva: los campos de una respuesta se generan con el mismo contexto, lo que favorece la coherencia entre ellos.
- Positiva: menor costo y latencia por conversación.
- Negativa: si la llamada falla o la respuesta es inválida, fallan todos los campos a la vez; no hay resultados parciales.
- Negativa: una sola llamada concentra un prompt más largo y una salida más compleja.
