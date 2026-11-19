/**
 * Capa de datos. Hoy persiste en localStorage; mañana se puede reemplazar por
 * un backend (p. ej. Supabase) sin tocar la interfaz: solo cambia este archivo.
 */
import { cargarSemilla } from '../data/seed'
import type { Estado } from '../domain/perfil'
import type { Conexion, Interes, Match, Propuesta } from '../domain/types'

export interface AppState extends Estado {
  sesion: { empresaId: string | null }
  /** Empresas que ya terminaron el onboarding (las de la semilla vienen completas). */
  onboardingCompleto: string[]
  intereses: Interes[]
  matches: Match[]
  conexiones: Conexion[]
  propuestas: Propuesta[]
  /** Modo demo: la otra empresa responde "Me interesa" a los pocos segundos. */
  demo: { simularRespuesta: boolean }
}

const CLAVE = 'matchb2b:v2'

export function estadoInicial(): AppState {
  const s = cargarSemilla()
  return {
    ...s,
    sesion: { empresaId: null },
    onboardingCompleto: s.empresas.map((e) => e.id),
    intereses: [], matches: [], conexiones: [], propuestas: [],
    demo: { simularRespuesta: true },
  }
}

export const dataService = {
  cargar(): AppState {
    try {
      const raw = localStorage.getItem(CLAVE)
      if (raw) return { ...estadoInicial(), ...(JSON.parse(raw) as Partial<AppState>) }
    } catch {
      /* sin almacenamiento o dato corrupto: parte de cero */
    }
    return estadoInicial()
  },
  guardar(estado: AppState): void {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(estado))
    } catch {
      /* modo privado o cuota llena: la app sigue en memoria */
    }
  },
  reiniciar(): AppState {
    try {
      localStorage.removeItem(CLAVE)
    } catch {
      /* nada */
    }
    return estadoInicial()
  },
}
