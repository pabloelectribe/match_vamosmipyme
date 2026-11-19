import { Encabezado } from './Marco'

export function Pronto({ titulo, etapa }: { titulo: string; etapa: number }) {
  return (
    <>
      <Encabezado titulo={titulo} />
      <main className="flex flex-1 items-center justify-center p-8 text-center text-gris-medio">
        <p>Esta pantalla llega en la etapa {etapa} del prototipo.</p>
      </main>
    </>
  )
}
