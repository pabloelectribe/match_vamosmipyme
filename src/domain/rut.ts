/** Validación de RUT chileno (dígito verificador, módulo 11). */

export function limpiarRut(input: string): string {
  return input.replace(/[^0-9kK]/g, '').toUpperCase()
}

export function calcularDv(cuerpo: string): string {
  let suma = 0
  let factor = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * factor
    factor = factor === 7 ? 2 : factor + 1
  }
  const resto = 11 - (suma % 11)
  if (resto === 11) return '0'
  if (resto === 10) return 'K'
  return String(resto)
}

export function validarRut(input: string): boolean {
  const limpio = limpiarRut(input)
  if (limpio.length < 8 || limpio.length > 9) return false // 1.000.000-x en adelante
  const cuerpo = limpio.slice(0, -1)
  if (!/^\d+$/.test(cuerpo)) return false
  return calcularDv(cuerpo) === limpio.slice(-1)
}

/** 76.123.456-K */
export function formatearRut(input: string): string {
  const limpio = limpiarRut(input)
  if (limpio.length < 2) return limpio
  const cuerpo = limpio.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${cuerpo}-${limpio.slice(-1)}`
}
