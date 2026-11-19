import { describe, expect, it } from 'vitest'
import { aplicarInteres, idMatch, sumarDias, type Red } from './matching'
import { enlaceWhatsApp, mensajeSugerido } from './mensaje'
import type { Interes, PerfilAfinidad } from './types'

const perfiles: Record<string, PerfilAfinidad> = {
  a: { id: 'a', region: 'R', ofrece: ['Capacitación y OTEC'], busca: [{ rubro: 'Diseño gráfico y branding', urgencia: 'sin_apuro' }], necesidades: [], completitud: 50, nEvaluaciones: 0 },
  b: { id: 'b', region: 'R', ofrece: ['Diseño gráfico y branding'], busca: [{ rubro: 'Capacitación y OTEC', urgencia: 'sin_apuro' }], necesidades: [], completitud: 50, nEvaluaciones: 0 },
}
const p = (id: string) => perfiles[id]
const vacia: Red = { intereses: [], matches: [], conexiones: [] }
const int = (de: string, a: string, tipo: Interes['tipo'] = 'me_interesa'): Interes => ({ de, a, tipo, origen: 'mazo', en: '2026-11-19T12:00:00.000Z' })

describe('consentimiento doble', () => {
  it('un solo "me interesa" no crea match', () => {
    const r = aplicarInteres(vacia, int('a', 'b'), p)
    expect(r.match).toBeUndefined()
    expect(r.red.matches).toHaveLength(0)
  })
  it('"ahora no" y "guardar" de la otra parte no crean match', () => {
    let r = aplicarInteres(vacia, int('a', 'b'), p)
    r = aplicarInteres(r.red, int('b', 'a', 'guardar'), p)
    expect(r.match).toBeUndefined()
    r = aplicarInteres(r.red, int('b', 'a', 'ahora_no'), p)
    expect(r.match).toBeUndefined()
  })
  it('interés mutuo crea match recíproco con el intercambio y la conexión "nueva"', () => {
    let r = aplicarInteres(vacia, int('a', 'b'), p)
    r = aplicarInteres(r.red, int('b', 'a'), p)
    expect(r.match?.id).toBe(idMatch('a', 'b'))
    expect(r.match?.tipo).toBe('reciproco')
    expect(r.match?.vendeA.a).toEqual(['Capacitación y OTEC'])
    expect(r.match?.vendeA.b).toEqual(['Diseño gráfico y branding'])
    expect(r.red.conexiones[0]).toMatchObject({ estado: 'nueva', seguimientoEn: '2026-11-29T12:00:00.000Z' })
  })
  it('cambiar de opinión ("me interesa" → "ahora no") reemplaza el interés y no duplica el match', () => {
    let r = aplicarInteres(vacia, int('a', 'b'), p)
    r = aplicarInteres(r.red, int('a', 'b', 'ahora_no'), p)
    r = aplicarInteres(r.red, int('b', 'a'), p)
    expect(r.match).toBeUndefined()
    r = aplicarInteres(r.red, int('a', 'b'), p)
    expect(r.red.matches).toHaveLength(1)
    r = aplicarInteres(r.red, int('a', 'b'), p)
    expect(r.red.matches).toHaveLength(1)
    expect(r.match).toBeUndefined()
  })
  it('suma días en UTC', () => expect(sumarDias('2026-11-25T00:00:00.000Z', 10)).toBe('2026-12-05T00:00:00.000Z'))
})

describe('mensaje de WhatsApp', () => {
  it('incluye el intercambio y las palancas elegidas', () => {
    const m = mensajeSugerido({ yo: 'Trekan', otra: 'Mdi360', intercambio: 'Tú le ofreces Capacitación ⇄ Te ofrece Diseño gráfico', palancas: ['compra_de_prueba', 'referidos_cruzados'] })
    expect(m).toContain('Soy de Trekan')
    expect(m).toContain('Capacitación ⇄ Te ofrece Diseño gráfico')
    expect(m).toContain('compra de prueba')
    expect(m).toContain('presentarnos a nuestros clientes')
  })
  it('usa el esquema whatsapp:// y deja solo dígitos en el teléfono', () => {
    const u = enlaceWhatsApp('+56 9 0000 0012', 'Hola & chao')
    expect(u).toBe('whatsapp://send?phone=56900000012&text=Hola%20%26%20chao')
  })
})
