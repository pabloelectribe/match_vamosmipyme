import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { useStore } from '../../store'
import { REGIONES, regionCorta } from '../../data/seed'
import { Encabezado } from '../../ui/Marco'
import { Chip, Hoja, Icono } from '../../ui/kit'
import { TarjetaEmpresa } from '../../ui/TarjetaEmpresa'
import type { Recomendacion } from '../../domain/afinidad'
import type { TipoInteres } from '../../domain/types'

type Filtro = 'todos' | 'ofrecen' | 'buscan' | 'reciprocos'
const FILTROS: { id: Filtro; t: string }[] = [
  { id: 'todos', t: 'Todas' },
  { id: 'ofrecen', t: 'Me ofrecen lo que busco' },
  { id: 'buscan', t: 'Buscan lo que ofrezco' },
  { id: 'reciprocos', t: 'Recíprocos' },
]
const UMBRAL = 110

const SALIDAS: Record<TipoInteres, { x: number; y: number; rotate: number }> = {
  me_interesa: { x: 520, y: 0, rotate: 18 },
  ahora_no: { x: -520, y: 0, rotate: -18 },
  guardar: { x: 0, y: -620, rotate: 0 },
}

function CartaArrastrable({ r, onDecidir, salirRef }: { r: Recomendacion; onDecidir: (t: TipoInteres) => void; salirRef: MutableRefObject<((t: TipoInteres) => void) | null> }) {
  const { estado, reputacion } = useStore()
  const reducir = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-10, 10])
  const opSi = useTransform(x, [30, UMBRAL], [0, 1])
  const opNo = useTransform(x, [-UMBRAL, -30], [1, 0])
  const opGuardar = useTransform(y, [-UMBRAL, -30], [1, 0])
  const [saliendo, setSaliendo] = useState(false)
  const e = estado.empresas.find((z) => z.id === r.perfil.id)!
  const rep = reputacion(e.id)

  const salir = async (t: TipoInteres) => {
    if (saliendo) return
    setSaliendo(true)
    const s = SALIDAS[t]
    if (!reducir) await Promise.all([animate(x, s.x, { duration: 0.28 }), animate(y, s.y, { duration: 0.28 })])
    onDecidir(t)
  }
  // los botones y el teclado llaman a esta misma salida
  salirRef.current = salir
  useEffect(() => {
    const h = (ev: KeyboardEvent) => {
      if ((ev.target as HTMLElement)?.closest('input,textarea,select,[role=dialog]')) return
      if (ev.key === 'ArrowRight') salir('me_interesa')
      if (ev.key === 'ArrowLeft') salir('ahora_no')
      if (ev.key === 'ArrowUp') salir('guardar')
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  })

  return (
    <motion.div
      className="absolute inset-x-0 top-0 cursor-grab touch-none active:cursor-grabbing"
      style={{ x, y, rotate }}
      drag
      dragSnapToOrigin
      dragElastic={0.9}
      onDragEnd={(_, i) => {
        if (i.offset.x > UMBRAL) salir('me_interesa')
        else if (i.offset.x < -UMBRAL) salir('ahora_no')
        else if (i.offset.y < -UMBRAL) salir('guardar')
      }}
    >
      <TarjetaEmpresa empresa={e} ofrece={r.perfil.ofrece} busca={r.perfil.busca.map((b) => b.rubro)} afinidad={r.afinidad} nota={rep.nota} nEval={rep.n} maxChips={2} />
      <motion.span style={{ opacity: opSi }} className="pointer-events-none absolute right-5 top-16 rotate-12 rounded-xl border-4 border-azul bg-white/90 px-3 py-1 text-[22px] font-bold text-azul">ME INTERESA</motion.span>
      <motion.span style={{ opacity: opNo }} className="pointer-events-none absolute left-5 top-16 -rotate-12 rounded-xl border-4 border-gris bg-white/90 px-3 py-1 text-[22px] font-bold text-gris">AHORA NO</motion.span>
      <motion.span style={{ opacity: opGuardar }} className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 rounded-xl border-4 border-naranjo-texto bg-white/90 px-3 py-1 text-[22px] font-bold text-naranjo-texto">GUARDAR</motion.span>
    </motion.div>
  )
}

export function Descubrir() {
  const { mazo, yaDecididas, guardadas, estado, decidir, reputacion } = useStore()
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [region, setRegion] = useState('')
  const [verGuardadas, setVerGuardadas] = useState(false)
  const salirRef = useRef<((t: TipoInteres) => void) | null>(null)

  const cartas = useMemo(
    () =>
      mazo.filter(({ perfil, afinidad }) => {
        if (yaDecididas.has(perfil.id)) return false
        if (region && perfil.region !== region) return false
        if (filtro === 'reciprocos') return afinidad.tipo === 'reciproco'
        if (filtro === 'ofrecen') return afinidad.ofreceLoQueBuscas.length > 0
        if (filtro === 'buscan') return afinidad.buscaLoQueOfreces.length > 0
        return true
      }),
    [mazo, yaDecididas, filtro, region],
  )
  const actual = cartas[0]
  const siguiente = cartas[1]

  const pulsar = (t: TipoInteres) => salirRef.current?.(t)

  return (
    <>
      <Encabezado
        compacto
        titulo="Descubrir"
        subtitulo={cartas.length ? `${cartas.length} ${cartas.length === 1 ? 'empresa' : 'empresas'} por ver` : undefined}
        derecha={
          <button className="btn btn-suave min-h-[44px] px-3 text-[15px]" onClick={() => setVerGuardadas(true)} aria-label={`Guardadas (${guardadas.length})`}>
            Guardadas · {guardadas.length}
          </button>
        }
      />
      <div className="border-b border-gris-borde bg-white px-4 pb-3">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filtros">
          {FILTROS.map((f) => (
            <span key={f.id} className="shrink-0"><Chip activo={filtro === f.id} onClick={() => setFiltro(f.id)}>{f.t}</Chip></span>
          ))}
          <label className="sr-only" htmlFor="reg">Región</label>
          <select id="reg" className="min-h-[44px] shrink-0 rounded-full border-2 border-gris-borde bg-white px-3 text-[14px]" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">Todas las regiones</option>
            {REGIONES.map((r) => <option key={r} value={r}>{regionCorta(r)}</option>)}
          </select>
        </div>
      </div>

      <main className="relative flex-1 overflow-hidden px-4 pt-4" aria-live="polite">
        {actual ? (
          <div className="relative">
            {siguiente && (
              <div className="pointer-events-none absolute inset-x-0 top-0 scale-[.96] opacity-70" aria-hidden="true">
                <TarjetaEmpresa empresa={estado.empresas.find((z) => z.id === siguiente.perfil.id)!} ofrece={siguiente.perfil.ofrece} busca={siguiente.perfil.busca.map((b) => b.rubro)} afinidad={siguiente.afinidad} nEval={reputacion(siguiente.perfil.id).n} maxChips={2} />
              </div>
            )}
            <div className="relative h-[470px]">
              <CartaArrastrable key={actual.perfil.id} r={actual} onDecidir={(t) => decidir(actual.perfil.id, t)} salirRef={salirRef} />
            </div>
          </div>
        ) : (
          <div className="tarjeta mt-6 p-6 text-center">
            <h2 className="text-[22px]">Por hoy, listo</h2>
            <p className="mt-2 text-gris">No quedan empresas con este filtro. Actualiza lo que buscas u ofreces para ver más recomendaciones.</p>
            {(filtro !== 'todos' || region) && <button className="btn btn-secundario mt-4" onClick={() => { setFiltro('todos'); setRegion('') }}>Quitar filtros</button>}
          </div>
        )}
      </main>

      {actual && (
        <div className="flex items-start justify-center gap-5 border-t border-gris-borde bg-white px-4 pb-3 pt-3">
          {([
            ['ahora_no', 'Ahora no', 'cerrar', 'bg-gris-claro text-gris'],
            ['guardar', 'Guardar', 'mas', 'bg-naranjo-suave text-naranjo-tinta'],
            ['me_interesa', 'Me interesa', 'check', 'bg-naranjo text-tinta'],
          ] as const).map(([t, etq, ic, cls]) => (
            <button key={t} onClick={() => pulsar(t)} className="flex flex-col items-center gap-1 text-[13px] font-medium text-tinta">
              <span className={`flex h-14 w-14 items-center justify-center rounded-full ${cls}`}><Icono n={ic} className="h-7 w-7" /></span>
              {etq}
            </button>
          ))}
        </div>
      )}

      <Hoja abierta={verGuardadas} titulo="Guardadas" onCerrar={() => setVerGuardadas(false)}>
        {!guardadas.length && <p className="text-gris-medio">Aún no guardas empresas. Desliza hacia arriba o toca “Guardar”.</p>}
        <ul className="space-y-2">
          {guardadas.map((id) => {
            const e = estado.empresas.find((z) => z.id === id)!
            return (
              <li key={id} className="flex items-center gap-3 rounded-2xl bg-gris-claro p-3">
                <span className="min-w-0 flex-1"><span className="block truncate font-medium text-tinta">{e.nombre}</span><span className="block text-[14px] text-gris-medio">{e.comuna}</span></span>
                <button className="btn btn-primario min-h-[44px] px-4 text-[15px]" onClick={() => decidir(id, 'me_interesa')}>Me interesa</button>
              </li>
            )
          })}
        </ul>
      </Hoja>
    </>
  )
}
