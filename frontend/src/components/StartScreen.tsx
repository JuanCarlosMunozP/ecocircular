import { Suspense, useEffect, useState } from 'react'
import { Leaf } from 'lucide-react'
import Logo from './Logo'
import MissionButton from './MissionButton'
import EcoScene from './scene/EcoScene'
import { api } from '../api/client'
import { getPlayerId } from '../api/player'

export default function StartScreen({ onStart }: { onStart: () => void }) {
  // El porcentaje lo calcula el backend. Si no responde, se muestra 0%.
  const [porcentaje, setPorcentaje] = useState(0)
  useEffect(() => {
    api.progreso(getPlayerId()).then((p) => setPorcentaje(p.porcentaje)).catch(() => {})
  }, [])

  return (
    <main className="relative flex min-h-full flex-col overflow-hidden bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-200">
      {/* Escena 3D de fondo */}
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <EcoScene />
        </Suspense>
      </div>

      {/* Contenido de la interfaz, encima de la escena */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-between gap-4 px-4 py-6 sm:py-8">
        <Logo />

        <section className="max-w-xl rounded-3xl bg-white/85 p-5 text-center shadow-xl backdrop-blur-sm sm:p-7">
          <h2 className="text-2xl font-black text-eco-dark sm:text-3xl">¡Bienvenido a EcoCircular!</h2>
          <p className="mt-2 text-base text-slate-700 sm:text-lg">
            El planeta necesita tu ayuda. Aprende a clasificar, reutilizar y aprovechar los residuos
            mientras completas divertidas misiones ambientales.
          </p>
          <p className="mt-3 text-base font-extrabold text-green-700 sm:text-lg">
            ¿Estás listo para convertirte en un Guardián Ambiental?
          </p>
        </section>

        <div className="flex w-full max-w-sm flex-col items-center gap-3">
          <MissionButton onClick={onStart} />

          <div className="w-full rounded-2xl bg-white/85 px-4 py-3 shadow-md backdrop-blur-sm">
            <div className="mb-1 flex items-center justify-between text-sm font-bold text-eco-dark">
              <span className="flex items-center gap-1">
                <Leaf className="h-4 w-4 text-eco-green" /> Progreso
              </span>
              <span>{porcentaje}%</span>
            </div>
            <div
              role="progressbar"
              aria-label="Progreso de la aventura"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={porcentaje}
              className="h-3 overflow-hidden rounded-full bg-slate-200"
            >
              <div
                className="h-full rounded-full bg-eco-green transition-all duration-700"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
            <p className="mt-2 text-center text-sm font-semibold text-slate-600">
              Tu aventura ambiental comienza aquí
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
