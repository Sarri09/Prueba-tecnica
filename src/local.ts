import { serve } from "@hono/node-server";
import app from "./index.js";

// Solo para correr en local. En Vercel se usa directamente la app de index.ts.
serve({ fetch: app.fetch, port: 3000 }, () => console.log("Servicio en http://localhost:3000"));
