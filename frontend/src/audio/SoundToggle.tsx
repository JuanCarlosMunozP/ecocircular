import { useSyncExternalStore } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { setMuted, soundState } from './sound'

// Botón flotante para silenciar o activar el sonido en cualquier pantalla.
export default function SoundToggle() {
  const muted = useSyncExternalStore(soundState.subscribe, soundState.getSnapshot)
  return (
    <button
      type="button"
      onClick={() => setMuted(!muted)}
      aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
      aria-pressed={muted}
      className="fixed right-3 top-3 z-50 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/90 text-eco-dark shadow-lg transition hover:scale-110"
    >
      {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
    </button>
  )
}
