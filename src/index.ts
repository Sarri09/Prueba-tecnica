import { Hono } from "hono";
import { Conversacion, type LlamarGemini } from "./esquemas.js";
import { llamarGemini } from "./gemini.js";
import { calcularPrioridad } from "./prioridad.js";
import { armarResumen } from "./resumen.js";
import { verificarCitas } from "./verificar.js";

// Recibe la llamada a Gemini como parámetro para poder simularla en las pruebas (ADR012).
export function crearApp(llamar: LlamarGemini) {
  const app = new Hono();

  app.get("/", (c) => c.json({ estado: "ok" }));

  app.post("/analizar", async (c) => {
    const cuerpo = await c.req.json().catch(() => null);
    const entrada = Conversacion.safeParse(cuerpo);
    if (!entrada.success) {
      const detalle = entrada.error.issues.map((i) => ({ campo: i.path.join("."), mensaje: i.message }));
      return c.json({ error: "Entrada inválida", detalle }, 400);
    }
    const conversacion = entrada.data;

    try {
      const { salida, uso } = await llamar(conversacion);
      const { verificada, anulados } = verificarCitas(salida, conversacion);
      if (anulados.length > 0) console.warn(`${conversacion.id}: datos anulados: ${anulados.join(", ")}`);

      console.log(`${conversacion.id}: ${JSON.stringify(uso)}`);
      return c.json({
        id: conversacion.id,
        ...verificada,
        prioridad: calcularPrioridad(verificada),
        resumen: armarResumen(verificada),
        uso,
      });
    } catch (error) {
      // Solo el tipo y el código de error: el mensaje de la API no se reenvía ni se registra (ADR016).
      const nombre = error instanceof Error ? error.name : "desconocido";
      const codigo = (error as { status?: number }).status ?? "sin código";
      console.error(`${conversacion.id}: falló el análisis: ${nombre} (${codigo})`);
      return c.json({ error: "No se pudo analizar la conversación" }, 502);
    }
  });

  return app;
}

export default crearApp(llamarGemini);
