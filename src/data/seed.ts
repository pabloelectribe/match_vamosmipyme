import real from '../../seed-empresas.json'
import ficticias from '../../seed-ficticias.json'
import { calcularDv } from '../domain/rut'
import type { Atributo, Busqueda, Empresa, Evaluacion, NecesidadPublicada, Oferta } from '../domain/types'
import type { Estado } from '../domain/perfil'

interface Semilla {
  id: string
  nombre: string
  region: string
  comuna: string
  vende: string[]
  busca: string[]
  canales: string[]
  ficha: string
  ficticia?: boolean
}

export const CATALOGO_RUBROS: string[] = real.catalogo_rubros

/** Todas las regiones presentes en la semilla, ordenadas de norte a sur aproximado. */
export const REGIONES: string[] = [
  'De Arica y Parinacota', 'De Tarapacá', 'De Antofagasta', 'De Atacama', 'De Coquimbo', 'De Valparaíso',
  'Metropolitana de Santiago', "Del Libertador General Bernardo O'Higgins", 'Del Maule', 'De Ñuble',
  'Del Biobío', 'De La Araucanía', 'De Los Ríos', 'De Los Lagos', 'De Aysén', 'De Magallanes',
]

const hash = (s: string) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

const rutFicticio = (id: string) => {
  const cuerpo = String(76000000 + (hash(id) % 900000))
  return `${cuerpo}-${calcularDv(cuerpo)}`
}

const SEMILLA_FECHA = '2026-11-01T12:00:00.000Z'

export function cargarSemilla(): Estado {
  const todas = [...(real.empresas as Semilla[]), ...(ficticias as Semilla[])]
  const empresas: Empresa[] = []
  const ofertas: Oferta[] = []
  const busquedas: Busqueda[] = []

  todas.forEach((s, i) => {
    const ficticia = Boolean(s.ficticia)
    empresas.push({
      id: s.id,
      rut: rutFicticio(s.id),
      nombre: s.nombre,
      region: s.region,
      comuna: s.comuna,
      resena: `${s.nombre} ofrece ${s.vende[0].toLowerCase()} desde ${s.comuna}. Busca ${s.busca[0].toLowerCase()}.`,
      canales: s.canales as Empresa['canales'],
      ficha: s.ficha || undefined,
      telefono: `+56 9 0000 ${String(i).padStart(4, '0')}`,
      correo: `contacto@${s.id}.ejemplo.cl`,
      ficticia,
      validadaBE: true,
      creadaEn: SEMILLA_FECHA,
    })
    s.vende.forEach((rubro) => ofertas.push({ empresaId: s.id, rubro }))
    s.busca.forEach((rubro, j) =>
      busquedas.push({
        empresaId: s.id,
        rubro,
        urgencia: j === 0 && hash(s.id) % 3 === 0 ? 'este_mes' : 'sin_apuro',
      }),
    )
  })

  const necesidades: NecesidadPublicada[] = [
    { id: 'nec1', empresaId: 'mdi', rubro: 'Arriendo de oficinas, bodegas y cowork', texto: 'Busco arriendo de bodega en Quilicura o Maipú', region: 'Metropolitana de Santiago', comuna: 'Quilicura', estado: 'abierta', creadaEn: SEMILLA_FECHA },
    { id: 'nec2', empresaId: 'trekan', rubro: 'Diseño gráfico y branding', texto: 'Necesito rediseñar el packaging de una línea nueva', region: 'Metropolitana de Santiago', estado: 'abierta', creadaEn: SEMILLA_FECHA },
    { id: 'nec3', empresaId: 'stc', rubro: 'Prevención de riesgos, Seguridad y salud en obra', texto: 'Prevencionista para una obra de 3 meses', region: 'Metropolitana de Santiago', estado: 'abierta', creadaEn: SEMILLA_FECHA },
    { id: 'nec4', empresaId: 'sch', rubro: 'Gestión documental', texto: 'Digitalizar archivo de contratos', region: 'De Valparaíso', estado: 'abierta', creadaEn: SEMILLA_FECHA },
  ]

  // Evaluaciones sembradas: para ~1/3 de las empresas, 3 a 6 notas entre 5 y 7.
  const atributos: Atributo[] = ['responde_rapido', 'cumple_plazos', 'buen_precio', 'muy_profesional', 'la_recomendaria']
  const evaluaciones: Evaluacion[] = []
  empresas.forEach((e) => {
    const h = hash(e.id)
    if (h % 3 !== 0) return
    const n = 3 + (h % 4)
    for (let k = 0; k < n; k++) {
      const de = empresas[(h + k * 7 + 1) % empresas.length]
      if (de.id === e.id) continue
      evaluaciones.push({
        matchId: `seed-${e.id}-${k}`, de: de.id, a: e.id,
        nota: 5 + ((h >>> k) % 3), // 5, 6 o 7
        atributos: [atributos[(h + k) % 5], atributos[(h + k + 2) % 5]],
        en: SEMILLA_FECHA,
      })
    }
  })

  return { empresas, ofertas, busquedas, necesidades, evaluaciones }
}

/** "Metropolitana de Santiago" → "Metropolitana"; "De La Araucanía" → "Araucanía". */
export const regionCorta = (r: string) =>
  r.replace(/ de Santiago$/, '').replace(/^(De La|De Los|Del Libertador General Bernardo|De|Del|La)\s/, '')
