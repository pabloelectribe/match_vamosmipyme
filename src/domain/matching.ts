/**
 * Consentimiento doble: hay match solo cuando ambas empresas marcan "Me interesa".
 * Lógica pura sobre listas; la capa de datos solo guarda el resultado.
 */
import { calcularAfinidad } from './afinidad'
import type { Conexion, ID, Interes, Match, PerfilAfinidad } from './types'

export interface Red {
  intereses: Interes[]
  matches: Match[]
  conexiones: Conexion[]
}

export const DIAS_SEGUIMIENTO = 10
export const idMatch = (a: ID, b: ID) => `m-${[a, b].sort().join('-')}`

export function sumarDias(iso: string, dias: number): string {
  const d = new Date(iso)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString()
}

export const matchEntre = (matches: Match[], a: ID, b: ID) => matches.find((m) => m.id === idMatch(a, b))

/** Registra un interés (el último de A hacia B reemplaza al anterior) y crea el match si es mutuo. */
export function aplicarInteres(
  red: Red,
  nuevo: Interes,
  perfil: (id: ID) => PerfilAfinidad,
): { red: Red; match?: Match } {
  const intereses = [...red.intereses.filter((i) => !(i.de === nuevo.de && i.a === nuevo.a)), nuevo]
  const base: Red = { ...red, intereses }
  if (nuevo.tipo !== 'me_interesa') return { red: base }
  if (matchEntre(red.matches, nuevo.de, nuevo.a)) return { red: base }
  const recíproco = intereses.some((i) => i.de === nuevo.a && i.a === nuevo.de && i.tipo === 'me_interesa')
  if (!recíproco) return { red: base }

  const af = calcularAfinidad(perfil(nuevo.de), perfil(nuevo.a))
  const match: Match = {
    id: idMatch(nuevo.de, nuevo.a),
    empresas: [nuevo.de, nuevo.a],
    tipo: af.tipo ?? 'ofrece_lo_que_buscas',
    vendeA: {
      [nuevo.de]: [...new Set(af.buscaLoQueOfreces.map((c) => c.ofrece))], // lo que de le vende a a
      [nuevo.a]: [...new Set(af.ofreceLoQueBuscas.map((c) => c.ofrece))], // lo que a le vende a de
    },
    creadoEn: nuevo.en,
    celebradoPor: [],
  }
  const conexion: Conexion = {
    matchId: match.id,
    estado: 'nueva',
    historial: [{ estado: 'nueva', en: nuevo.en }],
    seguimientoEn: sumarDias(nuevo.en, DIAS_SEGUIMIENTO),
  }
  return { red: { intereses, matches: [...red.matches, match], conexiones: [...red.conexiones, conexion] }, match }
}
