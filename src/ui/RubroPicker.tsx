import { useMemo, useState } from 'react'
import { CATALOGO_RUBROS } from '../data/seed'
import { MAX_POR_LISTA } from '../store'
import { Chip, Icono } from './kit'
import type { Rubro } from '../domain/types'

const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Buscador de rubros del catálogo oficial, máximo 4 por lista. */
export function RubroPicker({ seleccion, onCambiar, pista }: {
  seleccion: Rubro[]
  onCambiar: (r: Rubro[]) => void
  /** Texto auxiliar por rubro (p. ej. "9 lo buscan"). */
  pista?: (r: Rubro) => string | undefined
}) {
  const [q, setQ] = useState('')
  const lleno = seleccion.length >= MAX_POR_LISTA
  const lista = useMemo(() => {
    const t = sinTildes(q.trim())
    return CATALOGO_RUBROS.filter((r) => !t || sinTildes(r).includes(t))
  }, [q])

  const alternar = (r: Rubro) => {
    if (seleccion.includes(r)) onCambiar(seleccion.filter((x) => x !== r))
    else if (!lleno) onCambiar([...seleccion, r])
  }

  return (
    <div>
      <div className="relative">
        <Icono n="buscar" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gris-medio" />
        <input className="campo pl-11" placeholder="Busca un rubro (ej. diseño, bodega)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar rubro" />
      </div>
      <p className="mt-2 text-[14px] text-gris-medio" aria-live="polite">
        {seleccion.length} de {MAX_POR_LISTA} elegidos{lleno ? ' · quita uno para cambiar' : ''}
      </p>
      <ul className="mt-2 divide-y divide-gris-borde">
        {lista.map((r) => {
          const on = seleccion.includes(r)
          const bloqueado = !on && lleno
          return (
            <li key={r}>
              <button type="button" disabled={bloqueado} onClick={() => alternar(r)} aria-pressed={on} className="flex min-h-[48px] w-full items-center gap-3 py-2 text-left disabled:opacity-40">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 ${on ? 'border-azul bg-azul text-white' : 'border-gris-borde'}`}>
                  {on && <Icono n="check" className="h-4 w-4" />}
                </span>
                <span className="flex-1 text-[16px] leading-tight text-tinta">{r}</span>
                {pista?.(r) && <span className="shrink-0 text-[13px] text-gris-medio">{pista(r)}</span>}
              </button>
            </li>
          )
        })}
        {!lista.length && <li className="py-6 text-center text-gris-medio">No encontramos ese rubro. Prueba con otra palabra.</li>}
      </ul>
    </div>
  )
}

export function SeleccionChips({ rubros, onQuitar }: { rubros: Rubro[]; onQuitar: (r: Rubro) => void }) {
  if (!rubros.length) return null
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {rubros.map((r) => (
        <Chip key={r} activo onQuitar={() => onQuitar(r)}>
          {r}
        </Chip>
      ))}
    </div>
  )
}
