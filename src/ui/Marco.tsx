import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Cinta, Icono } from './kit'

/** Marco de teléfono en escritorio; pantalla completa en el celular. */
export function Telefono({ children }: { children: ReactNode }) {
  return (
    <div className="h-full md:flex md:items-center md:justify-center md:bg-gris-borde md:p-6">
      <div className="relative mx-auto flex h-full w-full flex-col overflow-hidden bg-gris-claro md:h-[844px] md:max-h-[calc(100vh-48px)] md:w-[390px] md:rounded-[44px] md:border-[10px] md:border-tinta md:shadow-2xl">
        {children}
      </div>
    </div>
  )
}

const TABS = [
  { to: '/', n: 'inicio', t: 'Inicio' },
  { to: '/descubrir', n: 'descubrir', t: 'Descubrir' },
  { to: '/conexiones', n: 'conexiones', t: 'Conexiones' },
  { to: '/radar', n: 'radar', t: 'Radar' },
  { to: '/perfil', n: 'perfil', t: 'Perfil' },
]

export function BarraInferior() {
  return (
    <nav aria-label="Principal" className="flex border-t border-gris-borde bg-white pb-[env(safe-area-inset-bottom)]">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.to === '/'} className={({ isActive }) => `flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[12px] ${isActive ? 'font-bold text-azul' : 'text-gris-medio'}`}>
          <Icono n={t.n} className="h-6 w-6" />
          {t.t}
        </NavLink>
      ))}
    </nav>
  )
}

export function Encabezado({ titulo, subtitulo, derecha, compacto }: { titulo: ReactNode; subtitulo?: ReactNode; derecha?: ReactNode; compacto?: boolean }) {
  return (
    <header className="bg-white">
      <Cinta />
      <div className={`flex items-start justify-between gap-3 px-5 ${compacto ? 'pb-2 pt-2' : 'pb-4 pt-4'}`}>
        <div>
          {!compacto && <p className="text-[13px] font-medium uppercase tracking-wide text-azul">Match B2B · Vamos MiPYME</p>}
          <h1 className={`${compacto ? '' : 'mt-1'} text-[24px] leading-tight`}>{titulo}</h1>
          {subtitulo && <p className="mt-1 text-[15px] text-gris-medio">{subtitulo}</p>}
        </div>
        {derecha}
      </div>
    </header>
  )
}
