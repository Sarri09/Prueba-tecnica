# Contexto del proyecto

Prueba técnica (Software Engineer Junior, Lidz): una herramienta que lee una conversación de WhatsApp de un lead inmobiliario y le dice al ejecutivo comercial, sin que tenga que abrirla, si vale la pena atenderla y con qué prioridad. Usa Gemini (API key en la variable de entorno `GEMINI_API_KEY`).

El enunciado original está en el README del repo de la prueba. Lo innegociable: **si la conversación no dice algo, la herramienta no lo inventa.**

## Decisiones

Todas las decisiones de desarrollo están en `docs/adr/` (ADR001–ADR017). Léelas antes de proponer o escribir código. No contradigas un ADR aprobado sin proponer primero un ADR nuevo que lo reemplace.

`fixtures/conversaciones.json` son las 10 conversaciones de la prueba. `fixtures/esperado.json` es la respuesta esperada de cada una según ADR007, ADR008 y ADR016 (el campo `_nota` es solo documentación).

## Proceso de trabajo

1. Cada decisión nueva se escribe primero como ADR en `docs/adr/` (plantilla Nygard: Context, Decision, Consequences, con frontmatter `id`, `title`, `description`).
2. El desarrollador revisa y aprueba el ADR.
3. Recién después se escribe el código.

No quedan decisiones abiertas que requieran un ADR antes de implementar. Los pendientes que se resuelven probando están en ADR014 y ADR015.

Proponer siempre lo mínimo que resuelve el enunciado: pocos ADRs y pocas dependencias.

## Reglas

- Lenguaje: TypeScript.
- La API key nunca va en el repo, ni en el código, ni en logs, ni en respuestas HTTP.
- **No escribas ni edites `README.md`.** El enunciado exige que lo escriba el desarrollador, no una IA. Puedes responder preguntas que lo ayuden a escribirlo.
- Los ADRs son documentación de desarrollo: no se incluyen en el prompt de Gemini.
- El código debe ser simple de explicar: en la entrevista el desarrollador lo va a explicar y modificar en vivo.

## Cómo comunicarte con el desarrollador

- Responde en español.
- No inventes: si no sabes algo o no lo verificaste, dilo.
- No le des la razón para complacerlo: critica, señala errores y di cuando una idea es mala.
- No rellenes vacíos con supuestos; pregunta o márcalos como pendientes.
