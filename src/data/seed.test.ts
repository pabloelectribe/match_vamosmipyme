import { describe, expect, it } from 'vitest'
import { armarPerfiles } from '../domain/perfil'
import { contarCalces, recomendar } from '../domain/afinidad'
import { validarRut } from '../domain/rut'
import { CATALOGO_RUBROS, REGIONES, cargarSemilla } from './seed'

const s = cargarSemilla()

describe('semilla', () => {
  it('tiene 21 empresas reales + 30 ficticias, con ids únicos', () => {
    expect(s.empresas.filter((e) => !e.ficticia)).toHaveLength(21)
    expect(s.empresas.filter((e) => e.ficticia)).toHaveLength(30)
    expect(new Set(s.empresas.map((e) => e.id)).size).toBe(51)
  })
  it('usa solo rubros del catálogo oficial (64) y regiones conocidas', () => {
    expect(CATALOGO_RUBROS).toHaveLength(64)
    for (const x of [...s.ofertas, ...s.busquedas, ...s.necesidades]) expect(CATALOGO_RUBROS).toContain(x.rubro)
    for (const e of s.empresas) expect(REGIONES).toContain(e.region)
  })
  it('RUT ficticios válidos y contactos claramente falsos', () => {
    for (const e of s.empresas) {
      expect(validarRut(e.rut)).toBe(true)
      expect(e.telefono.startsWith('+56 9 0000')).toBe(true)
    }
  })
  it('cubre varias regiones y deja rubros sin oferta para el Radar', () => {
    expect(new Set(s.empresas.map((e) => e.region)).size).toBeGreaterThanOrEqual(14)
    const ofrecidos = new Set(s.ofertas.map((o) => o.rubro))
    const demandaSinOferta = [...new Set(s.busquedas.map((b) => b.rubro))].filter((r) => !ofrecidos.has(r))
    expect(demandaSinOferta).toContain('Arriendo de oficinas, bodegas y cowork')
  })
  it('un perfil real obtiene recomendaciones y conteos para el onboarding', () => {
    const perfiles = armarPerfiles(s)
    const yo = perfiles.find((p) => p.id === 'trekan')!
    const otras = perfiles.filter((p) => p.id !== 'trekan')
    const mazo = recomendar(yo, otras)
    expect(mazo.length).toBeGreaterThan(5)
    expect(mazo[0].afinidad.tipo).toBe('reciproco')
    const c = contarCalces(yo, otras)
    expect(c.buscanLoQueOfreces).toBeGreaterThan(0)
    expect(c.ofrecenLoQueBuscas).toBeGreaterThan(0)
  })
})
