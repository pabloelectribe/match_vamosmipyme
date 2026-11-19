/**
 * Afinidad entre dos empresas a partir de "Qué busco" y "Qué ofrezco".
 * Módulo puro: sin React, sin localStorage, sin fechas implícitas.
 *
 * Yo = A, la otra = B.
 *  - ofreceLoQueBuscas: B ofrece rubros que A busca.
 *  - buscaLoQueOfreces: B busca (o publicó una necesidad de) rubros que A ofrece.
 */
import type { PerfilAfinidad, Rubro, TipoMatch, Urgencia } from './types'

export const PESOS = {
  reciprocoBase: 36, // + 12 × (fuerzaA + fuerzaB) → 60 con calce exacto en ambos lados
  ofreceBase: 20, // + 15 × fuerza → 35 exacto
  buscaBase: 18, // + 12 × fuerza → 30 exacto
  coberturaPorCalce: 8,
  coberturaMaxPorLado: 16,
  urgencia: 5,
  urgenciaMax: 10,
  necesidad: 10,
  mismaRegion: 8,
  perfilCompleto: 4,
  umbralPerfilCompleto: 80,
  buenaNota: 4,
  umbralNota: 5.5,
  minEvaluaciones: 3,
  parcial: 0.5,
} as const

/** Rubros del catálogo que son casi lo mismo: calce parcial entre sí. */
const FAMILIAS: Record<string, Rubro[]> = {
  prevencion: [
    'Prevención de riesgos',
    'Prevención de riesgos (DS44)',
    'Prevención de riesgos, Seguridad y salud en obra',
  ],
}

export function pesoCalce(a: Rubro, b: Rubro): number {
  if (a === b) return 1
  for (const fam of Object.values(FAMILIAS)) {
    if (fam.includes(a) && fam.includes(b)) return PESOS.parcial
  }
  return 0
}

export interface Coincidencia {
  /** Rubro que busca quien compra. */
  busca: Rubro
  /** Rubro que ofrece quien vende. */
  ofrece: Rubro
  peso: number // 1 exacto, 0.5 familia
  urgencia?: Urgencia // de la búsqueda de A (solo lado ofreceLoQueBuscas)
  viaNecesidad?: boolean // B publicó una necesidad puntual
}

export interface Afinidad {
  score: number // 0..100, 0 = sin calce
  tipo: TipoMatch | null
  ofreceLoQueBuscas: Coincidencia[]
  buscaLoQueOfreces: Coincidencia[]
  motivos: string[]
  desglose: Record<string, number>
}

function mejorCalce(rubro: Rubro, candidatos: Rubro[]): { rubro: Rubro; peso: number } | null {
  let mejor: { rubro: Rubro; peso: number } | null = null
  for (const c of candidatos) {
    const peso = pesoCalce(rubro, c)
    if (peso > 0 && (!mejor || peso > mejor.peso)) mejor = { rubro: c, peso }
  }
  return mejor
}

export function calcularAfinidad(a: PerfilAfinidad, b: PerfilAfinidad): Afinidad {
  if (a.id === b.id) return vacia()

  // A busca → B ofrece
  const ofreceLoQueBuscas: Coincidencia[] = []
  for (const bus of a.busca) {
    const m = mejorCalce(bus.rubro, b.ofrece)
    if (m) ofreceLoQueBuscas.push({ busca: bus.rubro, ofrece: m.rubro, peso: m.peso, urgencia: bus.urgencia })
  }

  // B busca (o publicó necesidad) → A ofrece. Una necesidad cuenta como búsqueda de B.
  const buscaLoQueOfreces: Coincidencia[] = []
  const vistos = new Set<Rubro>()
  const buscasB: { rubro: Rubro; viaNecesidad: boolean }[] = [
    ...b.busca.map((x) => ({ rubro: x.rubro, viaNecesidad: false })),
    ...b.necesidades.map((r) => ({ rubro: r, viaNecesidad: true })),
  ]
  for (const bus of buscasB) {
    const m = mejorCalce(bus.rubro, a.ofrece)
    if (!m) continue
    const clave = `${bus.rubro}|${m.rubro}`
    if (vistos.has(clave)) {
      // la misma búsqueda ya contada: si además hay necesidad, solo marca el origen
      const previa = buscaLoQueOfreces.find((c) => c.busca === bus.rubro && c.ofrece === m.rubro)
      if (previa && bus.viaNecesidad) previa.viaNecesidad = true
      continue
    }
    vistos.add(clave)
    buscaLoQueOfreces.push({ busca: bus.rubro, ofrece: m.rubro, peso: m.peso, viaNecesidad: bus.viaNecesidad })
  }

  if (!ofreceLoQueBuscas.length && !buscaLoQueOfreces.length) return vacia()

  const fuerzaA = Math.max(0, ...ofreceLoQueBuscas.map((c) => c.peso))
  const fuerzaB = Math.max(0, ...buscaLoQueOfreces.map((c) => c.peso))
  const recip = fuerzaA > 0 && fuerzaB > 0
  const tipo: TipoMatch = recip ? 'reciproco' : fuerzaA > 0 ? 'ofrece_lo_que_buscas' : 'busca_lo_que_ofreces'

  const d: Record<string, number> = {}
  d.base = recip
    ? PESOS.reciprocoBase + 12 * (fuerzaA + fuerzaB)
    : fuerzaA > 0
      ? PESOS.ofreceBase + 15 * fuerzaA
      : PESOS.buscaBase + 12 * fuerzaB

  const cobertura = (cs: Coincidencia[]) => {
    const extra = cs.reduce((s, c) => s + c.peso, 0) - Math.max(0, ...cs.map((c) => c.peso))
    return Math.min(PESOS.coberturaMaxPorLado, extra * PESOS.coberturaPorCalce)
  }
  d.cobertura = cobertura(ofreceLoQueBuscas) + cobertura(buscaLoQueOfreces)

  const urgentes = ofreceLoQueBuscas.filter((c) => c.urgencia === 'este_mes').length
  d.urgencia = Math.min(PESOS.urgenciaMax, urgentes * PESOS.urgencia)

  const viaNec = buscaLoQueOfreces.filter((c) => c.viaNecesidad)
  d.necesidad = viaNec.length ? PESOS.necesidad * Math.max(...viaNec.map((c) => c.peso)) : 0

  d.region = a.region === b.region ? PESOS.mismaRegion : 0
  d.perfil = b.completitud >= PESOS.umbralPerfilCompleto ? PESOS.perfilCompleto : 0
  d.nota =
    b.nota !== undefined && b.nEvaluaciones >= PESOS.minEvaluaciones && b.nota >= PESOS.umbralNota
      ? PESOS.buenaNota
      : 0

  const score = Math.min(100, Math.round(Object.values(d).reduce((s, v) => s + v, 0)))
  return { score, tipo, ofreceLoQueBuscas, buscaLoQueOfreces, motivos: motivos(ofreceLoQueBuscas, buscaLoQueOfreces), desglose: d }
}

function vacia(): Afinidad {
  return { score: 0, tipo: null, ofreceLoQueBuscas: [], buscaLoQueOfreces: [], motivos: [], desglose: {} }
}

/** "Busca Diseño gráfico, que tú ofreces · Ofrece Capacitación, que tú buscas" */
function motivos(ofrece: Coincidencia[], busca: Coincidencia[]): string[] {
  const out: string[] = []
  for (const c of busca) {
    const rel = c.busca === c.ofrece ? 'que tú ofreces' : `parecido a lo que ofreces (${c.ofrece})`
    out.push(`${c.viaNecesidad ? 'Publicó que necesita' : 'Busca'} ${c.busca}, ${rel}`)
  }
  for (const c of ofrece) {
    const rel = c.busca === c.ofrece ? 'que tú buscas' : `parecido a lo que buscas (${c.busca})`
    out.push(`Ofrece ${c.ofrece}, ${rel}`)
  }
  return out
}

/** "Tú le ofreces Capacitación ⇄ Te ofrece Diseño gráfico". Sirve para la tarjeta y para WhatsApp. */
export function textoIntercambio(af: Afinidad): string {
  const tuOfreces = unir(af.buscaLoQueOfreces.map((c) => c.ofrece))
  const teOfrece = unir(af.ofreceLoQueBuscas.map((c) => c.ofrece))
  if (tuOfreces && teOfrece) return `Tú le ofreces ${tuOfreces} ⇄ Te ofrece ${teOfrece}`
  if (teOfrece) return `Te ofrece ${teOfrece}`
  if (tuOfreces) return `Tú le ofreces ${tuOfreces}`
  return ''
}

function unir(xs: string[]): string {
  const u = [...new Set(xs)]
  if (u.length <= 1) return u[0] ?? ''
  return `${u.slice(0, -1).join(', ')} y ${u[u.length - 1]}`
}

export type FiltroMazo = 'todos' | 'ofrecen' | 'buscan' | 'reciprocos'

export interface OpcionesRecomendar {
  filtro?: FiltroMazo
  region?: string
  excluir?: ReadonlySet<string> // ya vistas, guardadas, etc.
}

export interface Recomendacion {
  perfil: PerfilAfinidad
  afinidad: Afinidad
}

/** Mazo ordenado: recíprocas primero (por score), luego el resto. Desempata por calces y completitud. */
export function recomendar(
  yo: PerfilAfinidad,
  otras: PerfilAfinidad[],
  op: OpcionesRecomendar = {},
): Recomendacion[] {
  const { filtro = 'todos', region, excluir } = op
  const res: Recomendacion[] = []
  for (const p of otras) {
    if (p.id === yo.id || excluir?.has(p.id)) continue
    if (region && p.region !== region) continue
    const af = calcularAfinidad(yo, p)
    if (!af.tipo) continue
    if (filtro === 'reciprocos' && af.tipo !== 'reciproco') continue
    if (filtro === 'ofrecen' && !af.ofreceLoQueBuscas.length) continue
    if (filtro === 'buscan' && !af.buscaLoQueOfreces.length) continue
    res.push({ perfil: p, afinidad: af })
  }
  const calces = (r: Recomendacion) => r.afinidad.ofreceLoQueBuscas.length + r.afinidad.buscaLoQueOfreces.length
  return res.sort(
    (x, y) =>
      Number(y.afinidad.tipo === 'reciproco') - Number(x.afinidad.tipo === 'reciproco') ||
      y.afinidad.score - x.afinidad.score ||
      calces(y) - calces(x) ||
      y.perfil.completitud - x.perfil.completitud ||
      x.perfil.id.localeCompare(y.perfil.id),
  )
}

export interface ConteoCalces {
  buscanLoQueOfreces: number
  ofrecenLoQueBuscas: number
  reciprocas: number
}

/** Para el final del onboarding: "12 empresas buscan lo que ofreces · 5 ofrecen lo que buscas". */
export function contarCalces(yo: PerfilAfinidad, otras: PerfilAfinidad[]): ConteoCalces {
  const r: ConteoCalces = { buscanLoQueOfreces: 0, ofrecenLoQueBuscas: 0, reciprocas: 0 }
  for (const p of otras) {
    const af = calcularAfinidad(yo, p)
    if (af.buscaLoQueOfreces.length) r.buscanLoQueOfreces++
    if (af.ofreceLoQueBuscas.length) r.ofrecenLoQueBuscas++
    if (af.tipo === 'reciproco') r.reciprocas++
  }
  return r
}
