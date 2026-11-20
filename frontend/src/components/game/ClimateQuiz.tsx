import { useState } from 'react'
import { sfx } from '../../audio/sound'
import type { ClimateQuestion } from '../../game/useClimateQuestions'

interface Props {
  question: ClimateQuestion
  onContinue: () => void
}

export default function ClimateQuiz({ question, onContinue }: Props) {
  const [answer, setAnswer] = useState<number | null>(null)
  const correcta = answer === question.respuestaCorrecta

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="climate-question"
        className="animate-pop max-h-full w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
      >
        <p className="text-sm font-extrabold uppercase tracking-wide text-green-700">{question.categoria}</p>
        <h2 id="climate-question" className="mt-1 text-xl font-black text-eco-dark sm:text-2xl">
          Pregunta ambiental
        </h2>
        <p className="mt-3 font-bold text-slate-800">{question.pregunta}</p>

        <div className="mt-4 grid gap-2">
          {question.opciones.map((opcion, index) => {
            const elegida = answer === index
            const esCorrecta = index === question.respuestaCorrecta
            const estado = answer === null ? '' : esCorrecta ? 'border-green-600 bg-green-50' : elegida ? 'border-amber-500 bg-amber-50' : ''
            return (
              <button
                key={opcion}
                type="button"
                disabled={answer !== null}
                onClick={() => {
                  setAnswer(index)
                  if (esCorrecta) sfx.educationalCorrect()
                  else sfx.educationalWrong()
                }}
                className={`cursor-pointer rounded-xl border-2 border-slate-200 p-3 text-left font-semibold text-slate-700 transition enabled:hover:border-green-500 disabled:cursor-default ${estado}`}
              >
                <span className="mr-2 font-black text-eco-dark">{String.fromCharCode(65 + index)}.</span>
                {opcion}
              </button>
            )
          })}
        </div>

        {answer !== null && (
          <div className={`mt-4 rounded-2xl p-4 ${correcta ? 'bg-green-50 text-green-900' : 'bg-amber-50 text-amber-950'}`} aria-live="polite">
            <p className="font-black">{correcta ? '¡Correcto!' : 'Aprendamos algo nuevo'}</p>
            {!correcta && (
              <p className="mt-1 text-sm">
                La respuesta es: <strong>{question.opciones[question.respuestaCorrecta]}</strong>
              </p>
            )}
            <p className="mt-1 text-sm">{question.explicacion}</p>
          </div>
        )}

        <button
          type="button"
          disabled={answer === null}
          onClick={onContinue}
          className="mt-5 w-full cursor-pointer rounded-xl bg-eco-green px-5 py-3 font-black text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continuar
        </button>
      </section>
    </div>
  )
}
