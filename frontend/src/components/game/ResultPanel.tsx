import { useEffect } from 'react'
import { RotateCcw, Trophy } from 'lucide-react'
import type { MisionResultado } from '../../api/client'
import { sfx } from '../../audio/sound'
import { Modal, Stars } from './ui'

interface Props {
  resultado: MisionResultado
  onRetry: () => void
  onNext: (misionId: string) => void
  onMissions: () => void
}

export default function ResultPanel({ resultado, onRetry, onNext, onMissions }: Props) {
  // Sonido de victoria o derrota al mostrarse el resultado.
  useEffect(() => {
    if (resultado.aprobada) sfx.win()
    else sfx.fail()
  }, [resultado])

  return (
    <Modal>
      <div className="text-center">
        {resultado.juego_completado && (
          <div className="animate-pop mb-2">
            <Trophy className="mx-auto h-16 w-16 text-yellow-500" />
            <p className="text-5xl font-black text-eco-green [text-shadow:0_3px_0_rgba(6,78,59,0.6)] sm:text-6xl">
              ¡GANASTE!
            </p>
            <p className="mt-1 font-bold text-eco-dark">Eres un verdadero Guardián Ambiental.</p>
          </div>
        )}
        <h2 className="text-2xl font-black text-eco-dark">
          {resultado.aprobada ? '¡Misión cumplida!' : 'Casi lo logras'}
        </h2>
        <div className="mt-2 flex justify-center">
          <Stars count={resultado.estrellas} size="h-10 w-10" />
        </div>
        <p className="mt-3 text-lg font-bold text-slate-700">
          {resultado.aciertos} de {resultado.total} correctos ({resultado.porcentaje}%)
        </p>
        <p className="font-extrabold text-green-700">+{resultado.puntaje} puntos</p>
        {!resultado.aprobada && (
          <p className="mt-2 text-sm text-slate-600">
            Necesitas al menos una estrella para desbloquear la siguiente misión. ¡Inténtalo de nuevo!
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 font-bold text-eco-dark hover:scale-105"
        >
          <RotateCcw className="h-5 w-5" /> Reintentar
        </button>
        {resultado.siguiente_mision && (
          <button
            type="button"
            onClick={() => onNext(resultado.siguiente_mision!)}
            className="cursor-pointer rounded-xl bg-eco-green px-5 py-3 font-black text-white hover:scale-105 hover:bg-green-400"
          >
            Siguiente misión
          </button>
        )}
        <button
          type="button"
          onClick={onMissions}
          className="cursor-pointer rounded-xl bg-slate-100 px-5 py-3 font-bold text-eco-dark hover:scale-105"
        >
          Ver misiones
        </button>
      </div>
    </Modal>
  )
}
