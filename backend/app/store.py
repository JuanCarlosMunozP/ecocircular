"""Progreso de los jugadores guardado EN MEMORIA.

Se pierde al reiniciar el servidor. Es suficiente para esta etapa; cuando
se necesite persistencia, basta con reemplazar esta clase por una que use
una base de datos, manteniendo los mismos métodos.
"""

from dataclasses import dataclass


@dataclass
class ResultadoGuardado:
    puntaje: int
    estrellas: int
    aprobada: bool


class ProgresoStore:
    def __init__(self) -> None:
        self._jugadores: dict[str, dict[str, ResultadoGuardado]] = {}
        # Partida en curso por (jugador, misión): los residuos sorteados.
        self._partidas: dict[tuple[str, str], list[str]] = {}
        # Residuos de la partida anterior, para no repetirlos en la siguiente.
        self._anteriores: dict[tuple[str, str], frozenset[str]] = {}

    def obtener(self, jugador_id: str) -> dict[str, ResultadoGuardado]:
        return self._jugadores.get(jugador_id, {})

    def guardar(self, jugador_id: str, mision_id: str, nuevo: ResultadoGuardado) -> None:
        """Conserva el MEJOR resultado de cada misión."""
        misiones = self._jugadores.setdefault(jugador_id, {})
        actual = misiones.get(mision_id)
        if actual is None:
            misiones[mision_id] = nuevo
            return
        misiones[mision_id] = ResultadoGuardado(
            puntaje=max(actual.puntaje, nuevo.puntaje),
            estrellas=max(actual.estrellas, nuevo.estrellas),
            aprobada=actual.aprobada or nuevo.aprobada,
        )

    def iniciar_partida(self, jugador_id: str, mision_id: str, residuos: list[str]) -> None:
        clave = (jugador_id, mision_id)
        self._partidas[clave] = residuos
        self._anteriores[clave] = frozenset(residuos)

    def partida(self, jugador_id: str, mision_id: str) -> list[str] | None:
        return self._partidas.get((jugador_id, mision_id))

    def anteriores(self, jugador_id: str, mision_id: str) -> frozenset[str]:
        return self._anteriores.get((jugador_id, mision_id), frozenset())

    def cerrar_partida(self, jugador_id: str, mision_id: str) -> None:
        self._partidas.pop((jugador_id, mision_id), None)

    def reiniciar(self, jugador_id: str) -> None:
        self._jugadores.pop(jugador_id, None)
        for tabla in (self._partidas, self._anteriores):
            for clave in [c for c in tabla if c[0] == jugador_id]:
                del tabla[clave]


store = ProgresoStore()
