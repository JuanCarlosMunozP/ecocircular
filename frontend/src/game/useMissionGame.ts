import { useCallback, useRef, useState } from 'react'
import { api, errorMessage } from '../api/client'
import type { Clasificacion, MisionDetalle, MisionResultado, Respuesta } from '../api/client'
import { getPlayerId } from '../api/player'
import { sfx } from '../audio/sound'

// Toda la "máquina" de una partida en un solo lugar: los componentes solo
// muestran lo que este hook entrega. Las reglas (calificar, desbloquear,
// puntaje) las sigue decidiendo el backend.
export function useMissionGame() {
  const [mision, setMision] = useState<MisionDetalle | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [indice, setIndice] = useState(0)
  const [respuestas, setRespuestas] = useState<Respuesta[]>([])
  const [aciertos, setAciertos] = useState(0)
  const [feedback, setFeedback] = useState<Clasificacion | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [resultado, setResultado] = useState<MisionResultado | null>(null)

  // Si el jugador cambia de misión mientras otra carga, se ignora la respuesta vieja.
  const token = useRef(0)

  const limpiar = useCallback(() => {
    setMision(null)
    setCargando(false)
    setError(null)
    setIndice(0)
    setRespuestas([])
    setAciertos(0)
    setFeedback(null)
    setOcupado(false)
    setResultado(null)
  }, [])

  const reset = useCallback(() => {
    token.current++
    limpiar()
  }, [limpiar])

  const start = useCallback(
    async (misionId: string) => {
      const mio = ++token.current
      limpiar()
      setCargando(true)
      try {
        const m = await api.mision(misionId, getPlayerId())
        if (mio === token.current) setMision(m)
      } catch (e) {
        if (mio === token.current) setError(errorMessage(e))
      } finally {
        if (mio === token.current) setCargando(false)
      }
    },
    [limpiar],
  )

  const residuoActual = mision && !resultado ? mision.residuos[indice] : null
  const esUltimo = !!mision && indice === mision.residuos.length - 1

  // El jugador elige un contenedor: el backend dice si es correcto.
  async function elegir(contenedorId: string) {
    if (!residuoActual || feedback || ocupado) return
    setOcupado(true)
    setError(null)
    try {
      const resp = { residuo_id: residuoActual.id, contenedor_id: contenedorId }
      const clasificacion = await api.clasificar(resp)
      if (clasificacion.correcto) {
        sfx.correct()
        setAciertos((a) => a + 1)
      } else {
        sfx.wrong()
      }
      setFeedback(clasificacion)
      setRespuestas((prev) => [...prev, resp])
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setOcupado(false)
    }
  }

  // Avanza al siguiente residuo; tras el último, envía todo al backend para calificar.
  async function siguiente() {
    if (!mision || !feedback) return
    if (!esUltimo) {
      setIndice(indice + 1)
      setFeedback(null)
      return
    }
    setOcupado(true)
    setError(null)
    try {
      setResultado(await api.completarMision(mision.id, getPlayerId(), respuestas))
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setOcupado(false)
    }
  }

  return {
    mision,
    cargando,
    error,
    residuoActual,
    feedback,
    ocupado,
    resultado,
    esUltimo,
    aciertos,
    faltan: mision ? mision.residuos.length - respuestas.length : 0,
    start,
    reset,
    elegir,
    siguiente,
  }
}
