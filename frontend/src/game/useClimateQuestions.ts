import { useCallback, useRef, useState } from 'react'
import questions from './climateQuestions.json'

export interface ClimateQuestion {
  id: string
  categoria: string
  pregunta: string
  opciones: string[]
  respuestaCorrecta: number
  explicacion: string
}

const PREGUNTAS = questions satisfies ClimateQuestion[]

export function useClimateQuestions() {
  const mostradas = useRef(new Set<string>())
  const ultimaPregunta = useRef<string | null>(null)
  const [pregunta, setPregunta] = useState<ClimateQuestion | null>(null)

  const siguientePregunta = useCallback(() => {
    let disponibles = PREGUNTAS.filter((item) => !mostradas.current.has(item.id))
    if (disponibles.length === 0) {
      mostradas.current.clear()
      disponibles = PREGUNTAS.filter((item) => item.id !== ultimaPregunta.current)
      if (disponibles.length === 0) disponibles = PREGUNTAS
    }

    const seleccionada = disponibles[Math.floor(Math.random() * disponibles.length)]
    if (!seleccionada) return
    mostradas.current.add(seleccionada.id)
    ultimaPregunta.current = seleccionada.id
    setPregunta(seleccionada)
  }, [])

  const cerrarPregunta = useCallback(() => setPregunta(null), [])

  return { pregunta, siguientePregunta, cerrarPregunta }
}
