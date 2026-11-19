import { regionCorta } from '../data/seed'
import { Chip, Logo, SelloValidado } from './kit'
import type { Afinidad } from '../domain/afinidad'
import type { Empresa, Rubro } from '../domain/types'

const ETIQUETA = {
  reciproco: 'Se necesitan mutuamente',
  ofrece_lo_que_buscas: 'Te ofrece lo que buscas',
  busca_lo_que_ofreces: 'Busca lo que ofreces',
} as const

function Columna({ titulo, rubros, encendidos, max = 3 }: { titulo: string; rubros: Rubro[]; encendidos: Set<Rubro>; max?: number }) {
  // primero los que coinciden
  const orden = [...rubros].sort((a, b) => Number(encendidos.has(b)) - Number(encendidos.has(a)))
  const visibles = orden.slice(0, max)
  return (
    <div className="min-w-0 flex-1">
      <p className="etiqueta mb-1.5">{titulo}</p>
      <div className="flex flex-col items-start gap-1.5">
        {visibles.map((r) => (
          <Chip key={r} encendido={encendidos.has(r)}>
            {r}
          </Chip>
        ))}
        {rubros.length > max && <span className="text-[13px] text-gris-medio">+{rubros.length - max} más</span>}
      </div>
    </div>
  )
}

/** Tarjeta de empresa con "Busca" y "Ofrece" siempre a la vista y coincidencias encendidas. */
export function TarjetaEmpresa({ empresa, ofrece, busca, afinidad, nota, nEval, compacta, maxChips = 3 }: {
  empresa: Empresa
  ofrece: Rubro[]
  busca: Rubro[]
  afinidad?: Afinidad
  nota?: number
  nEval: number
  compacta?: boolean
  maxChips?: number
}) {
  // Lo que ella ofrece y yo busco / lo que ella busca y yo ofrezco
  const lucesOfrece = new Set(afinidad?.ofreceLoQueBuscas.map((c) => c.ofrece))
  const lucesBusca = new Set(afinidad?.buscaLoQueOfreces.map((c) => c.busca))
  return (
    <article className="tarjeta p-4">
      {afinidad?.tipo && (
        <p className={`mb-3 inline-flex items-center rounded-full px-3 py-1 text-[13px] font-bold ${afinidad.tipo === 'reciproco' ? 'bg-naranjo text-tinta' : 'bg-azul-suave text-azul'}`}>
          {ETIQUETA[afinidad.tipo]}
        </p>
      )}
      <div className="flex items-center gap-3">
        <Logo empresa={empresa} size={compacta ? 44 : 52} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[18px] leading-tight">{empresa.nombre}</h3>
          <p className="truncate text-[14px] text-gris-medio">
            {empresa.comuna}, {regionCorta(empresa.region)}
          </p>
        </div>
        {afinidad && <span className="rounded-xl bg-gris-claro px-2 py-1 text-[13px] font-medium" title="Afinidad">{afinidad.score}%</span>}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-gris-medio">
        {empresa.validadaBE && <SelloValidado />}
        <span>{nEval >= 3 && nota !== undefined ? `Nota ${nota.toFixed(1).replace('.', ',')} · ${nEval} evaluaciones` : 'Nueva en Match B2B'}</span>
      </div>
      <div className="mt-4 flex gap-3">
        <Columna titulo="Busca" rubros={busca} encendidos={lucesBusca} max={maxChips} />
        <Columna titulo="Ofrece" rubros={ofrece} encendidos={lucesOfrece} max={maxChips} />
      </div>
      {afinidad && afinidad.motivos.length > 0 && (
        <p className="mt-3 line-clamp-3 rounded-2xl bg-gris-claro px-3 py-2 text-[14px] leading-snug text-gris">
          <span className="font-medium text-tinta">Por qué la ves: </span>
          {afinidad.motivos.slice(0, 2).join(' · ')}
        </p>
      )}
    </article>
  )
}
