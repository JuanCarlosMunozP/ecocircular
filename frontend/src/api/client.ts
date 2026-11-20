// Cliente de la API del backend. Aquí solo se piden y envían datos;
// las reglas del juego (desbloqueo, calificación, puntaje) viven en el backend.

export interface Contenedor {
  id: string
  nombre: string
  color: string
}

export interface Residuo {
  id: string
  nombre: string
}

export interface MisionResumen {
  id: string
  titulo: string
  descripcion: string
  desbloqueada: boolean
  completada: boolean
  estrellas: number
  mejor_puntaje: number
}

export interface Nivel {
  numero: number
  nombre: string
  descripcion: string
  desbloqueado: boolean
  misiones: MisionResumen[]
}

export interface MisionDetalle {
  id: string
  nivel: number
  titulo: string
  descripcion: string
  contenedores: Contenedor[]
  residuos: Residuo[]
}

export interface Respuesta {
  residuo_id: string
  contenedor_id: string
}

export interface Clasificacion extends Respuesta {
  correcto: boolean
  contenedor_correcto: string
  explicacion: string
  reutilizacion: string
}

export interface MisionResultado {
  mision_id: string
  aciertos: number
  total: number
  porcentaje: number
  puntaje: number
  estrellas: number
  aprobada: boolean
  detalle: Clasificacion[]
  siguiente_mision: string | null
  juego_completado: boolean
}

export interface Progreso {
  puntaje_total: number
  estrellas_totales: number
  misiones_completadas: number
  misiones_totales: number
  porcentaje: number
}

// En Render el frontend y la API viven en dominios distintos: VITE_API_URL
// (sin barra final) se define en el build. Vacío = mismo origen (Vite/Nginx).
const API_BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/$/, '')

export class ApiError extends Error {}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Ocurrió un error inesperado'
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. ¿Está encendido el backend?')
  }
  if (!response.ok) {
    let detalle = `Error ${response.status}`
    try {
      const cuerpo = await response.json()
      if (typeof cuerpo.detail === 'string') detalle = cuerpo.detail
    } catch {
      /* la respuesta no era JSON: se deja el mensaje genérico */
    }
    throw new ApiError(detalle)
  }
  return response.json() as Promise<T>
}

export const api = {
  niveles: (jugadorId: string) => request<Nivel[]>(`/niveles?jugador_id=${jugadorId}`),

  mision: (misionId: string, jugadorId: string) =>
    request<MisionDetalle>(`/misiones/${misionId}?jugador_id=${jugadorId}`),

  clasificar: (respuesta: Respuesta) =>
    request<Clasificacion>('/clasificar', { method: 'POST', body: JSON.stringify(respuesta) }),

  completarMision: (misionId: string, jugadorId: string, respuestas: Respuesta[]) =>
    request<MisionResultado>(`/misiones/${misionId}/completar`, {
      method: 'POST',
      body: JSON.stringify({ jugador_id: jugadorId, respuestas }),
    }),

  progreso: (jugadorId: string) => request<Progreso>(`/progreso/${jugadorId}`),
}
