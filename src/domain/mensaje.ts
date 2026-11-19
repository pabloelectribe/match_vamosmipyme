import type { PalancaColaboracion } from './types'

export const PALANCAS: Record<PalancaColaboracion, { titulo: string; frase: string }> = {
  compra_de_prueba: { titulo: 'Compra de prueba', frase: 'Podemos partir con una compra de prueba.' },
  precio_frecuente: { titulo: 'Precio de cliente frecuente', frase: 'Podemos acordar un precio de cliente frecuente.' },
  prioridad: { titulo: 'Prioridad en plazos y atención', frase: 'Podemos darnos prioridad en plazos y atención.' },
  plazo_de_pago: { titulo: 'Plazo o formato de pago', frase: 'Estoy abierto a conversar el plazo o formato de pago.' },
  referidos_cruzados: { titulo: 'Referidos cruzados', frase: 'Podemos presentarnos a nuestros clientes.' },
  co_marketing: { titulo: 'Difusión conjunta', frase: 'Podemos hacer algo juntos de difusión.' },
}
export const MAX_PALANCAS = 2

export function mensajeSugerido(o: { yo: string; otra: string; intercambio: string; palancas: PalancaColaboracion[] }): string {
  const partes = [
    `Hola, equipo de ${o.otra}. Soy de ${o.yo}. Nos conectó Match B2B de Vamos MiPYME.`,
    o.intercambio ? `Lo que nos calza: ${o.intercambio}.` : '',
    ...o.palancas.map((p) => PALANCAS[p].frase),
    '¿Conversamos esta semana?',
  ]
  return partes.filter(Boolean).join(' ')
}

/** Los enlaces wa.me y api.whatsapp.com fallan en iframes de Safari; el esquema nativo no. */
export function enlaceWhatsApp(telefono: string, texto: string): string {
  return `whatsapp://send?phone=${telefono.replace(/\D/g, '')}&text=${encodeURIComponent(texto)}`
}
