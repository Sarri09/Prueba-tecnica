---
id: adrs-adr012
title: 'ADR012: Estrategia de pruebas en dos niveles'
description: Architecture Decision Record (ADR) for Estrategia de pruebas en dos niveles. Cómo se demuestra que la herramienta funciona y seguirá funcionando.
---

## Context

- El enunciado evalúa "evidencia de que funciona y va a seguir funcionando cuando alguien lo toque".
- Las respuestas de un modelo de lenguaje no son deterministas, y cada llamada cuesta dinero contra una API key con límite de gasto.
- Varias piezas del sistema son deterministas y no dependen del modelo: validación de entrada y salida, verificación de citas, normalización, resumen y prioridad.
- `fixtures/esperado.json` contiene la respuesta esperada de las 10 conversaciones según ADR007 y ADR008.

## Decision

Probaremos en dos niveles:

1. Pruebas automatizadas sin llamar a Gemini, con el cliente de Gemini simulado:
   - Validación de la entrada (ADR002) y de la respuesta contra el esquema (ADR005).
   - Verificación de citas: citas válidas, citas inventadas, citas que solo están en mensajes del asistente y diferencias de tildes, mayúsculas y espacios (ADR006).
   - Armado del resumen (ADR009) y reglas de prioridad (ADR010).
   - Endpoint HTTP, incluyendo errores de la API de Gemini y respuestas inválidas del modelo.
2. Evaluación contra Gemini real: un script procesa las 10 conversaciones, compara cada resultado con `fixtures/esperado.json` campo por campo y reporta las diferencias. Se ejecuta manualmente, no en cada corrida de tests.

## Consequences

- Positiva: las pruebas del nivel 1 son rápidas, gratuitas y deterministas, así que se pueden ejecutar en cada cambio.
- Positiva: la evaluación del nivel 2 muestra el comportamiento real en los casos difíciles, como pide el enunciado.
- Negativa: 10 conversaciones son una muestra pequeña.
- Negativa: los resultados de Gemini pueden variar entre corridas, así que una evaluación aprobada no garantiza la siguiente.
- Pendiente: definir qué campos deben coincidir exactamente en la evaluación (categorías, montos) y cuáles no (el texto de las citas puede variar y seguir siendo válido).
