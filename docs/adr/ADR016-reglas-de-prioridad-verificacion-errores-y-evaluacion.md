---
id: adrs-adr016
title: 'ADR016: Reglas de prioridad, verificación, errores y evaluación'
description: Architecture Decision Record (ADR) for Reglas de prioridad, verificación, errores y evaluación. Cierra los puntos que ADR004, ADR006, ADR010 y ADR012 dejaron pendientes.
---

## Context

- ADR004, ADR006, ADR010 y ADR012 dejaron puntos pendientes. Son decisiones pequeñas y se agrupan aquí para no multiplicar los ADRs.
- ADR006 indica que un dato sin cita válida se anula, pero `intencion`, `urgencia` y `requiere_humano` no admiten `null`.
- El criterio general es implementar lo mínimo que resuelve el enunciado.

## Decision

Prioridad (ADR010). La escala es `alta`, `media`, `baja` y `no_atender`. Gana la primera regla que se cumpla:

1. Intención `reclamo` → `alta` (conv-008).
2. Intención `no_lead` → `no_atender` (conv-002, conv-004).
3. `alerta_manipulacion` con intención `indeterminada` → `no_atender` (conv-009).
4. Urgencia `alta` → `alta` (conv-005).
5. Intención `compra_vivienda` o `inversion`, con `capacidad_pago` de tipo `pie`, `precio_maximo` o `presupuesto_total` → `alta` (conv-001, conv-003).
6. `requiere_humano` → `media` (conv-007).
7. En cualquier otro caso → `baja` (conv-006, conv-010).

Verificación de citas (ADR006):

- Una cita debe tener al menos 2 palabras y aparecer dentro de un solo mensaje del lead.
- Una función corta extrae los números de la cita y `monto` debe coincidir con uno de ellos. Entiende `UF 9.000` → 9000 y `1.8 millones` → 1800000. Si no coincide, el elemento se elimina. Un monto escrito en palabras no se reconoce y también se elimina.
- Si falla una cita, el dato se anula: `intencion` pasa a `indeterminada`, `urgencia` a `no_indicada`, `requiere_humano` a `false` con `motivo_humano` en `null`, y los campos que admiten `null` quedan en `null`. Cada dato anulado se registra en el log.

Errores (ADR004):

- Entrada inválida → HTTP 400.
- Cualquier falla de Gemini o respuesta que no valida → HTTP 502, sin resultados parciales y sin reenviar mensajes de error de la API.
- No habrá reintentos. El servicio no guarda estado, así que quien llama puede repetir la petición.

Evaluación (ADR012):

- Coincidencia exacta: `intencion`, `urgencia`, `capacidad_pago` (tipo, monto y moneda, sin importar el orden), `dormitorios`, `requiere_humano`, `motivo_humano`, `alerta_manipulacion` y `prioridad`.
- Solo presencia o ausencia: las citas, `descripcion` y `cita_clave`, porque su texto puede variar y seguir siendo válido.
- Son casos críticos conv-001, conv-002, conv-007, conv-008 y conv-009, y cualquier dato inventado en `capacidad_pago`.
- Se ejecuta 3 veces antes de entregar. Los casos críticos deben ser correctos en las 3 corridas. El resto se reporta sin umbral.

Alternativas descartadas:

- Reintentos automáticos: agregan código y pueden duplicar el costo, mientras que quien llama ya puede repetir la petición.
- Campo `datos_descartados` en la respuesta: haría visible en la respuesta lo que se anuló, pero agrega superficie al contrato. Queda en el log.
- Exigir urgencia para la prioridad `alta`: dejaría a conv-003, quizás el lead más valioso, por debajo de lo que merece.

## Consequences

- Positiva: las reglas son unos pocos `if` que se prueban sin llamar a Gemini y se pueden cambiar en vivo.
- Negativa: un reclamo real con una cita mal copiada baja a prioridad `baja`, y eso solo queda en el log.
- Negativa: una respuesta real de una palabra ("urgente") no sirve como cita.
- Negativa: una falla transitoria de Gemini llega a quien llama como un 502.
- Negativa: las reglas de prioridad salen de solo 10 casos y dejan 4 en `alta`.
- Neutral: `prioridad` se agrega a `fixtures/esperado.json`, aunque no forma parte de lo que devuelve Gemini (ADR007).
