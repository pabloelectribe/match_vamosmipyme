import { useStore, MAX_POR_LISTA } from '../../store'
import { Hoja } from '../../ui/kit'
import { RubroPicker } from '../../ui/RubroPicker'

export function EditorOfrece({ abierta, onCerrar }: { abierta: boolean; onCerrar: () => void }) {
  const { perfilYo, setOfrece, conteoDemanda } = useStore()
  return (
    <Hoja abierta={abierta} titulo="Qué ofreces" onCerrar={onCerrar}>
      <p className="mb-3 text-[15px] text-gris">Los cambios se aplican al tiro: tus recomendaciones se recalculan.</p>
      <RubroPicker seleccion={perfilYo?.ofrece ?? []} onCambiar={setOfrece} pista={(r) => { const n = conteoDemanda.get(r); return n ? `${n} lo buscan` : undefined }} />
      <button className="btn btn-primario mt-5 w-full" onClick={onCerrar}>Listo</button>
    </Hoja>
  )
}

export function EditorBusca({ abierta, onCerrar }: { abierta: boolean; onCerrar: () => void }) {
  const { estado, yo, setBusca, conteoOferta } = useStore()
  const mias = estado.busquedas.filter((b) => b.empresaId === yo?.id)
  const items = mias.map((b) => ({ rubro: b.rubro, urgencia: b.urgencia, nota: b.nota }))
  const cambiar = (rubro: string, patch: Partial<(typeof items)[number]>) =>
    setBusca(items.map((i) => (i.rubro === rubro ? { ...i, ...patch } : i)))
  return (
    <Hoja abierta={abierta} titulo="Qué buscas hoy" onCerrar={onCerrar}>
      <p className="mb-3 text-[15px] text-gris">Marca lo urgente y deja una nota corta: la ven quienes pueden ayudarte.</p>
      <ul className="space-y-3">
        {mias.map((b) => (
          <li key={b.rubro} className="rounded-2xl bg-gris-claro p-3">
            <p className="font-medium text-tinta">{b.rubro}</p>
            <label className="mt-1 flex min-h-[44px] items-center gap-3 text-[15px]">
              <input type="checkbox" className="h-5 w-5 accent-[#004dff]" checked={b.urgencia === 'este_mes'} onChange={(e) => cambiar(b.rubro, { urgencia: e.target.checked ? 'este_mes' : 'sin_apuro' })} />
              Lo necesito este mes
            </label>
            <input className="campo mt-1 min-h-[44px] text-[15px]" placeholder="Nota corta (ej. Busco imprenta para 500 cajas)" maxLength={80} value={b.nota ?? ''} onChange={(e) => cambiar(b.rubro, { nota: e.target.value })} aria-label={`Nota para ${b.rubro}`} />
          </li>
        ))}
        {!mias.length && <li className="text-gris-medio">Aún no buscas nada. Agrega hasta {MAX_POR_LISTA} rubros abajo.</li>}
      </ul>
      <h3 className="mb-2 mt-5 text-[17px]">Agregar rubros</h3>
      <RubroPicker seleccion={items.map((i) => i.rubro)} onCambiar={(rs) => setBusca(rs.map((r) => items.find((i) => i.rubro === r) ?? { rubro: r }))} pista={(r) => { const n = conteoOferta.get(r); return n ? `${n} lo ofrecen` : 'nadie aún' }} />
      <button className="btn btn-primario mt-5 w-full" onClick={onCerrar}>Listo</button>
    </Hoja>
  )
}
