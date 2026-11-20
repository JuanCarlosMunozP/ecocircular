import { Loader2, Star } from 'lucide-react'

// Piezas pequeñas compartidas por los paneles del juego.

export function Stars({ count, size = 'h-5 w-5' }: { count: number; size?: string }) {
  return (
    <span className="flex gap-0.5" aria-label={`${count} de 3 estrellas`}>
      {[1, 2, 3].map((n) => (
        <Star
          key={n}
          className={`${size} ${n <= count ? 'fill-yellow-400 text-yellow-500' : 'text-slate-300'}`}
        />
      ))}
    </span>
  )
}

export function Loading() {
  return (
    <div className="flex items-center justify-center gap-2 py-10 font-bold text-eco-dark">
      <Loader2 className="h-6 w-6 animate-spin" /> Cargando...
    </div>
  )
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-2xl bg-red-50 p-4 text-center">
      <p className="font-bold text-red-600">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 cursor-pointer rounded-xl bg-eco-green px-5 py-2 font-bold text-white hover:bg-green-400"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}

// Fondo oscuro + tarjeta centrada, para los paneles que se abren sobre el juego.
export function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="animate-pop max-h-full w-full max-w-xl overflow-y-auto rounded-3xl bg-white/95 p-5 shadow-2xl">
        {children}
      </div>
    </div>
  )
}
