import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { dataService, type AppState } from './services/dataService'
import { armarPerfil, armarPerfiles, calcularCompletitud, reputacionDe } from './domain/perfil'
import { contarCalces, recomendar } from './domain/afinidad'
import { formatearRut, limpiarRut, validarRut } from './domain/rut'
import type { Busqueda, Empresa, Rubro, Urgencia } from './domain/types'

export const MAX_POR_LISTA = 4

interface Store {
  estado: AppState
  yo: Empresa | null
  /** Valida el RUT (simulado) y abre sesión. `nueva` = hay que hacer onboarding. */
  ingresar(rut: string): { ok: true; nueva: boolean } | { ok: false; error: string }
  entrarComo(id: string): void
  salir(): void
  reiniciarDemo(): void
  actualizarEmpresa(patch: Partial<Empresa>): void
  setOfrece(rubros: Rubro[]): void
  setBusca(items: { rubro: Rubro; urgencia?: Urgencia; nota?: string }[]): void
  terminarOnboarding(): void
  // derivados
  perfilYo: ReturnType<typeof armarPerfil> | null
  completitudYo: number
  calces: ReturnType<typeof contarCalces> | null
  mazo: ReturnType<typeof recomendar>
  reputacion: (id: string) => { nota?: number; n: number }
  conteoDemanda: Map<Rubro, number>
  conteoOferta: Map<Rubro, number>
}

const Ctx = createContext<Store | null>(null)
export const useStore = () => {
  const s = useContext(Ctx)
  if (!s) throw new Error('StoreProvider ausente')
  return s
}

const ahora = () => new Date().toISOString()

export function StoreProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<AppState>(() => dataService.cargar())
  useEffect(() => dataService.guardar(estado), [estado])

  const yo = useMemo(() => estado.empresas.find((e) => e.id === estado.sesion.empresaId) ?? null, [estado])
  const idYo = yo?.id ?? null

  const mutar = useCallback((f: (e: AppState) => AppState) => setEstado((e) => f(e)), [])

  const ingresar: Store['ingresar'] = (rut) => {
    if (!validarRut(rut)) return { ok: false, error: 'Revisa el RUT: el dígito verificador no calza.' }
    const limpio = limpiarRut(rut)
    const existente = estado.empresas.find((e) => limpiarRut(e.rut) === limpio)
    if (existente) {
      mutar((s) => ({ ...s, sesion: { empresaId: existente.id } }))
      return { ok: true, nueva: !estado.onboardingCompleto.includes(existente.id) }
    }
    const id = `emp-${limpio}`
    const nueva: Empresa = {
      id, rut: formatearRut(rut), nombre: '', region: 'Metropolitana de Santiago', comuna: '', resena: '',
      canales: ['digital'], telefono: '+56 9 0000 0000', correo: `contacto@${id}.ejemplo.cl`,
      ficticia: false, validadaBE: true, creadaEn: ahora(),
    }
    mutar((s) => ({ ...s, empresas: [...s.empresas, nueva], sesion: { empresaId: id } }))
    return { ok: true, nueva: true }
  }

  const entrarComo = (id: string) => mutar((s) => ({ ...s, sesion: { empresaId: id } }))
  const salir = () => mutar((s) => ({ ...s, sesion: { empresaId: null } }))
  const reiniciarDemo = () => setEstado(dataService.reiniciar())

  const actualizarEmpresa = (patch: Partial<Empresa>) => {
    if (!idYo) return
    mutar((s) => ({ ...s, empresas: s.empresas.map((e) => (e.id === idYo ? { ...e, ...patch } : e)) }))
  }

  const setOfrece = (rubros: Rubro[]) => {
    if (!idYo) return
    mutar((s) => ({
      ...s,
      ofertas: [...s.ofertas.filter((o) => o.empresaId !== idYo), ...rubros.map((rubro) => ({ empresaId: idYo, rubro }))],
    }))
  }

  const setBusca: Store['setBusca'] = (items) => {
    if (!idYo) return
    mutar((s) => {
      const previas = new Map(s.busquedas.filter((b) => b.empresaId === idYo).map((b) => [b.rubro, b]))
      const nuevas: Busqueda[] = items.map((it) => ({
        empresaId: idYo,
        rubro: it.rubro,
        urgencia: it.urgencia ?? previas.get(it.rubro)?.urgencia ?? 'sin_apuro',
        nota: it.nota !== undefined ? it.nota : previas.get(it.rubro)?.nota,
      }))
      return { ...s, busquedas: [...s.busquedas.filter((b) => b.empresaId !== idYo), ...nuevas] }
    })
  }

  const terminarOnboarding = () => {
    if (!idYo) return
    mutar((s) => ({ ...s, onboardingCompleto: [...new Set([...s.onboardingCompleto, idYo])] }))
  }

  const perfiles = useMemo(() => armarPerfiles(estado), [estado])
  const perfilYo = useMemo(() => (idYo ? perfiles.find((p) => p.id === idYo) ?? null : null), [perfiles, idYo])
  const otras = useMemo(() => perfiles.filter((p) => p.id !== idYo), [perfiles, idYo])
  const calces = useMemo(() => (perfilYo ? contarCalces(perfilYo, otras) : null), [perfilYo, otras])
  const mazo = useMemo(() => (perfilYo ? recomendar(perfilYo, otras) : []), [perfilYo, otras])
  const completitudYo = yo ? calcularCompletitud(yo, perfilYo?.ofrece.length ?? 0, perfilYo?.busca.length ?? 0) : 0

  const conteoDemanda = useMemo(() => {
    const m = new Map<Rubro, number>()
    for (const b of estado.busquedas) if (b.empresaId !== idYo) m.set(b.rubro, (m.get(b.rubro) ?? 0) + 1)
    return m
  }, [estado.busquedas, idYo])
  const conteoOferta = useMemo(() => {
    const m = new Map<Rubro, number>()
    for (const o of estado.ofertas) if (o.empresaId !== idYo) m.set(o.rubro, (m.get(o.rubro) ?? 0) + 1)
    return m
  }, [estado.ofertas, idYo])

  const value: Store = {
    estado, yo, ingresar, entrarComo, salir, reiniciarDemo, actualizarEmpresa, setOfrece, setBusca, terminarOnboarding,
    perfilYo, completitudYo, calces, mazo,
    reputacion: (id) => reputacionDe(id, estado.evaluaciones),
    conteoDemanda, conteoOferta,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
