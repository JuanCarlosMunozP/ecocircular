import os

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from . import data
from .schemas import (
    ClasificacionOut,
    CompletarMisionIn,
    ContenedorOut,
    JugadorId,
    MisionDetalle,
    MisionResultado,
    MisionResumen,
    NivelOut,
    ProgresoOut,
    ResiduoOut,
    RespuestaIn,
)
from .store import ResultadoGuardado, store

# Despliegue en Render: la API escucha en el puerto de la variable PORT.
app = FastAPI(title="EcoCircular API", version="0.1.0")

# CORS: permite que el frontend (Vite, puerto 5173) llame a esta API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    # Frontends desplegados en Render (la API no usa cookies ni autenticación).
    allow_origin_regex=os.environ.get("CORS_ORIGIN_REGEX", r"https://[a-z0-9-]+\.onrender\.com"),
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Funciones auxiliares ----------
def _mision_o_404(mision_id: str) -> data.Mision:
    mision = data.MISIONES.get(mision_id)
    if mision is None:
        raise HTTPException(404, f"La misión '{mision_id}' no existe")
    return mision


def _desbloqueada(mision: data.Mision, jugador_id: str) -> bool:
    """La primera misión siempre está libre; las demás requieren aprobar la anterior."""
    ordenadas = data.misiones_ordenadas()
    indice = ordenadas.index(mision)
    if indice == 0:
        return True
    anterior = ordenadas[indice - 1]
    resultado = store.obtener(jugador_id).get(anterior.id)
    return resultado is not None and resultado.aprobada


def _clasificar(residuo_id: str, contenedor_id: str) -> ClasificacionOut:
    residuo = data.RESIDUOS.get(residuo_id)
    if residuo is None:
        raise HTTPException(404, f"El residuo '{residuo_id}' no existe")
    if contenedor_id not in data.CONTENEDORES:
        raise HTTPException(404, f"El contenedor '{contenedor_id}' no existe")
    return ClasificacionOut(
        residuo_id=residuo.id,
        contenedor_id=contenedor_id,
        correcto=residuo.categoria == contenedor_id,
        contenedor_correcto=residuo.categoria,
        explicacion=residuo.explicacion,
        reutilizacion=residuo.reutilizacion,
    )


def _estrellas(porcentaje: int) -> int:
    if porcentaje >= data.PORCENTAJE_TRES_ESTRELLAS:
        return 3
    if porcentaje >= data.PORCENTAJE_DOS_ESTRELLAS:
        return 2
    if porcentaje >= data.PORCENTAJE_APROBAR:
        return 1
    return 0


# ---------- Endpoints ----------
@app.get("/api/salud")
def salud() -> dict[str, str]:
    return {"estado": "ok"}


@app.get("/api/niveles", response_model=list[NivelOut])
def listar_niveles(jugador_id: JugadorId = Query(...)) -> list[NivelOut]:
    """Niveles con sus misiones y el estado (bloqueada/completada) del jugador."""
    progreso = store.obtener(jugador_id)
    niveles: list[NivelOut] = []
    for nivel in data.NIVELES.values():
        misiones = []
        for m in data.misiones_ordenadas():
            if m.nivel != nivel.numero:
                continue
            guardado = progreso.get(m.id)
            misiones.append(
                MisionResumen(
                    id=m.id,
                    titulo=m.titulo,
                    descripcion=m.descripcion,
                    desbloqueada=_desbloqueada(m, jugador_id),
                    completada=bool(guardado and guardado.aprobada),
                    estrellas=guardado.estrellas if guardado else 0,
                    mejor_puntaje=guardado.puntaje if guardado else 0,
                )
            )
        niveles.append(
            NivelOut(
                numero=nivel.numero,
                nombre=nivel.nombre,
                descripcion=nivel.descripcion,
                desbloqueado=bool(misiones) and misiones[0].desbloqueada,
                misiones=misiones,
            )
        )
    return niveles


@app.get("/api/misiones/{mision_id}", response_model=MisionDetalle)
def obtener_mision(mision_id: str, jugador_id: JugadorId = Query(...)) -> MisionDetalle:
    """Inicia una partida: sortea los residuos (en orden aleatorio) y los recuerda.

    Cada llamada es una partida nueva, que evita repetir los residuos de la anterior.
    No incluye las respuestas correctas.
    """
    mision = _mision_o_404(mision_id)
    if not _desbloqueada(mision, jugador_id):
        raise HTTPException(403, "Esta misión todavía está bloqueada")
    residuos = data.elegir_residuos(mision, store.anteriores(jugador_id, mision.id))
    store.iniciar_partida(jugador_id, mision.id, residuos)
    return MisionDetalle(
        id=mision.id,
        nivel=mision.nivel,
        titulo=mision.titulo,
        descripcion=mision.descripcion,
        contenedores=[ContenedorOut(**vars(data.CONTENEDORES[c])) for c in mision.contenedores],
        residuos=[ResiduoOut(id=r, nombre=data.RESIDUOS[r].nombre) for r in residuos],
    )


@app.post("/api/clasificar", response_model=ClasificacionOut)
def clasificar(respuesta: RespuestaIn) -> ClasificacionOut:
    """Retroalimentación inmediata para UN residuo (sirve mientras se juega)."""
    return _clasificar(respuesta.residuo_id, respuesta.contenedor_id)


@app.post("/api/misiones/{mision_id}/completar", response_model=MisionResultado)
def completar_mision(mision_id: str, cuerpo: CompletarMisionIn) -> MisionResultado:
    """Califica todas las respuestas de la misión y guarda el progreso."""
    mision = _mision_o_404(mision_id)
    if not _desbloqueada(mision, cuerpo.jugador_id):
        raise HTTPException(403, "Esta misión todavía está bloqueada")

    # Solo se puede responder la partida en curso (la que sorteó el servidor).
    partida = store.partida(cuerpo.jugador_id, mision.id)
    if partida is None:
        raise HTTPException(400, "Primero inicia la misión")

    # Validar que las respuestas correspondan a esa partida y no se repitan.
    por_residuo: dict[str, str] = {}
    for r in cuerpo.respuestas:
        if r.residuo_id not in partida:
            raise HTTPException(400, f"'{r.residuo_id}' no pertenece a esta partida")
        if r.contenedor_id not in mision.contenedores:
            raise HTTPException(400, f"'{r.contenedor_id}' no es un contenedor de esta misión")
        if r.residuo_id in por_residuo:
            raise HTTPException(400, f"Respuesta repetida para '{r.residuo_id}'")
        por_residuo[r.residuo_id] = r.contenedor_id

    # Los residuos sin responder cuentan como error.
    detalle = [
        _clasificar(rid, por_residuo[rid])
        for rid in partida
        if rid in por_residuo
    ]
    aciertos = sum(1 for d in detalle if d.correcto)
    total = len(partida)
    porcentaje = round(aciertos * 100 / total)
    estrellas = _estrellas(porcentaje)
    aprobada = estrellas >= 1
    puntaje = aciertos * data.PUNTOS_POR_ACIERTO

    store.guardar(cuerpo.jugador_id, mision.id, ResultadoGuardado(puntaje, estrellas, aprobada))
    store.cerrar_partida(cuerpo.jugador_id, mision.id)  # una partida se califica una sola vez

    guardadas = store.obtener(cuerpo.jugador_id)
    juego_completado = all(
        m in guardadas and guardadas[m].aprobada for m in data.MISIONES
    )

    ordenadas = data.misiones_ordenadas()
    indice = ordenadas.index(mision)
    siguiente = ordenadas[indice + 1].id if aprobada and indice + 1 < len(ordenadas) else None

    return MisionResultado(
        mision_id=mision.id,
        aciertos=aciertos,
        total=total,
        porcentaje=porcentaje,
        puntaje=puntaje,
        estrellas=estrellas,
        aprobada=aprobada,
        detalle=detalle,
        siguiente_mision=siguiente,
        juego_completado=juego_completado,
    )


@app.get("/api/progreso/{jugador_id}", response_model=ProgresoOut)
def obtener_progreso(jugador_id: JugadorId) -> ProgresoOut:
    progreso = store.obtener(jugador_id)
    completadas = sum(1 for r in progreso.values() if r.aprobada)
    totales = len(data.MISIONES)
    return ProgresoOut(
        jugador_id=jugador_id,
        puntaje_total=sum(r.puntaje for r in progreso.values()),
        estrellas_totales=sum(r.estrellas for r in progreso.values()),
        misiones_completadas=completadas,
        misiones_totales=totales,
        porcentaje=round(completadas * 100 / totales),
    )


@app.delete("/api/progreso/{jugador_id}", status_code=204)
def reiniciar_progreso(jugador_id: JugadorId) -> None:
    store.reiniciar(jugador_id)
