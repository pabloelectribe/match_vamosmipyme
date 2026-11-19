import { describe, expect, it } from 'vitest'
import { calcularDv, formatearRut, validarRut } from './rut'

describe('RUT', () => {
  it('calcula el dígito verificador con módulo 11', () => {
    expect(calcularDv('76086428')).toBe('5')
    expect(calcularDv('11111111')).toBe('1')
    expect(calcularDv('12345678')).toBe('5')
    expect(calcularDv('10000013')).toBe('K')
  })
  it('acepta RUT válidos con distintos formatos', () => {
    expect(validarRut('76.086.428-5')).toBe(true)
    expect(validarRut('760864285')).toBe(true)
    expect(validarRut('12.345.678-5')).toBe(true)
    expect(validarRut('10.000.013-k')).toBe(true)
  })
  it('rechaza dígito incorrecto, largo inválido o texto', () => {
    expect(validarRut('76.086.428-4')).toBe(false)
    expect(validarRut('123')).toBe(false)
    expect(validarRut('')).toBe(false)
    expect(validarRut('abc.def.ghi-k')).toBe(false)
  })
  it('formatea con puntos y guion', () => {
    expect(formatearRut('760864285')).toBe('76.086.428-5')
    expect(formatearRut('10000013k')).toBe('10.000.013-K')
  })
})
