import { describe, expect, it } from 'vitest'
import { calcularAfinidad, contarCalces, pesoCalce, recomendar, textoIntercambio } from './afinidad'
import type { PerfilAfinidad } from './types'

const RM = 'Metropolitana de Santiago'
const perfil = (id: string, o: Partial<PerfilAfinidad> = {}): PerfilAfinidad => ({
  id, region: RM, ofrece: [], busca: [], necesidades: [], completitud: 50, nEvaluaciones: 0, ...o,
})
const b = (rubro: string, urgencia: 'este_mes' | 'sin_apuro' = 'sin_apuro') => ({ rubro, urgencia })

describe('pesoCalce', () => {
  it('exacto = 1, familia de prevención = 0.5, resto = 0', () => {
    expect(pesoCalce('Ciberseguridad', 'Ciberseguridad')).toBe(1)
    expect(pesoCalce('Prevención de riesgos', 'Prevención de riesgos (DS44)')).toBe(0.5)
    expect(pesoCalce('Ciberseguridad', 'Outsourcing')).toBe(0)
  })
})

describe('calcularAfinidad', () => {
  const yo = perfil('yo', { ofrece: ['Capacitación y OTEC'], busca: [b('Diseño gráfico y branding')] })

  it('sin calce → score 0 y tipo null', () => {
    const otra = perfil('x', { ofrece: ['Outsourcing'], busca: [b('Ciberseguridad')] })
    const af = calcularAfinidad(yo, otra)
    expect(af.score).toBe(0)
    expect(af.tipo).toBeNull()
  })

  it('recíproco exacto: base 60 + misma región 8 = 68', () => {
    const otra = perfil('x', { ofrece: ['Diseño gráfico y branding'], busca: [b('Capacitación y OTEC')] })
    const af = calcularAfinidad(yo, otra)
    expect(af.tipo).toBe('reciproco')
    expect(af.score).toBe(68)
  })

  it('simple: me vende lo que busco (35) o me compra lo que vendo (30)', () => {
    const vende = perfil('v', { region: 'De Coquimbo', ofrece: ['Diseño gráfico y branding'] })
    const compra = perfil('c', { region: 'De Coquimbo', busca: [b('Capacitación y OTEC')] })
    expect(calcularAfinidad(yo, vende)).toMatchObject({ tipo: 'ofrece_lo_que_buscas', score: 35 })
    expect(calcularAfinidad(yo, compra)).toMatchObject({ tipo: 'busca_lo_que_ofreces', score: 30 })
  })

  it('recíproco siempre supera a simple a igualdad de bonus', () => {
    const recip = perfil('r', { ofrece: ['Diseño gráfico y branding'], busca: [b('Capacitación y OTEC')] })
    const simple = perfil('s', { ofrece: ['Diseño gráfico y branding'] })
    expect(calcularAfinidad(yo, recip).score).toBeGreaterThan(calcularAfinidad(yo, simple).score)
  })

  it('calce parcial (familia) vale menos que el exacto', () => {
    const a = perfil('a', { busca: [b('Prevención de riesgos')] })
    const exacto = perfil('e', { ofrece: ['Prevención de riesgos'] })
    const parcial = perfil('p', { ofrece: ['Prevención de riesgos (DS44)'] })
    expect(calcularAfinidad(a, parcial).score).toBeLessThan(calcularAfinidad(a, exacto).score)
    expect(calcularAfinidad(a, parcial).tipo).toBe('ofrece_lo_que_buscas')
  })

  it('urgencia suma 5 por búsqueda urgente que calza (máx. 10)', () => {
    const a = perfil('a', { busca: [b('Ciberseguridad', 'este_mes'), b('Outsourcing', 'este_mes'), b('Servicios cloud', 'este_mes')] })
    const otra = perfil('o', { ofrece: ['Ciberseguridad', 'Outsourcing', 'Servicios cloud'] })
    expect(calcularAfinidad(a, otra).desglose.urgencia).toBe(10)
  })

  it('cobertura: calces adicionales suman 8 cada uno, tope 16 por lado', () => {
    const a = perfil('a', { busca: [b('Ciberseguridad'), b('Outsourcing'), b('Servicios cloud'), b('Gestión documental')] })
    const otra = perfil('o', { ofrece: ['Ciberseguridad', 'Outsourcing', 'Servicios cloud', 'Gestión documental'] })
    expect(calcularAfinidad(a, otra).desglose.cobertura).toBe(16)
  })

  it('una necesidad publicada cuenta como búsqueda y da +10', () => {
    const otra = perfil('n', { necesidades: ['Capacitación y OTEC'] })
    const af = calcularAfinidad(yo, otra)
    expect(af.tipo).toBe('busca_lo_que_ofreces')
    expect(af.buscaLoQueOfreces[0].viaNecesidad).toBe(true)
    expect(af.desglose.necesidad).toBe(10)
  })

  it('no duplica si el rubro está en busca y también como necesidad', () => {
    const otra = perfil('n', { busca: [b('Capacitación y OTEC')], necesidades: ['Capacitación y OTEC'] })
    const af = calcularAfinidad(yo, otra)
    expect(af.buscaLoQueOfreces).toHaveLength(1)
    expect(af.buscaLoQueOfreces[0].viaNecesidad).toBe(true)
  })

  it('bonus de nota solo con ≥3 evaluaciones y nota ≥5,5', () => {
    const base = { ofrece: ['Diseño gráfico y branding'] }
    expect(calcularAfinidad(yo, perfil('a', { ...base, nota: 7, nEvaluaciones: 2 })).desglose.nota).toBe(0)
    expect(calcularAfinidad(yo, perfil('b', { ...base, nota: 5, nEvaluaciones: 5 })).desglose.nota).toBe(0)
    expect(calcularAfinidad(yo, perfil('c', { ...base, nota: 6, nEvaluaciones: 3 })).desglose.nota).toBe(4)
  })

  it('bonus por perfil completo y tope de 100', () => {
    const a = perfil('a', {
      busca: [b('Ciberseguridad', 'este_mes'), b('Outsourcing', 'este_mes'), b('Servicios cloud', 'este_mes')],
      ofrece: ['Capacitación y OTEC', 'Diseño gráfico y branding', 'Gestión documental'],
    })
    const otra = perfil('o', {
      ofrece: ['Ciberseguridad', 'Outsourcing', 'Servicios cloud'],
      busca: [b('Capacitación y OTEC'), b('Diseño gráfico y branding'), b('Gestión documental')],
      necesidades: ['Capacitación y OTEC'], completitud: 100, nota: 7, nEvaluaciones: 9,
    })
    expect(calcularAfinidad(a, otra).score).toBe(100)
  })

  it('genera motivos y el texto de intercambio', () => {
    const otra = perfil('x', { ofrece: ['Diseño gráfico y branding'], busca: [b('Capacitación y OTEC')] })
    const af = calcularAfinidad(yo, otra)
    expect(af.motivos).toEqual([
      'Busca Capacitación y OTEC, que tú ofreces',
      'Ofrece Diseño gráfico y branding, que tú buscas',
    ])
    expect(textoIntercambio(af)).toBe('Tú le ofreces Capacitación y OTEC ⇄ Te ofrece Diseño gráfico y branding')
  })

  it('una empresa no calza consigo misma', () => {
    expect(calcularAfinidad(yo, yo).tipo).toBeNull()
  })
})

describe('recomendar', () => {
  const yo = perfil('yo', { ofrece: ['Capacitación y OTEC'], busca: [b('Diseño gráfico y branding')] })
  const reciproca = perfil('rec', { region: 'De Coquimbo', ofrece: ['Diseño gráfico y branding'], busca: [b('Capacitación y OTEC')] })
  const simpleMisma = perfil('sim', { ofrece: ['Diseño gráfico y branding'], completitud: 100, nota: 7, nEvaluaciones: 5 })
  const compra = perfil('com', { busca: [b('Capacitación y OTEC')] })
  const nada = perfil('nada', { ofrece: ['Outsourcing'] })
  const todas = [simpleMisma, nada, compra, reciproca]

  it('pone primero al recíproco aunque otra tenga más bonus; excluye sin calce', () => {
    const r = recomendar(yo, todas)
    expect(r.map((x) => x.perfil.id)).toEqual(['rec', 'sim', 'com'])
  })
  it('filtra por tipo y región', () => {
    expect(recomendar(yo, todas, { filtro: 'ofrecen' }).map((x) => x.perfil.id)).toEqual(['rec', 'sim'])
    expect(recomendar(yo, todas, { filtro: 'buscan' }).map((x) => x.perfil.id)).toEqual(['rec', 'com'])
    expect(recomendar(yo, todas, { filtro: 'reciprocos' }).map((x) => x.perfil.id)).toEqual(['rec'])
    expect(recomendar(yo, todas, { region: 'De Coquimbo' }).map((x) => x.perfil.id)).toEqual(['rec'])
  })
  it('respeta exclusiones', () => {
    expect(recomendar(yo, todas, { excluir: new Set(['rec']) }).map((x) => x.perfil.id)).toEqual(['sim', 'com'])
  })
  it('cuenta calces para el onboarding', () => {
    expect(contarCalces(yo, todas)).toEqual({ buscanLoQueOfreces: 2, ofrecenLoQueBuscas: 2, reciprocas: 1 })
  })
})
