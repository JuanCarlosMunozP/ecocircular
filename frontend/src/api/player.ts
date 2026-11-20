// No hay login: cada navegador genera un identificador anónimo y lo guarda
// en localStorage para que el backend reconozca su progreso.

const KEY = 'ecocircular:jugador'

function generarId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `j-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function getPlayerId(): string {
  try {
    const guardado = localStorage.getItem(KEY)
    if (guardado) return guardado
    const nuevo = generarId()
    localStorage.setItem(KEY, nuevo)
    return nuevo
  } catch {
    // localStorage bloqueado (modo privado, etc.): el id dura solo mientras la página esté abierta.
    return (memoria ??= generarId())
  }
}

let memoria: string | undefined
