/** Modelo de datos de Match B2B. Todo es serializable (localStorage / futuro backend). */

export type Rubro = string // valor del catálogo oficial (64 categorías)
export type Urgencia = 'este_mes' | 'sin_apuro'
export type ID = string

export interface Empresa {
  id: ID
  rut: string
  nombre: string
  region: string
  comuna: string
  logo?: string // data URL o undefined → se dibuja iniciales
  resena: string
  canales: ('digital' | 'presencial')[]
  ficha?: string // enlace a vamosmipyme.cl
  telefono: string // ficticio
  correo: string // ficticio
  ficticia: boolean
  validadaBE: boolean
  creadaEn: string // ISO
}

export interface Oferta {
  empresaId: ID
  rubro: Rubro
}

export interface Busqueda {
  empresaId: ID
  rubro: Rubro
  urgencia: Urgencia
  nota?: string // "Busco imprenta para 500 cajas"
}

export type EstadoNecesidad = 'abierta' | 'resuelta'

export interface NecesidadPublicada {
  id: ID
  empresaId: ID
  rubro: Rubro
  texto: string
  region: string
  comuna?: string
  estado: EstadoNecesidad
  creadaEn: string
}

export type TipoInteres = 'me_interesa' | 'ahora_no' | 'guardar'
export interface Interes {
  de: ID
  a: ID
  tipo: TipoInteres
  origen: 'mazo' | 'necesidad'
  necesidadId?: ID
  en: string
}

export type TipoMatch = 'reciproco' | 'ofrece_lo_que_buscas' | 'busca_lo_que_ofreces'
export interface Match {
  id: ID
  empresas: [ID, ID]
  tipo: TipoMatch
  /** Rubros que cada una le vende a la otra, para presentar el intercambio. */
  vendeA: Record<ID, Rubro[]>
  creadoEn: string
}

export type EstadoConexion =
  | 'nueva'
  | 'conversamos'
  | 'reunion'
  | 'cotizacion'
  | 'negocio_cerrado'

export interface Conexion {
  matchId: ID
  estado: EstadoConexion
  historial: { estado: EstadoConexion; en: string }[]
  seguimientoEn: string // creadoEn + 10 días
  seguimientoRespondido?: boolean
}

export type PalancaColaboracion =
  | 'compra_de_prueba'
  | 'precio_frecuente'
  | 'prioridad'
  | 'plazo_de_pago'
  | 'referidos_cruzados'
  | 'co_marketing'

/** Propuesta de colaboración: sin montos, sin trueque. */
export interface Propuesta {
  matchId: ID
  de: ID
  palancas: PalancaColaboracion[] // máx. 2
  nota?: string
  en: string
}

export type Atributo =
  | 'responde_rapido'
  | 'cumple_plazos'
  | 'buen_precio'
  | 'muy_profesional'
  | 'la_recomendaria'

export interface Evaluacion {
  matchId: ID
  de: ID
  a: ID
  nota: number // 1..7
  atributos: Atributo[] // máx. 3
  en: string
}

export interface Insignia {
  empresaId: ID
  codigo: string
  en: string
}

export interface EventoPuntos {
  empresaId: ID
  motivo: string
  puntos: number
  en: string
}

/**
 * Vista mínima que necesita el módulo de afinidad (puro).
 * Se arma a partir de Empresa + Ofertas + Búsquedas + Necesidades + Evaluaciones.
 */
export interface PerfilAfinidad {
  id: ID
  region: string
  ofrece: Rubro[]
  busca: { rubro: Rubro; urgencia: Urgencia }[]
  necesidades: Rubro[] // necesidades publicadas abiertas
  completitud: number // 0..100
  nota?: number // promedio 1..7
  nEvaluaciones: number
}
