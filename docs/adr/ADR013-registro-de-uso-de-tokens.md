---
id: adrs-adr013
title: 'ADR013: Registro de uso de tokens'
description: Architecture Decision Record (ADR) for Registro de uso de tokens. Cómo se obtiene el costo real de procesar las conversaciones.
---

## Context

- El README debe informar cuánto costó en dinero procesar las 10 conversaciones.
- La API de Gemini informa en cada respuesta los tokens consumidos.
- El modelo de Gemini aún no está elegido, y el precio por token depende del modelo.

## Decision

- Registraremos los tokens de entrada y de salida que informa la API en cada llamada.
- El script que procesa el fixture (ADR002, ADR012) sumará los tokens de las 10 conversaciones.
- El costo se calculará multiplicando los tokens por el precio del modelo usado, consultado en la página oficial de precios al momento del cálculo.

## Consequences

- Positiva: el costo reportado se basa en el consumo real, no en una estimación.
- Negativa: el cálculo depende de un precio externo que puede cambiar; hay que registrar la fecha y la fuente del precio usado.
- Neutral: el mismo registro sirve para comparar el costo de cambios en el prompt.
