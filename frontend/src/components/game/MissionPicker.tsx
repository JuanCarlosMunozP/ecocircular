import { useEffect, useState } from 'react'
import { CheckCircle2, Home, Lock, Play, X } from 'lucide-react'
import { api, errorMessage } from '../../api/client'
import type { Nivel } from '../../api/client'
import { getPlayerId } from '../../api/player'
import type { EducationalMissionId } from '../../game/education'
import LearningActivities from './LearningActivities'
import { ErrorBox, Loading, Modal, Stars } from './ui'

interface Props {
  error: string | null
  onPlay: (misionId: string) => void
  onPlayLocal: (missionId: EducationalMissionId) => void
  onClose?: () => void // solo si hay una partida a la que volver
  onExit: () => void
}

// Selector de misiones: se abre sobre la misma pantalla del juego.
export default function MissionPicker({ error: errorJuego, onPlay, onPlayLocal, onClose, onExit }: Props) {
  const [niveles, setNiveles] = useState<Nivel[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let cancelado = false
    api
      .niveles(getPlayerId())
      .then((n) => !cancelado && setNiveles(n))
      .catch((e) => !cancelado && setError(errorMessage(e)))
    return () => {
      cancelado = true
    }
  }, [intento])

  function recargar() {
    setError(null)
    setNiveles(null)
    setIntento((n) => n + 1)
  }

  return (
    <Modal>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-2xl font-black text-eco-dark">Elige tu misión</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onExit}
            aria-label="Volver al inicio"
            className="cursor-pointer rounded-xl bg-slate-100 p-2 text-eco-dark hover:bg-slate-200"
          >
            <Home className="h-5 w-5" />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="cursor-pointer rounded-xl bg-slate-100 p-2 text-eco-dark hover:bg-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {errorJuego && <ErrorBox message={errorJuego} />}
      {error && <ErrorBox message={error} onRetry={recargar} />}
      {!error && !niveles && <Loading />}

      {niveles && (
        <div className="flex flex-col gap-4">
          {niveles.map((nivel) => (
            <section key={nivel.numero} className={nivel.desbloqueado ? '' : 'opacity-60'}>
              <h3 className="flex items-center gap-2 font-black text-eco-dark">
                Nivel {nivel.numero}: {nivel.nombre}
                {!nivel.desbloqueado && <Lock className="h-4 w-4 text-slate-500" />}
              </h3>
              <ul className="mt-2 flex flex-col gap-2">
                {nivel.misiones.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      disabled={!m.desbloqueada}
                      onClick={() => onPlay(m.id)}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-white p-3 text-left shadow transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-100"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-eco-lime text-eco-dark">
                        {!m.desbloqueada ? (
                          <Lock className="h-4 w-4 text-slate-500" />
                        ) : m.completada ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </span>
                      <span className="flex-1">
                        <span className="block font-extrabold text-eco-dark">{m.titulo}</span>
                        <span className="block text-xs text-slate-600">{m.descripcion}</span>
                      </span>
                      {m.desbloqueada && <Stars count={m.estrellas} />}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <div className="mt-5 border-t border-slate-200 pt-4">
        <LearningActivities onChoose={onPlayLocal} />
      </div>
    </Modal>
  )
}
