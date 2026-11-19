import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useStore } from './store'
import { BarraInferior, Telefono } from './ui/Marco'
import { Pronto } from './ui/Pronto'
import { Ingreso } from './features/auth/Ingreso'
import { Onboarding } from './features/onboarding/Onboarding'
import { Inicio } from './features/home/Inicio'
import { Perfil } from './features/perfil/Perfil'
import { Descubrir } from './features/descubrir/Descubrir'
import { Conexiones } from './features/conexiones/Conexiones'
import { MatchCelebracion } from './features/match/MatchCelebracion'

function Protegida({ children }: { children: ReactNode }) {
  const { yo, estado } = useStore()
  if (!yo) return <Navigate to="/ingreso" replace />
  if (!estado.onboardingCompleto.includes(yo.id)) return <Navigate to="/onboarding" replace />
  return (
    <>
      {children}
      <BarraInferior />
      <MatchCelebracion />
    </>
  )
}

export function App() {
  return (
    <Routes>
      <Route path="/admin" element={<div className="p-10 text-gris">Panel de administración: llega en la etapa 6.</div>} />
      <Route
        path="*"
        element={
          <Telefono>
            <Routes>
              <Route path="/ingreso" element={<Ingreso />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/" element={<Protegida><Inicio /></Protegida>} />
              <Route path="/descubrir" element={<Protegida><Descubrir /></Protegida>} />
              <Route path="/conexiones" element={<Protegida><Conexiones /></Protegida>} />
              <Route path="/radar" element={<Protegida><Pronto titulo="Radar de rubros" etapa={6} /></Protegida>} />
              <Route path="/perfil" element={<Protegida><Perfil /></Protegida>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Telefono>
        }
      />
    </Routes>
  )
}
