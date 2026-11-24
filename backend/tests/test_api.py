from fastapi.testclient import TestClient

from app import data
from app.main import app
from app.store import store

client = TestClient(app)
J = "jugador-test"


def setup_function() -> None:
    store.reiniciar(J)


def iniciar(mision_id: str) -> list[str]:
    """Inicia una partida y devuelve los residuos que sorteó el servidor."""
    r = client.get(f"/admin/misiones/{mision_id}", params={"jugador_id": J})
    assert r.status_code == 200
    return [x["id"] for x in r.json()["residuos"]]


def respuestas_correctas(mision_id: str) -> list[dict]:
    return [
        {"residuo_id": r, "contenedor_id": data.RESIDUOS[r].categoria} for r in iniciar(mision_id)
    ]


def respuestas_incorrectas(mision_id: str) -> list[dict]:
    """Para cada residuo, un contenedor de la misión que NO es el correcto."""
    contenedores = data.MISIONES[mision_id].contenedores
    return [
        {"residuo_id": r, "contenedor_id": next(c for c in contenedores if c != data.RESIDUOS[r].categoria)}
        for r in iniciar(mision_id)
    ]


def completar(mision_id: str, respuestas: list[dict]):
    return client.post(
        f"/admin/misiones/{mision_id}/completar",
        json={"jugador_id": J, "respuestas": respuestas},
    )


def test_niveles_solo_primera_mision_desbloqueada():
    niveles = client.get("/admin/niveles", params={"jugador_id": J}).json()
    assert [n["numero"] for n in niveles] == [1, 2, 3]
    assert niveles[0]["desbloqueado"] is True
    assert niveles[1]["desbloqueado"] is False
    assert niveles[0]["misiones"][0]["desbloqueada"] is True
    assert niveles[0]["misiones"][1]["desbloqueada"] is False


def test_mision_no_expone_respuestas():
    r = client.get("/admin/misiones/n1m1", params={"jugador_id": J}).json()
    assert all(set(x) == {"id", "nombre"} for x in r["residuos"])


def test_mision_bloqueada():
    r = client.get("/admin/misiones/n1m2", params={"jugador_id": J})
    assert r.status_code == 403


def test_clasificar_correcto_e_incorrecto():
    ok = client.post("/admin/clasificar", json={"residuo_id": "botella_gaseosa", "contenedor_id": "plastico"}).json()
    assert ok["correcto"] is True
    mal = client.post("/admin/clasificar", json={"residuo_id": "botella_gaseosa", "contenedor_id": "papel"}).json()
    assert mal["correcto"] is False and mal["contenedor_correcto"] == "plastico"


def test_completar_perfecto_desbloquea_siguiente():
    r = completar("n1m1", respuestas_correctas("n1m1")).json()
    assert r["estrellas"] == 3 and r["aprobada"] and r["puntaje"] == 40
    assert r["siguiente_mision"] == "n1m2"
    assert client.get("/admin/misiones/n1m2", params={"jugador_id": J}).status_code == 200


def test_reprobar_no_desbloquea():
    r = completar("n1m1", respuestas_incorrectas("n1m1")).json()
    assert r["aprobada"] is False and r["siguiente_mision"] is None
    assert client.get("/admin/misiones/n1m2", params={"jugador_id": J}).status_code == 403


def test_sin_responder_cuenta_como_error():
    r = completar("n1m1", respuestas_correctas("n1m1")[:2]).json()
    assert r["aciertos"] == 2 and r["total"] == 4 and r["porcentaje"] == 50


def test_respuestas_invalidas():
    partida = iniciar("n1m1")
    r0 = partida[0]
    ajeno = next(r for r in data.RESIDUOS if r not in partida)  # existe, pero no salió en esta partida
    assert completar("n1m1", [{"residuo_id": ajeno, "contenedor_id": "papel"}]).status_code == 400
    assert completar("n1m1", [{"residuo_id": r0, "contenedor_id": "carton"}]).status_code == 400
    dup = [{"residuo_id": r0, "contenedor_id": "plastico"}] * 2
    assert completar("n1m1", dup).status_code == 400


def test_completar_sin_iniciar_la_mision():
    assert completar("n1m1", []).status_code == 400


def test_una_partida_se_califica_una_sola_vez():
    respuestas = respuestas_correctas("n1m1")
    assert completar("n1m1", respuestas).status_code == 200
    assert completar("n1m1", respuestas).status_code == 400  # hay que volver a iniciar


def test_cada_partida_tiene_cantidad_fija_y_usa_todos_los_contenedores():
    for m in data.MISIONES.values():
        if m.orden > 1:
            continue  # las demás están bloqueadas para un jugador nuevo
        residuos = iniciar(m.id)
        assert len(residuos) == m.cantidad and len(set(residuos)) == m.cantidad
        assert {data.RESIDUOS[r].categoria for r in residuos} == set(m.contenedores)


def test_reintentar_no_repite_los_mismos_residuos():
    # El pool de n1m1 (12 residuos) permite 4 distintos en cada intento seguido.
    anterior = set(iniciar("n1m1"))
    for _ in range(5):
        actual = set(iniciar("n1m1"))
        assert actual.isdisjoint(anterior)
        anterior = actual


def test_el_orden_y_los_residuos_varian():
    partidas = {tuple(iniciar("n1m1")) for _ in range(6)}
    assert len(partidas) > 1


def test_progreso_conserva_mejor_resultado():
    completar("n1m1", respuestas_correctas("n1m1"))
    completar("n1m1", respuestas_incorrectas("n1m1"))  # un intento peor no debe bajar el puntaje
    p = client.get(f"/admin/progreso/{J}").json()
    assert p["puntaje_total"] == 40 and p["misiones_completadas"] == 1 and p["porcentaje"] == 20


def test_jugador_id_invalido():
    assert client.get("/admin/progreso/hola mundo!").status_code == 422


def test_ganar_el_juego_al_aprobar_todas_las_misiones():
    ids = [m.id for m in data.misiones_ordenadas()]
    for mision_id in ids[:-1]:
        assert completar(mision_id, respuestas_correctas(mision_id)).json()["juego_completado"] is False
    ultima = completar(ids[-1], respuestas_correctas(ids[-1])).json()
    assert ultima["juego_completado"] is True and ultima["siguiente_mision"] is None
