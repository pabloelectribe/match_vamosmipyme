import { useState } from 'react'
import { useStore } from '../../store'
import { Encabezado } from '../../ui/Marco'
import { Hoja, Logo } from '../../ui/kit'
import { PanelContacto } from '../match/PanelContacto'

/** Versión inicial: lista de matches con su contacto. La etapa 4 agrega estados, seguimiento y evaluaciones. */
export function Conexiones() {
  const { yo, estado, misMatches } = useStore()
  const [abierta, setAbierta] = useState<string | null>(null)
  const match = misMatches.find((m) => m.id === abierta)
  return (
    <>
      <Encabezado titulo="Mis conexiones" subtitulo="Empresas con las que hubo match" />
      <main className="flex-1 space-y-3 overflow-y-auto px-4 pb-6 pt-4">
        {!misMatches.length && <p className="tarjeta p-5 text-gris">Todavía no tienes matches. Cuando una empresa y tú marquen “Me interesa”, aparecen aquí con sus datos de contacto.</p>}
        {misMatches.map((m) => {
          const o = estado.empresas.find((e) => e.id === m.empresas.find((id) => id !== yo?.id))!
          return (
            <button key={m.id} onClick={() => setAbierta(m.id)} className="tarjeta flex w-full items-center gap-3 p-4 text-left">
              <Logo empresa={o} size={48} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[18px] font-bold text-tinta">{o.nombre}</span>
                <span className="block text-[14px] text-gris-medio">{m.tipo === 'reciproco' ? 'Se necesitan mutuamente' : 'Match'}</span>
              </span>
              <span className="rounded-full bg-azul-suave px-3 py-1 text-[13px] font-medium text-azul">Nueva</span>
            </button>
          )
        })}
      </main>
      <Hoja abierta={!!match} titulo="Contacto" onCerrar={() => setAbierta(null)}>
        {match && <PanelContacto match={match} />}
      </Hoja>
    </>
  )
}
