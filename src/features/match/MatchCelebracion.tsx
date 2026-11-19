import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { Cinta, Logo } from '../../ui/kit'
import { PanelContacto } from './PanelContacto'

/** Pantalla breve de celebración + contacto. Aparece apenas hay interés mutuo. */
export function MatchCelebracion() {
  const { matchPendienteCelebrar: m, yo, estado, marcarCelebrado } = useStore()
  const nav = useNavigate()
  const reducir = useReducedMotion()
  const [verContacto, setVerContacto] = useState(false)
  useEffect(() => setVerContacto(false), [m?.id])
  if (!m || !yo) return null
  const otra = estado.empresas.find((e) => e.id === m.empresas.find((id) => id !== yo.id))!

  return (
    <div role="dialog" aria-modal="true" aria-label="¡Hay match!" className="absolute inset-0 z-50 flex flex-col overflow-y-auto bg-white">
      <Cinta />
      <div className="flex flex-1 flex-col px-6 pb-8 pt-8">
        <motion.div initial={reducir ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="text-[14px] font-medium uppercase tracking-wide text-azul">Match</p>
          <h1 className="mt-1 text-[34px] leading-tight">¡Se encontraron!</h1>
          <p className="mt-1 text-[16px] text-gris">Las dos quieren conversar. Ya puedes ver sus datos.</p>
        </motion.div>

        <div className="relative my-8 flex items-center justify-center gap-0" aria-hidden="true">
          <motion.div initial={reducir ? false : { x: -90, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 16 }}>
            <Logo empresa={yo} size={92} />
          </motion.div>
          <motion.div initial={reducir ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.35, type: 'spring', stiffness: 260, damping: 14 }} className="z-10 -mx-3 flex h-12 w-12 items-center justify-center rounded-full bg-naranjo text-[22px] font-bold text-tinta ring-4 ring-white">
            ⇄
          </motion.div>
          <motion.div initial={reducir ? false : { x: 90, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 16 }}>
            <Logo empresa={otra} size={92} />
          </motion.div>
        </div>
        <p className="text-center text-[20px] font-bold text-tinta">{otra.nombre}</p>
        <p className="text-center text-[15px] text-gris-medio">{otra.comuna}</p>

        {verContacto ? (
          <div className="mt-6"><PanelContacto match={m} /></div>
        ) : (
          <button className="btn btn-primario mt-8 w-full" onClick={() => setVerContacto(true)}>Ver contacto y escribir</button>
        )}

        <div className="mt-auto grid gap-2 pt-8">
          <button className="btn btn-suave w-full" onClick={() => { marcarCelebrado(m.id); nav('/conexiones') }}>Ir a mis conexiones</button>
          <button className="btn btn-suave w-full" onClick={() => marcarCelebrado(m.id)}>Seguir descubriendo</button>
        </div>
      </div>
    </div>
  )
}
