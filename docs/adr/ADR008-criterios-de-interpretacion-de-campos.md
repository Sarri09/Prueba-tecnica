---
id: adrs-adr008
title: 'ADR008: Criterios de interpretación de campos'
description: Architecture Decision Record (ADR) for Criterios de interpretación de campos. Reglas para resolver los casos ambiguos al llenar el esquema.
---

## Context

- Al etiquetar las 10 conversaciones aparecieron casos donde más de una respuesta era razonable.
- Si estos criterios no se fijan, el modelo resolverá cada caso a su manera y la evaluación no tendrá una respuesta correcta contra la cual comparar.
- Este ADR registra la decisión del equipo de desarrollo. El prompt que recibe Gemini es un artefacto separado que implementa estos criterios (ADR001).

## Decision

Urgencia (mide el plazo de compra):

- `alta`: fecha concreta cercana o urgencia explícita ("Necesito un depto YA", conv-005).
- `media`: plazo de meses ("antes de marzo", conv-001).
- `baja`: el lead declara estar en una etapa temprana ("Recién empezando a ver", conv-006).
- `no_indicada`: en cualquier otro caso.
- La urgencia no aplica a reclamos (conv-008 → `no_indicada`); su prioridad viene de la regla de reclamo.
- Requisitos del producto como "entrega inmediata" son tipología, no urgencia (conv-003).

Capacidad de pago:

- El pie no es presupuesto total (conv-001).
- Un presupuesto total para varias unidades no se divide por unidad (conv-003).
- Un ingreso no es presupuesto, y no se asume su periodicidad (conv-007).
- Los montos mencionados por el asistente no cuentan (conv-001, "desde UF 4.200").
- "Millones" sin moneda se registra como CLP. Es una inferencia aceptada de forma consciente (conv-007).
- El crédito preaprobado se registra como tipo `credito_preaprobado` con `monto: null`. No equivale a "dio un monto".

Intervención humana (`requiere_humano: true`):

- Reclamo → `motivo_humano: "reclamo"` (conv-008).
- Crédito preaprobado → `fuera_de_alcance_asistente` (conv-005).
- Consulta por subsidio → `fuera_de_alcance_asistente` (conv-007).
- Un intento de manipulación activa `alerta_manipulacion`, pero por sí solo no activa `requiere_humano` (conv-009).

Tipología:

- "Estudio" se registra como descripción; no se convierte a una cantidad de dormitorios (conv-002).
- Estacionamiento y bodega no son tipología (conv-006).
- Un local comercial se registra como descripción (conv-010).

Intención:

- `no_lead` solo con evidencia: número equivocado (conv-004) o busca algo que, según la propia conversación, el proyecto no ofrece (conv-002, arriendo en un proyecto solo de venta).
- `indeterminada` cuando no hay evidencia de intención (conv-009).
- La consulta por un local comercial es `consulta`, porque los datos disponibles no dicen si el proyecto tiene locales (conv-010).

## Consequences

- Positiva: los casos difíciles del fixture tienen una respuesta definida y comprobable.
- Negativa: los criterios salen de 10 conversaciones; casos reales nuevos pueden no encajar en ellos.
- Negativa: aceptar CLP como inferencia es una excepción consciente a "no inventar" y debe declararse como tal.
- Negativa: derivar a un humano los créditos preaprobados y los subsidios aumenta la carga de los ejecutivos.
- Neutral: cada criterio nuevo o cambiado debe reflejarse en el prompt y en `fixtures/esperado.json`.
