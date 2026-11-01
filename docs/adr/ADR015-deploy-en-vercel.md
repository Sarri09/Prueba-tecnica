---
id: adrs-adr015
title: 'ADR015: Deploy en Vercel sin autenticación'
description: Architecture Decision Record (ADR) for Deploy en Vercel sin autenticación. Dónde se publica el servicio y cómo se protege.
---

## Context

- El enunciado evalúa que el deploy exista, responda y no exponga la key. Debe seguir arriba cuando lo revisen, con un `curl` de ejemplo en el README.
- El desarrollador no conoce GCP ni tiene acceso a la cuenta que generó la API key, pero sí tiene el valor de la key. Para el deploy basta con ese valor.
- El enunciado acepta otros proveedores además de GCP.
- El repositorio es público, por lo que cualquier secreto escrito en él queda expuesto.

## Decision

- Publicaremos el servicio en el plan gratuito Hobby de Vercel, conectado al repositorio de GitHub.
- `GEMINI_API_KEY` se configurará como variable de entorno en Vercel. En local irá en un archivo `.env`, excluido del repositorio con `.gitignore`.
- El endpoint no tendrá autenticación, para que el `curl` del README funcione directamente.
- El esquema de entrada limitará la cantidad de mensajes y el largo de cada uno. Los valores exactos se definen en la implementación.

Alternativas descartadas:

- Cloud Run: requiere conocer GCP, crear una cuenta con facturación e instalar herramientas adicionales.
- Render: en el plan gratuito el servicio se duerme tras 15 minutos sin tráfico y tarda cerca de un minuto en despertar, justo en el momento de la revisión.
- Railway: la prueba es de $5 por 30 días y el plan gratuito incluye $1 al mes, lo que no asegura que siga arriba al momento de la revisión.
- Token compartido para autenticar: habría que publicarlo en un repositorio público para que el `curl` funcione, lo que anula su protección.

## Consequences

- Positiva: el deploy se hace desde la web, sin Docker ni herramientas de nube adicionales.
- Negativa: cualquiera con la URL puede consumir la key. Solo lo limitan el tamaño de la entrada y el límite de gasto de la key, y debe declararse como limitación.
- Negativa: el plan Hobby es solo para uso personal y no comercial. Considerar que una prueba técnica calza ahí es una interpretación, no algo confirmado por Vercel.
- Negativa: no se puede revisar el gasto en la cuenta de Google. El costo sale de los tokens registrados (ADR013).
- Pendiente: comprobar con un `curl` tras el primer deploy que la URL de producción es pública, responde y no expone la key.
