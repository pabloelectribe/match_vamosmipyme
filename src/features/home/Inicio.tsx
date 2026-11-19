import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store'
import { Encabezado } from '../../ui/Marco'
import { Chip, Icono, Progreso } from '../../ui/kit'
import { TarjetaEmpresa } from '../../ui/TarjetaEmpresa'
import { EditorBusca, EditorOfrece } from './Editores'

export function Inicio() {
  const { yo, perfilYo, calces, mazo, estado, completitudYo, reputacion } = useStore()
  const [editando, setEditando] = useState<'busca' | 'ofrece' | null>(null)
  if (!yo || !perfilYo || !calces) return null
  const busquedas = estado.busquedas.filter((b) => b.empresaId === yo.id)

  return (
    <>
      <Encabezado titulo={`Hola, ${yo.nombre.split(' ')[0]}`} subtitulo="¿Qué estás buscando hoy?" />
      <main className="flex-1 space-y-4 overflow-y-auto px-4 pb-6 pt-4">
        <section className="tarjeta p-4" aria-label="Tus listas">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px]">Busco</h2>
            <button className="btn btn-suave min-h-[44px] px-3 text-[15px]" onClick={() => setEditando('busca')}>
              <Icono n="editar" className="h-4 w-4" /> Editar
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {busquedas.map((b) => (
              <Chip key={b.rubro} activo>
                {b.rubro}
                {b.urgencia === 'este_mes' ? ' · este mes' : ''}
              </Chip>
            ))}
            {!busquedas.length && <p className="text-gris-medio">Cuéntanos qué necesitas comprar.</p>}
          </div>
          {busquedas.filter((b) => b.nota).map((b) => (
            <p key={b.rubro} className="mt-2 text-[14px] italic text-gris-medio">“{b.nota}”</p>
          ))}
          <div className="my-4 h-px bg-gris-borde" />
          <div className="flex items-center justify-between">
            <h2 className="text-[18px]">Ofrezco</h2>
            <button className="btn btn-suave min-h-[44px] px-3 text-[15px]" onClick={() => setEditando('ofrece')}>
              <Icono n="editar" className="h-4 w-4" /> Editar
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {perfilYo.ofrece.map((r) => <Chip key={r}>{r}</Chip>)}
            {!perfilYo.ofrece.length && <p className="text-gris-medio">Agrega lo que vendes a otras empresas.</p>}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3" aria-label="Resumen de calces" aria-live="polite">
          <div className="tarjeta p-4">
            <p className="text-[34px] font-bold leading-none text-azul">{calces.buscanLoQueOfreces}</p>
            <p className="mt-1 text-[14px] leading-snug text-gris">empresas buscan lo que ofreces</p>
          </div>
          <div className="tarjeta p-4">
            <p className="text-[34px] font-bold leading-none text-naranjo-texto">{calces.ofrecenLoQueBuscas}</p>
            <p className="mt-1 text-[14px] leading-snug text-gris">ofrecen lo que buscas</p>
          </div>
        </section>

        {completitudYo < 100 && (
          <Link to="/perfil" className="tarjeta block p-4">
            <div className="flex items-center justify-between text-[15px]">
              <span className="font-medium text-tinta">Tu perfil está al {completitudYo}%</span>
              <span className="text-azul">Completar</span>
            </div>
            <Progreso valor={completitudYo} className="mt-2" />
          </Link>
        )}

        <section aria-label="Recomendadas">
          <div className="mb-2 flex items-end justify-between px-1">
            <h2 className="text-[20px]">Recomendadas para ti</h2>
            <Link to="/descubrir" className="min-h-[44px] py-3 text-[15px] font-medium text-azul">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {mazo.slice(0, 3).map(({ perfil, afinidad }) => {
              const e = estado.empresas.find((x) => x.id === perfil.id)!
              const rep = reputacion(e.id)
              return <TarjetaEmpresa key={e.id} empresa={e} ofrece={perfil.ofrece} busca={perfil.busca.map((b) => b.rubro)} afinidad={afinidad} nota={rep.nota} nEval={rep.n} compacta />
            })}
            {!mazo.length && <p className="tarjeta p-4 text-gris-medio">Aún no hay empresas que calcen. Prueba agregar otro rubro a tus listas.</p>}
          </div>
        </section>
      </main>
      <EditorBusca abierta={editando === 'busca'} onCerrar={() => setEditando(null)} />
      <EditorOfrece abierta={editando === 'ofrece'} onCerrar={() => setEditando(null)} />
    </>
  )
}
