---
id: adrs-adr005
title: 'ADR005: Salida estructurada con esquema JSON'
description: Architecture Decision Record (ADR) for Salida estructurada con esquema JSON. Formato de la respuesta de Gemini y su validación.
---

## Context

- Una respuesta en texto libre no se puede validar automáticamente ni la puede consumir otro sistema de forma confiable.
- Clasificar en categorías cerradas reduce el espacio en el que el modelo puede inventar.
- El requisito de no inventar exige que el modelo pueda expresar explícitamente que un dato no aparece en la conversación. Si el formato obliga a llenar un campo, el modelo lo llenará aunque no haya dato.
- La API de Gemini permite restringir la respuesta a un esquema JSON.

## Decision

- Pediremos a Gemini una respuesta JSON restringida a un esquema, con enums para las categorías y campos que admiten `null` o listas vacías para expresar ausencia de datos. El esquema concreto está en ADR007.
- Validaremos en nuestro código cada respuesta contra el mismo esquema. Una respuesta que no valida no se entrega como resultado válido.

Alternativa descartada:

- Texto libre con instrucciones de formato en el prompt. Se descarta porque depende de que el modelo respete el formato y no permite validación automática.

## Consequences

- Positiva: el backend recibe siempre una estructura estable.
- Positiva: "no hay dato" es un valor explícito y verificable, no un hueco.
- Negativa: el esquema garantiza la forma, no la veracidad. Un dato puede venir bien formado y ser inventado (ver ADR006).
- Negativa: el esquema existe dos veces (en la configuración de Gemini y en la validación del código), y hay que mantener ambas versiones sincronizadas.
