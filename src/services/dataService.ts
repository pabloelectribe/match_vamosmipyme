/**
 * Capa de datos. Hoy persiste en localStorage; mañana se puede reemplazar por
 * un backend (p. ej. Supabase) sin tocar la interfaz: solo cambia este archivo.
 */
import { cargarSemilla } from '../data/seed'
import type { Estado } from '../domain/perfil'

export interface AppState extends Estado {
  sesion: { empresaId: string | null }
  /** Empresas que ya terminaron el onboarding (las de la semilla vienen completas). */
  onboardingCompleto: string[]
}

const CLAVE = 'matchb2b:v1'

export function estadoInicial(): AppState {
  const s = cargarSemilla()
  return { ...s, sesion: { empresaId: null }, onboardingCompleto: s.empresas.map((e) => e.id) }
}

export const dataService = {
  cargar(): AppState {
    try {
      const raw = localStorage.getItem(CLAVE)
      if (raw) return JSON.parse(raw) as AppState
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
