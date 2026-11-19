import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { formatearRut, limpiarRut } from '../../domain/rut'
import { Cinta, Icono } from '../../ui/kit'

const DEMO = [
  { id: 'trekan', t: 'Trekan', d: 'Software y capacitación · Las Condes' },
  { id: 'mdi', t: 'Mdi360', d: 'Agencia digital · Quilicura' },
  { id: 'newen', t: 'Newen Digital', d: 'Marketing · Temuco' },
]

export function Ingreso() {
  const { ingresar, entrarComo } = useStore()
  const nav = useNavigate()
  const [rut, setRut] = useState('')
  const [error, setError] = useState('')
  const [fase, setFase] = useState<'form' | 'validando' | 'ok'>('form')

  const enviar = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFase('validando')
    // Validación simulada de cliente BancoEstado (en producción: API de validación de RUT).
    window.setTimeout(() => {
      const r = ingresar(rut)
      if (!r.ok) {
        setError(r.error)
        setFase('form')
        return
      }
      setFase('ok')
      window.setTimeout(() => nav(r.nueva ? '/onboarding' : '/', { replace: true }), 900)
    }, 700)
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-white">
      <Cinta />
      <div className="flex flex-1 flex-col px-6 pb-8 pt-10">
        <p className="text-[14px] font-medium uppercase tracking-wide text-azul">Vamos MiPYME · BancoEstado</p>
        <h1 className="mt-3 text-[34px] leading-[1.05]">Dinos qué buscas y qué ofreces.</h1>
        <p className="mt-3 text-[18px] leading-snug text-gris">Te conectamos con las empresas que calzan contigo. Solo si ambas quieren, se comparten los datos.</p>

        <form onSubmit={enviar} className="mt-8" noValidate>
          <label htmlFor="rut" className="mb-2 block text-[15px] font-medium text-tinta">RUT de tu empresa</label>
          <input id="rut" inputMode="text" autoComplete="off" className="campo text-[20px] tracking-wide" placeholder="76.123.456-7" value={rut} onChange={(e) => setRut(limpiarRut(e.target.value).length > 1 ? formatearRut(e.target.value) : e.target.value)} aria-invalid={!!error} aria-describedby="rut-ayuda" />
          <p id="rut-ayuda" role={error ? 'alert' : undefined} className={`mt-2 text-[14px] ${error ? 'font-medium text-red-700' : 'text-gris-medio'}`}>
            {error || 'Solo para clientes BancoEstado. Es una validación de ejemplo: sirve cualquier RUT con dígito verificador correcto.'}
          </p>
          <button className="btn btn-primario mt-5 w-full" disabled={fase !== 'form' || limpiarRut(rut).length < 8}>
            {fase === 'validando' ? 'Validando con BancoEstado…' : fase === 'ok' ? 'Cliente validado' : 'Validar y entrar'}
            {fase === 'ok' && <Icono n="check" className="h-5 w-5" />}
          </button>
        </form>

        <div className="mt-auto pt-10">
          <p className="etiqueta mb-2">Modo demo · entrar como empresa de ejemplo</p>
          <ul className="space-y-2">
            {DEMO.map((d) => (
              <li key={d.id}>
                <button className="flex min-h-[56px] w-full items-center justify-between rounded-2xl bg-gris-claro px-4 py-2 text-left hover:bg-gris-borde" onClick={() => { entrarComo(d.id); nav('/', { replace: true }) }}>
                  <span>
                    <span className="block font-medium text-tinta">{d.t}</span>
                    <span className="block text-[14px] text-gris-medio">{d.d}</span>
                  </span>
                  <Icono n="flecha" className="h-5 w-5 text-azul" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
