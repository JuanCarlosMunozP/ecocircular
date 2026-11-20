"""Modelos (Pydantic) de lo que entra y sale de la API."""

from typing import Annotated

from pydantic import BaseModel, Field

# Identificador anónimo del jugador, generado por el frontend (no hay login).
JugadorId = Annotated[str, Field(min_length=1, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")]


class ContenedorOut(BaseModel):
    id: str
    nombre: str
    color: str


class ResiduoOut(BaseModel):
    """Residuo tal como lo ve el jugador: SIN la categoría correcta."""

    id: str
    nombre: str


class MisionResumen(BaseModel):
    id: str
    titulo: str
    descripcion: str
    desbloqueada: bool
    completada: bool
    estrellas: int
    mejor_puntaje: int


class NivelOut(BaseModel):
    numero: int
    nombre: str
    descripcion: str
    desbloqueado: bool
    misiones: list[MisionResumen]


class MisionDetalle(BaseModel):
    id: str
    nivel: int
    titulo: str
    descripcion: str
    contenedores: list[ContenedorOut]
    residuos: list[ResiduoOut]


# --- Clasificación ---
class RespuestaIn(BaseModel):
    residuo_id: str
    contenedor_id: str


class ClasificacionOut(BaseModel):
    residuo_id: str
    contenedor_id: str
    correcto: bool
    contenedor_correcto: str
    explicacion: str
    reutilizacion: str


# --- Completar misión ---
class CompletarMisionIn(BaseModel):
    jugador_id: JugadorId
    respuestas: list[RespuestaIn]


class MisionResultado(BaseModel):
    mision_id: str
    aciertos: int
    total: int
    porcentaje: int
    puntaje: int
    estrellas: int
    aprobada: bool
    detalle: list[ClasificacionOut]
    siguiente_mision: str | None
    juego_completado: bool  # True cuando ya están aprobadas todas las misiones


class ProgresoOut(BaseModel):
    jugador_id: str
    puntaje_total: int
    estrellas_totales: int
    misiones_completadas: int
    misiones_totales: int
    porcentaje: int  # lo que mostrará la barra de progreso de la pantalla de inicio
