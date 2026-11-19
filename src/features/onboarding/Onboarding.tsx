import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { REGIONES } from '../../data/seed'
import { RubroPicker, SeleccionChips } from '../../ui/RubroPicker'
import { Cinta, Logo, SelloValidado } from '../../ui/kit'
import type { Rubro } from '../../domain/types'

/** Reduce la imagen a 160 px para no llenar el almacenamiento local. */
function reducirImagen(file: File): Promise<string> {
  return new Promise((ok, mal) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const lado = 160
      const c = document.createElement('canvas')
      c.width = c.height = lado
      const ctx = c.getContext('2d')!
      const k = Math.max(lado / img.width, lado / img.height)
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, lado, lado)
      ctx.drawImage(img, (lado - img.width * k) / 2, (lado - img.height * k) / 2, img.width * k, img.height * k)
      URL.revokeObjectURL(url)
      ok(c.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => mal(new Error('No pudimos leer la imagen'))
    img.src = url
  })
}

export function Onboarding() {
  const { yo, actualizarEmpresa, setOfrece, setBusca, terminarOnboarding, calces, conteoDemanda, conteoOferta } = useStore()
  const nav = useNavigate()
  const [paso, setPaso] = useState(1)
  const [ofrece, setOf] = useState<Rubro[]>([])
  const [busca, setBu] = useState<Rubro[]>([])
  const [nombre, setNombre] = useState(yo?.nombre ?? '')
  const [region, setRegion] = useState(yo?.region ?? 'Metropolitana de Santiago')
  const [comuna, setComuna] = useState(yo?.comuna ?? '')
  const [logo, setLogo] = useState<string | undefined>(yo?.logo)
  const [fin, setFin] = useState(false)
  if (!yo) return null

  const terminar = () => {
    actualizarEmpresa({ nombre: nombre.trim(), region, comuna: comuna.trim(), logo, resena: `${nombre.trim()} ofrece ${ofrece[0].toLowerCase()} desde ${comuna.trim()}.` })
    setOfrece(ofrece)
    setBusca(busca.map((rubro) => ({ rubro })))
    terminarOnboarding()
    setFin(true)
  }

  if (fin && calces)
    return (
      <div className="flex h-full flex-col overflow-y-auto bg-white">
        <Cinta />
        <div className="flex flex-1 flex-col px-6 pb-8 pt-10">
          <SelloValidado />
          <h1 className="mt-4 text-[32px] leading-[1.08]">Ya estás en la red, {nombre.split(' ')[0]}.</h1>
          <p className="mt-2 text-[17px] text-gris">Esto es lo que encontramos hoy para ti:</p>
          <div className="mt-6 space-y-3">
            <div className="tarjeta flex items-center gap-4 p-5">
              <span className="text-[44px] font-bold leading-none text-azul">{calces.buscanLoQueOfreces}</span>
              <span className="text-[18px] leading-snug text-tinta">empresas buscan lo que ofreces</span>
            </div>
            <div className="tarjeta flex items-center gap-4 p-5">
              <span className="text-[44px] font-bold leading-none text-naranjo-texto">{calces.ofrecenLoQueBuscas}</span>
              <span className="text-[18px] leading-snug text-tinta">ofrecen lo que buscas</span>
            </div>
            {calces.reciprocas > 0 && (
              <p className="rounded-2xl bg-naranjo-suave px-4 py-3 text-[16px] text-naranjo-tinta">
                <b>{calces.reciprocas}</b> {calces.reciprocas === 1 ? 'se necesita' : 'se necesitan'} mutuamente contigo. Empieza por ahí.
              </p>
            )}
          </div>
          <button className="btn btn-primario mt-auto w-full" onClick={() => nav('/', { replace: true })}>Ver mis recomendaciones</button>
        </div>
      </div>
    )

  const puede = paso === 1 ? ofrece.length > 0 : paso === 2 ? busca.length > 0 : nombre.trim().length > 1 && comuna.trim().length > 1

  return (
    <div className="flex h-full flex-col bg-white">
      <Cinta />
      <div className="px-6 pt-5">
        <p className="text-[14px] font-medium text-gris-medio" aria-live="polite">Paso {paso} de 3</p>
        <div className="mt-2 flex gap-1.5" aria-hidden="true">
          {[1, 2, 3].map((n) => <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= paso ? 'bg-naranjo' : 'bg-gris-borde'}`} />)}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-4 pt-4">
        {paso === 1 && (
          <>
            <h1 className="text-[28px] leading-tight">¿Qué ofreces?</h1>
            <p className="mb-4 mt-1 text-[16px] text-gris">Lo que vendes a otras empresas. Elige hasta 4.</p>
            <SeleccionChips rubros={ofrece} onQuitar={(r) => setOf(ofrece.filter((x) => x !== r))} />
            <div className="mt-4"><RubroPicker seleccion={ofrece} onCambiar={setOf} pista={(r) => { const n = conteoDemanda.get(r); return n ? `${n} lo buscan` : undefined }} /></div>
          </>
        )}
        {paso === 2 && (
          <>
            <h1 className="text-[28px] leading-tight">¿Qué buscas?</h1>
            <p className="mb-4 mt-1 text-[16px] text-gris">Lo que necesitas comprar. Elige hasta 4.</p>
            <SeleccionChips rubros={busca} onQuitar={(r) => setBu(busca.filter((x) => x !== r))} />
            <div className="mt-4"><RubroPicker seleccion={busca} onCambiar={setBu} pista={(r) => { const n = conteoOferta.get(r); return n ? `${n} lo ofrecen` : 'nadie aún' }} /></div>
          </>
        )}
        {paso === 3 && (
          <>
            <h1 className="text-[28px] leading-tight">Tu empresa</h1>
            <p className="mb-5 mt-1 text-[16px] text-gris">Así te van a ver las demás.</p>
            <div className="mb-5 flex items-center gap-4">
              <Logo empresa={{ id: yo.id, nombre: nombre || 'Mi empresa', logo }} size={72} />
              <label className="btn btn-secundario cursor-pointer text-[15px]">
                {logo ? 'Cambiar logo' : 'Subir logo'}
                <input type="file" accept="image/*" className="sr-only" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setLogo(await reducirImagen(f).catch(() => undefined)) }} />
              </label>
            </div>
            <label className="mb-1 block text-[15px] font-medium text-tinta" htmlFor="nom">Nombre de tu empresa</label>
            <input id="nom" className="campo mb-4" value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="organization" />
            <label className="mb-1 block text-[15px] font-medium text-tinta" htmlFor="reg">Región</label>
            <select id="reg" className="campo mb-4" value={region} onChange={(e) => setRegion(e.target.value)}>
              {REGIONES.map((r) => <option key={r}>{r}</option>)}
            </select>
            <label className="mb-1 block text-[15px] font-medium text-tinta" htmlFor="com">Comuna</label>
            <input id="com" className="campo" value={comuna} onChange={(e) => setComuna(e.target.value)} />
          </>
        )}
      </div>
      <div className="flex gap-3 border-t border-gris-borde bg-white px-6 py-4">
        {paso > 1 && <button className="btn btn-suave" onClick={() => setPaso(paso - 1)}>Atrás</button>}
        <button className="btn btn-primario flex-1" disabled={!puede} onClick={() => (paso < 3 ? setPaso(paso + 1) : terminar())}>
          {paso < 3 ? 'Siguiente' : 'Terminar'}
        </button>
      </div>
    </div>
  )
}
