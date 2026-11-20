import { useEffect, useState } from 'react'
import GuideCharacter from './GuideCharacter'
import type { Mood } from './GuideCharacter'

interface Props {
  mensaje: string
  mood: Mood
  accion?: { label: string; onClick: () => void; disabled?: boolean }
}

const MS_POR_LETRA = 22

// Barra inferior: el guía y su globo de diálogo, que se escribe letra por letra.
// Se vuelve a montar (key) cada vez que cambia el mensaje para reiniciar la escritura.
export default function GuidePanel(props: Props) {
  return <GuideDialogue key={props.mensaje} {...props} />
}

function GuideDialogue({ mensaje, mood, accion }: Props) {
  const [letras, setLetras] = useState(0)
  const escribiendo = letras < mensaje.length

  useEffect(() => {
    const id = window.setInterval(() => {
      setLetras((n) => {
        if (n >= mensaje.length) {
          clearInterval(id)
          return n
        }
        return n + 1
      })
    }, MS_POR_LETRA)
    return () => clearInterval(id)
  }, [mensaje])

  return (
    <div className="flex items-end gap-3 bg-gradient-to-b from-green-500 to-green-700 px-3 pt-2 pb-3 sm:px-6">
      <GuideCharacter mood={mood} talking={escribiendo} className="h-28 w-24 shrink-0 sm:h-44 sm:w-36" />

      {/* Globo de diálogo; al tocarlo se muestra el texto completo */}
      <div
        onClick={() => setLetras(mensaje.length)}
        className="relative mb-2 max-h-36 min-h-16 flex-1 overflow-y-auto rounded-2xl bg-white p-3 shadow-lg sm:max-h-40 sm:p-4"
      >
        <span
          aria-hidden
          className="absolute -left-2 bottom-6 h-4 w-4 rotate-45 bg-white"
        />
        {/* Texto completo para lectores de pantalla; el visible se va escribiendo */}
        <p className="sr-only" aria-live="polite">
          {mensaje}
        </p>
        <p aria-hidden className="text-sm font-bold text-slate-800 sm:text-lg">
          {mensaje.slice(0, letras)}
        </p>
        {accion && !escribiendo && (
          <button
            type="button"
            disabled={accion.disabled}
            onClick={(e) => {
              e.stopPropagation()
              accion.onClick()
            }}
            className="mt-2 cursor-pointer rounded-xl bg-eco-green px-5 py-2 font-black text-white shadow hover:bg-green-400 disabled:opacity-60"
          >
            {accion.label}
          </button>
        )}
      </div>
    </div>
  )
}
