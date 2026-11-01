// Compara un resultado con su respuesta esperada según ADR016.
export type Resultado = {
  id: string;
  intencion: string;
  intencion_cita: string | null;
  urgencia: string;
  urgencia_cita: string | null;
  capacidad_pago: { tipo: string; monto: number | null; moneda: string | null; cita: string }[];
  tipologia: { dormitorios: number[] | null; descripcion: string | null; cita: string | null };
  requiere_humano: boolean;
  motivo_humano: string | null;
  motivo_humano_cita: string | null;
  alerta_manipulacion: boolean;
  cita_clave: string | null;
  prioridad: string;
};

export type Diferencia = { campo: string; esperado: unknown; obtenido: unknown; critica: boolean };

const CASOS_CRITICOS = ["conv-001", "conv-002", "conv-007", "conv-008", "conv-009"];

const clavePago = ({ tipo, monto, moneda }: Resultado["capacidad_pago"][number]) => `${tipo}|${monto}|${moneda}`;

export function comparar(obtenido: Resultado, esperado: Resultado): Diferencia[] {
  const critico = CASOS_CRITICOS.includes(esperado.id);
  const diferencias: Diferencia[] = [];

  const exactos = {
    intencion: [esperado.intencion, obtenido.intencion],
    urgencia: [esperado.urgencia, obtenido.urgencia],
    "tipologia.dormitorios": [esperado.tipologia.dormitorios, obtenido.tipologia.dormitorios],
    requiere_humano: [esperado.requiere_humano, obtenido.requiere_humano],
    motivo_humano: [esperado.motivo_humano, obtenido.motivo_humano],
    alerta_manipulacion: [esperado.alerta_manipulacion, obtenido.alerta_manipulacion],
    prioridad: [esperado.prioridad, obtenido.prioridad],
  };
  for (const [campo, [valorEsperado, valorObtenido]] of Object.entries(exactos)) {
    if (JSON.stringify(valorEsperado) !== JSON.stringify(valorObtenido)) {
      diferencias.push({ campo, esperado: valorEsperado, obtenido: valorObtenido, critica: critico });
    }
  }

  // Sin importar el orden. Un dato de pago que no se esperaba es un dato inventado: siempre es crítico.
  const pagosEsperados = esperado.capacidad_pago.map(clavePago);
  const pagosObtenidos = obtenido.capacidad_pago.map(clavePago);
  const inventados = pagosObtenidos.filter((pago) => !pagosEsperados.includes(pago));
  const faltantes = pagosEsperados.filter((pago) => !pagosObtenidos.includes(pago));
  if (inventados.length > 0) {
    diferencias.push({ campo: "capacidad_pago (inventado)", esperado: pagosEsperados, obtenido: inventados, critica: true });
  }
  if (faltantes.length > 0) {
    diferencias.push({ campo: "capacidad_pago (faltante)", esperado: faltantes, obtenido: pagosObtenidos, critica: critico });
  }

  // Solo presencia o ausencia: el texto puede variar y seguir siendo válido.
  const presencia = {
    intencion_cita: [esperado.intencion_cita, obtenido.intencion_cita],
    urgencia_cita: [esperado.urgencia_cita, obtenido.urgencia_cita],
    "tipologia.descripcion": [esperado.tipologia.descripcion, obtenido.tipologia.descripcion],
    "tipologia.cita": [esperado.tipologia.cita, obtenido.tipologia.cita],
    motivo_humano_cita: [esperado.motivo_humano_cita, obtenido.motivo_humano_cita],
    cita_clave: [esperado.cita_clave, obtenido.cita_clave],
  };
  for (const [campo, [valorEsperado, valorObtenido]] of Object.entries(presencia)) {
    if ((valorEsperado === null) !== (valorObtenido === null)) {
      diferencias.push({ campo, esperado: valorEsperado, obtenido: valorObtenido, critica: critico });
    }
  }

  return diferencias;
}
