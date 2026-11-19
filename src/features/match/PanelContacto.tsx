import { useMemo, useState } from 'react'
import { useStore } from '../../store'
import { Chip, Icono } from '../../ui/kit'
import { MAX_PALANCAS, PALANCAS, enlaceWhatsApp, mensajeSugerido } from '../../domain/mensaje'
import type { Match, PalancaColaboracion } from '../../domain/types'

/** Solo se muestra después del match: datos de contacto, propuesta de colaboración y WhatsApp. */
export function PanelContacto({ match }: { match: Match }) {
  const { yo, estado, guardarPropuesta } = useStore()
  const otraId = match.empresas.find((id) => id !== yo?.id)!
  const otra = estado.empresas.find((e) => e.id === otraId)!
  const previa = estado.propuestas.find((p) => p.matchId === match.id && p.de === yo?.id)
  const [palancas, setPalancas] = useState<PalancaColaboracion[]>(previa?.palancas ?? [])
  const [copiado, setCopiado] = useState(false)

  const intercambio = useMemo(() => {
    const tuOfreces = match.vendeA[yo!.id] ?? []
    const teOfrece = match.vendeA[otraId] ?? []
    const u = (xs: string[]) => (xs.length <= 1 ? xs[0] ?? '' : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`)
    if (tuOfreces.length && teOfrece.length) return `Tú le ofreces ${u(tuOfreces)} ⇄ Te ofrece ${u(teOfrece)}`
    if (teOfrece.length) return `Te ofrece ${u(teOfrece)}`
    if (tuOfreces.length) return `Tú le ofreces ${u(tuOfreces)}`
    return ''
  }, [match, yo, otraId])

  const sugerido = useMemo(() => mensajeSugerido({ yo: yo!.nombre, otra: otra.nombre, intercambio: intercambio.replace('Tú le ofreces', 'Yo les ofrezco').replace('⇄ Te ofrece', '⇄ ustedes me ofrecen').replace(/^Te ofrece/, 'Ustedes me ofrecen'), palancas }), [yo, otra, intercambio, palancas])
  const [texto, setTexto] = useState<string | null>(null)
  const mensaje = texto ?? sugerido

  const alternar = (p: PalancaColaboracion) => {
    const nuevas = palancas.includes(p) ? palancas.filter((x) => x !== p) : palancas.length < MAX_PALANCAS ? [...palancas, p] : palancas
    setPalancas(nuevas)
    setTexto(null)
    guardarPropuesta(match.id, nuevas)
  }
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(mensaje)
      setCopiado(true)
      window.setTimeout(() => setCopiado(false), 2000)
    } catch {
      /* sin portapapeles: el usuario puede copiar el texto a mano */
    }
  }

  return (
    <div className="space-y-4">
      {intercambio && <p className="rounded-2xl bg-naranjo-suave px-4 py-3 text-[15px] font-medium text-naranjo-tinta">{intercambio}</p>}

      <section aria-label="Datos de contacto" className="rounded-2xl bg-gris-claro p-4">
        <p className="etiqueta mb-2">Contacto de {otra.nombre}</p>
        <p className="text-[16px] text-tinta">{otra.telefono}</p>
        <p className="text-[16px] text-tinta">{otra.correo}</p>
        {otra.ficticia && <p className="mt-1 text-[13px] text-gris-medio">Empresa y datos ficticios (demostración).</p>}
      </section>

      <section aria-label="Propuesta de colaboración">
        <h3 className="text-[17px]">¿Cómo podrían beneficiarse?</h3>
        <p className="mb-2 mt-1 text-[14px] text-gris">Elige hasta {MAX_PALANCAS}. No es un canje: cada empresa vende y factura a su propio precio.</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PALANCAS) as PalancaColaboracion[]).map((p) => (
            <Chip key={p} activo={palancas.includes(p)} onClick={() => alternar(p)}>
              {PALANCAS[p].titulo}
            </Chip>
          ))}
        </div>
      </section>

      <section aria-label="Mensaje">
        <label htmlFor="msg" className="mb-1 block text-[15px] font-medium text-tinta">Mensaje para WhatsApp (puedes editarlo)</label>
        <textarea id="msg" rows={6} className="campo py-3 text-[15px]" value={mensaje} onChange={(e) => setTexto(e.target.value)} />
        <div className="mt-3 grid gap-2">
          <a className="btn btn-primario w-full" href={enlaceWhatsApp(otra.telefono, mensaje)}>
            <Icono n="flecha" className="h-5 w-5" /> Escribir por WhatsApp
          </a>
          <button type="button" className="btn btn-secundario w-full" onClick={copiar}>
            {copiado ? 'Mensaje copiado' : 'Copiar mensaje'}
          </button>
        </div>
      </section>
      <p className="text-[13px] leading-snug text-gris-medio">Cada empresa factura por separado. Ante dudas tributarias, consulta a tu contador.</p>
    </div>
  )
}
