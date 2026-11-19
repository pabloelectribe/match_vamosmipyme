import type { Busqueda, Empresa, Evaluacion, NecesidadPublicada, Oferta, PerfilAfinidad } from './types'

/** Puntos del indicador de perfil completo (suman 100). */
export const PESOS_COMPLETITUD = { identidad: 20, ofrece: 20, busca: 20, resena: 15, logo: 15, canales: 10 } as const

export function calcularCompletitud(e: Empresa, nOfrece: number, nBusca: number): number {
  const p = PESOS_COMPLETITUD
  let t = 0
  if (e.nombre && e.region && e.comuna) t += p.identidad
  if (nOfrece > 0) t += p.ofrece
  if (nBusca > 0) t += p.busca
  if (e.resena.trim().length >= 20) t += p.resena
  if (e.logo) t += p.logo
  if (e.canales.length > 0) t += p.canales
  return t
}

export interface Reputacion {
  nota?: number // solo si hay ≥ 3 evaluaciones
  n: number
}
export const MIN_EVALUACIONES = 3

export function reputacionDe(empresaId: string, evaluaciones: Evaluacion[]): Reputacion {
  const rec = evaluaciones.filter((x) => x.a === empresaId)
  if (!rec.length) return { n: 0 }
  const prom = rec.reduce((s, x) => s + x.nota, 0) / rec.length
  return { n: rec.length, nota: Math.round(prom * 10) / 10 }
}

export interface Estado {
  empresas: Empresa[]
  ofertas: Oferta[]
  busquedas: Busqueda[]
  necesidades: NecesidadPublicada[]
  evaluaciones: Evaluacion[]
}

export function armarPerfil(empresaId: string, s: Estado): PerfilAfinidad {
  const e = s.empresas.find((x) => x.id === empresaId)
  if (!e) throw new Error(`Empresa desconocida: ${empresaId}`)
  const ofrece = s.ofertas.filter((o) => o.empresaId === empresaId).map((o) => o.rubro)
  const busca = s.busquedas.filter((b) => b.empresaId === empresaId).map((b) => ({ rubro: b.rubro, urgencia: b.urgencia }))
  const rep = reputacionDe(empresaId, s.evaluaciones)
  return {
    id: empresaId,
    region: e.region,
    ofrece,
    busca,
    necesidades: s.necesidades.filter((n) => n.empresaId === empresaId && n.estado === 'abierta').map((n) => n.rubro),
    completitud: calcularCompletitud(e, ofrece.length, busca.length),
    nota: rep.nota,
    nEvaluaciones: rep.n,
  }
}

export function armarPerfiles(s: Estado): PerfilAfinidad[] {
  return s.empresas.map((e) => armarPerfil(e.id, s))
}
