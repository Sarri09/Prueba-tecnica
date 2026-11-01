// Pasa las conversaciones por el servicio y compara con fixtures/esperado.json (ADR002, ADR012, ADR013).
// Uso: npm run evaluar -- [url] [corridas]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { comparar, type Diferencia, type Resultado } from "./comparar.js";

const URL_SERVICIO = process.argv[2] ?? "http://localhost:3000";
const CORRIDAS = Number(process.argv[3] ?? 1);

// USD por millón de tokens. Fuente: ai.google.dev/gemini-api/docs/pricing, consultada el 2026-11-01.
const PRECIOS: Record<string, { entrada: number; salida: number }> = {
  "gemini-3.5-flash-lite": { entrada: 0.3, salida: 2.5 },
  "gemini-3.8-flash": { entrada: 0.75, salida: 3.75 },
};

const leerJson = (ruta: string) => JSON.parse(readFileSync(ruta, "utf8"));
const conversaciones: { id: string }[] = leerJson("fixtures/conversaciones.json");
const esperados: Resultado[] = leerJson("fixtures/esperado.json");

mkdirSync("resultados", { recursive: true });
let huboCritica = false;

for (let corrida = 1; corrida <= CORRIDAS; corrida++) {
  console.log(`\n=== Corrida ${corrida} de ${CORRIDAS}`);
  const resultados: unknown[] = [];
  const totales = { entrada: 0, salida: 0, thinking: 0 };
  let modelo = "";
  let costoConocido = true;

  for (const conversacion of conversaciones) {
    const respuesta = await fetch(`${URL_SERVICIO}/analizar`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(conversacion),
    });
    const cuerpo = await respuesta.json();
    resultados.push(cuerpo);

    if (!respuesta.ok) {
      huboCritica = true;
      console.log(`${conversacion.id}: ERROR HTTP ${respuesta.status}`);
      continue;
    }

    modelo = cuerpo.uso.modelo;
    totales.entrada += cuerpo.uso.tokens_entrada;
    totales.salida += cuerpo.uso.tokens_salida;
    totales.thinking += cuerpo.uso.tokens_thinking;

    const esperado = esperados.find((e) => e.id === conversacion.id)!;
    const diferencias: Diferencia[] = comparar(cuerpo, esperado);
    if (diferencias.some((d) => d.critica)) huboCritica = true;
    console.log(`${conversacion.id}: ${diferencias.length === 0 ? "OK" : `${diferencias.length} diferencia(s)`}`);
    for (const d of diferencias) {
      console.log(`  ${d.critica ? "[CRÍTICA] " : ""}${d.campo}: esperado ${JSON.stringify(d.esperado)}, obtenido ${JSON.stringify(d.obtenido)}`);
    }
  }

  writeFileSync(`resultados/corrida-${corrida}.json`, `${JSON.stringify(resultados, null, 2)}\n`);

  const precio = PRECIOS[modelo];
  if (precio === undefined) costoConocido = false;
  console.log(`Modelo: ${modelo}. Tokens: ${JSON.stringify(totales)}`);
  if (costoConocido) {
    const costo = (totales.entrada * precio.entrada + (totales.salida + totales.thinking) * precio.salida) / 1_000_000;
    console.log(`Costo de la corrida: US$ ${costo.toFixed(5)}`);
  } else {
    console.log("Costo: sin precio registrado para este modelo");
  }
}

console.log(huboCritica ? "\nRESULTADO: hay fallas críticas" : "\nRESULTADO: sin fallas críticas");
process.exit(huboCritica ? 1 : 0);
