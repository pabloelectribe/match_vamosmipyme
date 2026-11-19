import { useEffect, useRef, type ReactNode } from 'react'
import type { Empresa } from '../domain/types'

/** Cinta de marca BancoEstado: 2/3 naranjo + 1/3 azul. */
export function Cinta({ className = '' }: { className?: string }) {
  return (
    <div className={`flex h-1.5 w-full ${className}`} aria-hidden="true">
      <div className="w-2/3 bg-naranjo" />
      <div className="w-1/3 bg-azul" />
    </div>
  )
}

const ICONOS: Record<string, string> = {
  inicio: 'M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10',
  descubrir: 'M4 7.5h16v11H4zM7 4.5h10',
  conexiones: 'M9.5 14.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1M14.5 9.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1',
  radar: 'M12 3a9 9 0 1 0 9 9M12 7a5 5 0 1 0 5 5M12 12l6-6',
  perfil: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  mas: 'M12 5v14M5 12h14',
  cerrar: 'M6 6l12 12M18 6 6 18',
  editar: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  escudo: 'M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z',
  flecha: 'M5 12h14M13 6l6 6-6 6',
  buscar: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4',
  cambio: 'M7 8h12l-3-3M17 16H5l3 3',
}
export function Icono({ n, className = 'h-6 w-6' }: { n: keyof typeof ICONOS | string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={ICONOS[n]} />
    </svg>
  )
}

const iniciales = (n: string) =>
  n.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '·'
const TONOS = ['bg-azul-suave text-azul', 'bg-naranjo-suave text-naranjo-tinta', 'bg-gris-claro text-gris']
export function Logo({ empresa, size = 48 }: { empresa: Pick<Empresa, 'nombre' | 'logo' | 'id'>; size?: number }) {
  const tono = TONOS[[...empresa.id].reduce((s, c) => s + c.charCodeAt(0), 0) % TONOS.length]
  if (empresa.logo)
    return <img src={empresa.logo} alt={`Logo de ${empresa.nombre}`} width={size} height={size} className="shrink-0 rounded-2xl object-cover" style={{ width: size, height: size }} />
  return (
    <div role="img" aria-label={`Logo de ${empresa.nombre || 'tu empresa'}`} className={`flex shrink-0 items-center justify-center rounded-2xl font-bold ${tono}`} style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {iniciales(empresa.nombre)}
    </div>
  )
}

/** Chip de rubro. `encendido` = coincide con las listas de quien mira. */
export function Chip({ children, encendido, onQuitar, onClick, activo }: {
  children: ReactNode; encendido?: boolean; onQuitar?: () => void; onClick?: () => void; activo?: boolean
}) {
  const base = 'inline-flex min-h-[32px] items-center gap-1.5 rounded-full px-3 py-1 text-[14px] leading-tight'
  const estilo = encendido
    ? 'bg-naranjo-suave text-naranjo-tinta border-2 border-naranjo font-medium'
    : activo
      ? 'bg-azul-suave text-azul border-2 border-azul/40 font-medium'
      : 'bg-gris-claro text-gris border-2 border-transparent'
  const contenido = (
    <>
      {encendido && <Icono n="check" className="h-3.5 w-3.5 shrink-0" />}
      <span>{children}</span>
      {onQuitar && (
        <button type="button" onClick={onQuitar} aria-label={`Quitar ${typeof children === 'string' ? children : ''}`} className="-mr-1 flex h-6 w-6 items-center justify-center rounded-full hover:bg-black/10">
          <Icono n="cerrar" className="h-3.5 w-3.5" />
        </button>
      )}
    </>
  )
  if (onClick)
    return (
      <button type="button" onClick={onClick} aria-pressed={activo} className={`${base} ${estilo} min-h-[44px] text-left`}>
        {contenido}
      </button>
    )
  return <span className={`${base} ${estilo}`}>{contenido}</span>
}

export function SelloValidado() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-azul-suave px-2.5 py-1 text-[13px] font-medium text-azul">
      <Icono n="escudo" className="h-3.5 w-3.5" /> Cliente validado
    </span>
  )
}

export function Progreso({ valor, className = '' }: { valor: number; className?: string }) {
  return (
    <div className={`h-2.5 w-full overflow-hidden rounded-full bg-gris-borde ${className}`} role="progressbar" aria-valuenow={valor} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-naranjo transition-all duration-500" style={{ width: `${valor}%` }} />
    </div>
  )
}

/** Hoja inferior accesible (se cierra con Escape y con el botón). */
export function Hoja({ abierta, titulo, onCerrar, children }: { abierta: boolean; titulo: string; onCerrar: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!abierta) return
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', h)
    ref.current?.focus()
    return () => window.removeEventListener('keydown', h)
  }, [abierta, onCerrar])
  if (!abierta) return null
  return (
    <div className="absolute inset-0 z-40 flex items-end bg-tinta/50" onClick={onCerrar}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()} className="flex max-h-[88%] w-full flex-col rounded-t-3xl bg-white shadow-tarjeta">
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <h2 className="text-[20px]">{titulo}</h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="flex h-11 w-11 items-center justify-center rounded-full bg-gris-claro">
            <Icono n="cerrar" className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-6">{children}</div>
      </div>
    </div>
  )
}
