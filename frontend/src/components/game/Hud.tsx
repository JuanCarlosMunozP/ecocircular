import { ListChecks } from 'lucide-react'
import { iconoResiduo } from '../../game/itemIcons'

interface Props {
  titulo: string | null
  aciertos: number
  faltan: number
  residuo: { id: string; nombre: string } | null
  onOpenMissions: () => void
}

// Marcador (aciertos / faltan), nombre de la misión y el residuo actual.
export default function Hud({ titulo, aciertos, faltan, residuo, onOpenMissions }: Props) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-1 p-2 sm:gap-2 sm:p-3">
      <div className="flex w-full items-start justify-between gap-2 pr-14">
        <button
          type="button"
          onClick={onOpenMissions}
          className="pointer-events-auto flex cursor-pointer items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-sm font-bold text-eco-dark shadow hover:scale-105"
        >
          <ListChecks className="h-5 w-5" />
          <span className="max-w-40 truncate">{titulo ?? 'Misiones'}</span>
        </button>

        {/* Número a la izquierda y textos a la derecha: así ocupa una sola fila de alto */}
        <div className="flex items-center gap-2 text-white [text-shadow:0_3px_0_rgba(6,78,59,0.8)]">
          <div className="text-4xl font-black leading-none sm:text-6xl">{aciertos}</div>
          <div className="text-left leading-tight">
            <div className="text-xs font-extrabold uppercase tracking-widest sm:text-sm">Aciertos</div>
            {titulo && <div className="text-xs font-extrabold sm:text-base">FALTAN {faltan}</div>}
          </div>
        </div>

        <div className="w-10 sm:w-32" aria-hidden />
      </div>

      {residuo && (
        <div
          key={residuo.id}
          className="animate-pop flex items-center gap-2 rounded-full bg-white px-4 py-1.5 shadow-lg"
          aria-live="polite"
        >
          <span className="text-2xl sm:text-3xl">{iconoResiduo(residuo.id)}</span>
          <span className="text-sm font-black text-eco-dark sm:text-lg">{residuo.nombre}</span>
        </div>
      )}
    </div>
  )
}
