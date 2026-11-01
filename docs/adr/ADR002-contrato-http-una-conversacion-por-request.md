---
id: adrs-adr002
title: 'ADR002: Contrato HTTP de una conversación por request'
description: Architecture Decision Record (ADR) for Contrato HTTP de una conversación por request. Qué recibe y qué devuelve el servicio.
---

## Context

- El enunciado indica que el backend de Lidz llamará a la herramienta por HTTP "para cada conversación nueva".
- El fixture `fixtures/conversaciones.json` contiene 10 conversaciones en un arreglo. Cada conversación tiene `id` y `mensajes`, y cada mensaje tiene `de` (`lead` | `asistente`) y `texto`.
- El diseño inicial proponía un endpoint que recibiera el JSON completo y separara las conversaciones internamente.
- El enunciado pide incluir en el repo el resultado de procesar las 10 conversaciones.

## Decision

- El servicio expondrá un endpoint HTTP que recibe una sola conversación, con el mismo formato que un elemento del fixture, y devuelve el análisis de esa conversación.
- El servicio validará la entrada (estructura, roles conocidos, mensajes no vacíos) antes de llamar a Gemini.
- Procesaremos las 10 conversaciones del fixture con un script que llama al servicio una vez por conversación y guarda los resultados en el repo.
- La ruta, el método y el formato exacto de las respuestas de error se definen en la implementación.

Alternativa descartada:

- Endpoint que recibe el arreglo completo de conversaciones. Se descarta porque no calza con el uso declarado (una llamada por conversación nueva), un error en una conversación afecta al lote completo y un lote grande aumenta el riesgo de timeout.

## Consequences

- Positiva: el contrato coincide con cómo lo usará el backend de Lidz.
- Positiva: una conversación por request es más simple de probar y de depurar.
- Negativa: se necesita un script adicional para procesar el fixture completo.
- Negativa: procesar muchas conversaciones implica muchas llamadas HTTP. Si en el futuro se necesitara un modo batch, habría que agregarlo aparte.
- Neutral: reutilizar el formato del fixture como contrato de entrada evita transformaciones, pero acopla el contrato a ese formato.
