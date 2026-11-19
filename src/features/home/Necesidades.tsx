import { useState } from 'react'
import { useStore } from '../../store'
import { Chip, Hoja, Logo } from '../../ui/kit'
import { RubroPicker } from '../../ui/RubroPicker'
import type { Rubro } from '../../domain/types'

export function PublicarNecesidad({ abierta, onCerrar }: { abierta: boolean; onCerrar: () => void }) {
  const { publicarNecesidad, conteoOferta } = useStore()
  const [rubro, setRubro] = useState<Rubro[]>([])
  const [texto, setTexto] = useState('')
  const cerrar = () => { setRubro([]); setTexto(''); onCerrar() }
  return (
    <Hoja abierta={abierta} titulo="Publicar una necesidad" onCerrar={cerrar}>
      <p className="mb-3 text-[15px] text-gris">Las empresas que ofrecen ese rubro la ven destacada y pueden responderte.</p>
      <label htmlFor="nec" className="mb-1 block text-[15px] font-medium text-tinta">¿Qué necesitas?</label>
      <input id="nec" className="campo mb-4" maxLength={90} placeholder="Ej. Busco arriendo de bodega en Maipú" value={texto} onChange={(e) => setTexto(e.target.value)} />
      <p className="mb-1 text-[15px] font-medium text-tinta">Rubro</p>
      <RubroPicker seleccion={rubro} onCambiar={(r) => setRubro(r.slice(-1))} pista={(r) => { const n = conteoOferta.get(r); return n ? `${n} lo ofrecen` : 'nadie aún' }} />
      <button className="btn btn-primario mt-5 w-full" disabled={!rubro.length || texto.trim().length < 5} onClick={() => { publicarNecesidad(rubro[0], texto); cerrar() }}>Publicar</button>
    </Hoja>
  )
}

/** "Te necesitan": necesidades de otras empresas que calzan con lo que ofreces. */
export function TeNecesitan() {
  const { necesidadesParaMi, estado, decidir } = useStore()
  if (!necesidadesParaMi.length) return null
  return (
    <section aria-label="Te necesitan">
      <h2 className="mb-2 px-1 text-[20px]">Te necesitan</h2>
      <div className="space-y-3">
        {necesidadesParaMi.map((n) => {
          const e = estado.empresas.find((x) => x.id === n.empresaId)!
          return (
            <article key={n.id} className="tarjeta border-2 border-naranjo p-4">
              <div className="flex items-center gap-3">
                <Logo empresa={e} size={44} />
                <div className="min-w-0"><p className="truncate font-bold text-tinta">{e.nombre}</p><p className="text-[14px] text-gris-medio">{e.comuna}</p></div>
              </div>
              <p className="mt-3 text-[17px] leading-snug text-tinta">“{n.texto}”</p>
              <div className="mt-2"><Chip encendido>{n.rubro}</Chip></div>
              <button className="btn btn-primario mt-3 w-full" onClick={() => decidir(n.empresaId, 'me_interesa', { necesidadId: n.id })}>Yo te lo ofrezco</button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export function MisNecesidades() {
  const { estado, yo, resolverNecesidad } = useStore()
  const mias = estado.necesidades.filter((n) => n.empresaId === yo?.id && n.estado === 'abierta')
  if (!mias.length) return null
  return (
    <section className="tarjeta p-4" aria-label="Mis necesidades publicadas">
      <h2 className="text-[18px]">Mis necesidades publicadas</h2>
      <ul className="mt-2 space-y-2">
        {mias.map((n) => (
          <li key={n.id} className="flex items-center gap-2">
            <span className="min-w-0 flex-1 text-[15px] text-tinta">“{n.texto}”</span>
            <button className="min-h-[44px] shrink-0 px-2 text-[14px] font-medium text-azul" onClick={() => resolverNecesidad(n.id)}>Ya resuelta</button>
          </li>
        ))}
      </ul>
    </section>
  )
}
