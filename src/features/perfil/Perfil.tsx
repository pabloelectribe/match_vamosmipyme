import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { Encabezado } from '../../ui/Marco'
import { Chip, Icono, Logo, Progreso, SelloValidado } from '../../ui/kit'
import { PESOS_COMPLETITUD } from '../../domain/perfil'
import { EditorBusca, EditorOfrece } from '../home/Editores'

export function Perfil() {
  const { yo, perfilYo, estado, completitudYo, reputacion, actualizarEmpresa, entrarComo, salir, reiniciarDemo, setSimularRespuesta } = useStore()
  const nav = useNavigate()
  const [editando, setEditando] = useState<'busca' | 'ofrece' | null>(null)
  if (!yo || !perfilYo) return null
  const rep = reputacion(yo.id)
  const busquedas = estado.busquedas.filter((b) => b.empresaId === yo.id)
  const faltan: string[] = []
  if (!perfilYo.ofrece.length) faltan.push(`Agrega lo que ofreces (+${PESOS_COMPLETITUD.ofrece}%)`)
  if (!perfilYo.busca.length) faltan.push(`Agrega lo que buscas (+${PESOS_COMPLETITUD.busca}%)`)
  if (yo.resena.trim().length < 20) faltan.push(`Escribe una reseña de tu empresa (+${PESOS_COMPLETITUD.resena}%)`)
  if (!yo.logo) faltan.push(`Sube tu logo (+${PESOS_COMPLETITUD.logo}%)`)

  return (
    <>
      <Encabezado titulo="Mi perfil" />
      <main className="flex-1 space-y-4 overflow-y-auto px-4 pb-6 pt-4">
        <section className="tarjeta p-4" aria-label="Ficha de tu empresa">
          <div className="flex gap-3">
            <div className="min-w-0 flex-1">
              <p className="etiqueta mb-1.5">Busca</p>
              <div className="flex flex-wrap gap-1.5">{busquedas.map((b) => <Chip key={b.rubro} activo>{b.rubro}</Chip>)}</div>
              <button className="mt-2 min-h-[44px] text-[15px] font-medium text-azul" onClick={() => setEditando('busca')}>Editar lo que busco</button>
            </div>
          </div>
          <div className="my-3 h-px bg-gris-borde" />
          <p className="etiqueta mb-1.5">Ofrece</p>
          <div className="flex flex-wrap gap-1.5">{perfilYo.ofrece.map((r) => <Chip key={r}>{r}</Chip>)}</div>
          <button className="mt-2 min-h-[44px] text-[15px] font-medium text-azul" onClick={() => setEditando('ofrece')}>Editar lo que ofrezco</button>
          <div className="my-3 h-px bg-gris-borde" />
          <div className="flex items-center gap-3">
            <Logo empresa={yo} size={56} />
            <div className="min-w-0">
              <h2 className="truncate text-[20px]">{yo.nombre}</h2>
              <p className="text-[14px] text-gris-medio">{yo.comuna}, {yo.region}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[14px] text-gris-medio">
            {yo.validadaBE && <SelloValidado />}
            <span>{rep.n >= 3 && rep.nota !== undefined ? `Nota ${rep.nota.toFixed(1).replace('.', ',')} · ${rep.n} evaluaciones` : 'Nueva en Match B2B'}</span>
          </div>
          <label htmlFor="res" className="mb-1 mt-4 block text-[15px] font-medium text-tinta">Reseña corta</label>
          <textarea id="res" rows={3} maxLength={200} className="campo py-3" value={yo.resena} onChange={(e) => actualizarEmpresa({ resena: e.target.value })} />
          {yo.ficha && <a href={yo.ficha} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-[44px] items-center gap-1 text-[15px] font-medium text-azul">Ver mi ficha en vamosmipyme.cl <Icono n="flecha" className="h-4 w-4" /></a>}
        </section>

        <section className="tarjeta p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px]">Perfil completo</h2>
            <span className="text-[20px] font-bold text-tinta">{completitudYo}%</span>
          </div>
          <Progreso valor={completitudYo} className="mt-2" />
          {faltan.length > 0 ? (
            <ul className="mt-3 space-y-1 text-[15px] text-gris">{faltan.map((f) => <li key={f}>• {f}</li>)}</ul>
          ) : <p className="mt-3 text-[15px] text-gris">Tu perfil está completo. Así tienes más visibilidad.</p>}
        </section>

        <section className="tarjeta p-4">
          <h2 className="text-[18px]">Modo demo</h2>
          <label htmlFor="ser" className="mb-1 mt-2 block text-[14px] text-gris-medio">Ver la app como otra empresa</label>
          <select id="ser" className="campo" value={yo.id} onChange={(e) => entrarComo(e.target.value)}>
            {estado.empresas.map((e) => <option key={e.id} value={e.id}>{e.nombre}{e.ficticia ? ' (ficticia)' : ''}</option>)}
          </select>
          <label className="mt-3 flex min-h-[44px] items-center gap-3 text-[15px]">
            <input type="checkbox" className="h-5 w-5 accent-[#004dff]" checked={estado.demo.simularRespuesta} onChange={(e) => setSimularRespuesta(e.target.checked)} />
            La otra empresa responde “Me interesa” a los pocos segundos
          </label>
          <div className="mt-3 flex gap-2">
            <button className="btn btn-suave flex-1 text-[15px]" onClick={() => { salir(); nav('/ingreso') }}>Salir</button>
            <button className="btn btn-suave flex-1 text-[15px]" onClick={() => { reiniciarDemo(); nav('/ingreso') }}>Reiniciar demo</button>
          </div>
        </section>
      </main>
      <EditorBusca abierta={editando === 'busca'} onCerrar={() => setEditando(null)} />
      <EditorOfrece abierta={editando === 'ofrece'} onCerrar={() => setEditando(null)} />
    </>
  )
}
