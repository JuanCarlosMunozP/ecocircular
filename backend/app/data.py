"""Contenido educativo del juego (en memoria, sin base de datos).

Aquí viven los contenedores, residuos, niveles y misiones. Para agregar
contenido nuevo basta con añadir elementos a estas estructuras.
"""

import random
from dataclasses import dataclass


@dataclass(frozen=True)
class Contenedor:
    id: str
    nombre: str
    color: str


@dataclass(frozen=True)
class Residuo:
    id: str
    nombre: str
    categoria: str  # id del contenedor correcto (NO se envía al cliente antes de responder)
    explicacion: str  # por qué va en ese contenedor
    reutilizacion: str  # idea para darle una segunda vida


@dataclass(frozen=True)
class Mision:
    id: str
    nivel: int
    orden: int  # posición global; la misión N se desbloquea al aprobar la N-1
    titulo: str
    descripcion: str
    contenedores: tuple[str, ...]
    cantidad: int  # cuántos residuos salen en cada partida
    # Residuos entre los que se sortea. Vacío = todos los que encajan en los contenedores.
    residuos: tuple[str, ...] = ()


@dataclass(frozen=True)
class Nivel:
    numero: int
    nombre: str
    descripcion: str


CONTENEDORES: dict[str, Contenedor] = {
    c.id: c
    for c in [
        Contenedor("plastico", "Plástico", "amarillo"),
        Contenedor("papel", "Papel", "azul"),
        Contenedor("carton", "Cartón", "cafe"),
    ]
}

RESIDUOS: dict[str, Residuo] = {
    r.id: r
    for r in [
        # --- Plástico ---
        Residuo("botella_gaseosa", "Botella de gaseosa", "plastico",
                "Las botellas PET se recuperan y se convierten en fibras y nuevos envases.",
                "Úsala como matera o como botella para regar plantas."),
        Residuo("bolsa_plastica", "Bolsa plástica", "plastico",
                "El plástico flexible limpio y seco también se aprovecha.",
                "Reutilízala para hacer tus compras o para guardar cosas."),
        Residuo("envase_yogur", "Envase de yogur", "plastico",
                "Es plástico rígido; enjuágalo antes de depositarlo.",
                "Sirve como semillero para germinar plantas."),
        Residuo("tapa_botella", "Tapa de botella", "plastico",
                "Las tapas son de un plástico distinto, pero igual se recicla.",
                "Con muchas tapas se hacen manualidades y juegos."),
        Residuo("vaso_desechable", "Vaso desechable de plástico", "plastico",
                "Es plástico y, si está limpio, se puede aprovechar.",
                "Úsalo como organizador de lápices o para sembrar."),
        Residuo("bidon_agua", "Bidón de agua", "plastico",
                "Los bidones son de plástico grueso, muy valioso para reciclar.",
                "Convertido en comedero para aves o recipiente para la huerta."),
        # --- Papel ---
        Residuo("hoja_cuaderno", "Hoja de cuaderno", "papel",
                "El papel limpio y seco se recicla varias veces.",
                "Usa ambas caras antes de reciclarla."),
        Residuo("periodico", "Periódico", "papel",
                "El papel periódico es fácil de reciclar y reutilizar.",
                "Sirve para envolver regalos o proteger objetos frágiles."),
        Residuo("revista", "Revista", "papel",
                "Es papel; se puede reciclar aunque tenga tintas de colores.",
                "Recorta imágenes para collages y trabajos manuales."),
        Residuo("sobre_carta", "Sobre de carta", "papel",
                "Es papel delgado y se recicla con el resto del papel.",
                "Voltéalo y úsalo como papel para apuntes."),
        Residuo("folleto", "Folleto", "papel",
                "Papel impreso: va con el papel, sin arrugarlo con residuos húmedos.",
                "Úsalo como papel de borrador."),
        Residuo("papel_impresora", "Papel de impresora", "papel",
                "Es uno de los papeles más reciclables que existen.",
                "Dóblalo para hacer cuadernos de notas."),
        # --- Cartón ---
        Residuo("caja_cereal", "Caja de cereal", "carton",
                "Es cartón liviano; se aplana para ocupar menos espacio.",
                "Hazle un forro y úsala como organizador de escritorio."),
        Residuo("caja_huevos", "Cubeta de cartón de huevos", "carton",
                "Es cartón prensado y se recicla muy bien.",
                "Excelente para germinar semillas o como abono en el compost."),
        Residuo("tubo_papel", "Tubo de papel higiénico", "carton",
                "Es cartón, aunque parezca papel por su grosor.",
                "Útil como semillero o para organizar cables."),
        Residuo("caja_zapatos", "Caja de zapatos", "carton",
                "Es cartón resistente y muy reciclable si está seco.",
                "Perfecta para guardar útiles y manualidades."),
        Residuo("caja_corrugada", "Caja de cartón corrugado", "carton",
                "El cartón corrugado se recicla en grandes cantidades.",
                "Úsala para mudanzas o para hacer juguetes creativos."),
        Residuo("empaque_galletas", "Empaque de cartón de galletas", "carton",
                "Es cartón; sepáralo del plástico interno antes de reciclar.",
                "Recórtalo para hacer separadores de libros."),
    ]
}

NIVELES: dict[int, Nivel] = {
    n.numero: n
    for n in [
        Nivel(1, "El Parque de Obonuco", "Aprende a distinguir los materiales más comunes."),
        Nivel(2, "La Huerta Escolar", "Ya sabes lo básico: ahora con más residuos."),
        Nivel(3, "Guardián Ambiental", "El reto final: clasifica todos los materiales."),
    ]
}

MISIONES: dict[str, Mision] = {
    m.id: m
    for m in [
        Mision("n1m1", 1, 1, "Plástico o papel",
               "Separa los residuos en dos contenedores.",
               ("plastico", "papel"), cantidad=4),
        Mision("n1m2", 1, 2, "Conoce el cartón",
               "Aparece un nuevo contenedor: el cartón.",
               ("papel", "carton"), cantidad=4),
        Mision("n2m1", 2, 3, "Los tres contenedores",
               "Ahora tienes que usar los tres contenedores.",
               ("plastico", "papel", "carton"), cantidad=5),
        Mision("n2m2", 2, 4, "Cuidado con las confusiones",
               "Algunos residuos parecen de un material pero son de otro.",
               ("plastico", "papel", "carton"), cantidad=6,
               residuos=("tubo_papel", "vaso_desechable", "caja_corrugada", "revista", "bidon_agua",
                         "empaque_galletas", "tapa_botella", "sobre_carta", "caja_huevos")),
        Mision("n3m1", 3, 5, "Reto del Guardián",
               "Clasifica todos los residuos sin equivocarte.",
               ("plastico", "papel", "carton"), cantidad=8),
    ]
}

# Reglas de puntuación (porcentaje de aciertos)
PUNTOS_POR_ACIERTO = 10
PORCENTAJE_APROBAR = 60  # 1 estrella
PORCENTAJE_DOS_ESTRELLAS = 80
PORCENTAJE_TRES_ESTRELLAS = 100


def misiones_ordenadas() -> list[Mision]:
    return sorted(MISIONES.values(), key=lambda m: m.orden)


def pool_de(mision: Mision) -> list[str]:
    """Residuos entre los que se sortea la misión."""
    candidatos = mision.residuos or tuple(RESIDUOS)
    return [r for r in candidatos if RESIDUOS[r].categoria in mision.contenedores]


def elegir_residuos(mision: Mision, anteriores: frozenset[str] = frozenset()) -> list[str]:
    """Sortea los residuos de una partida.

    - Prefiere los que NO salieron en la partida anterior (para no repetir).
    - Garantiza al menos un residuo por contenedor, así todos se usan.
    - Devuelve la lista en orden aleatorio.
    """
    pool = pool_de(mision)
    random.shuffle(pool)
    pool.sort(key=lambda r: r in anteriores)  # orden estable: primero los no vistos

    elegidos: list[str] = []
    for contenedor in mision.contenedores:
        elegidos.append(next(r for r in pool if RESIDUOS[r].categoria == contenedor))
    for r in pool:
        if len(elegidos) >= mision.cantidad:
            break
        if r not in elegidos:
            elegidos.append(r)

    random.shuffle(elegidos)
    return elegidos


def _validar_datos() -> None:
    """Falla al arrancar si hay un error de configuración en el contenido."""
    for r in RESIDUOS.values():
        assert r.categoria in CONTENEDORES, f"Residuo {r.id}: categoría desconocida"
    for m in MISIONES.values():
        assert m.nivel in NIVELES, f"Misión {m.id}: nivel desconocido"
        for c in m.contenedores:
            assert c in CONTENEDORES, f"Misión {m.id}: contenedor {c} desconocido"
        for rid in m.residuos:
            assert rid in RESIDUOS, f"Misión {m.id}: residuo {rid} desconocido"
        pool = pool_de(m)
        assert len(m.contenedores) <= m.cantidad <= len(pool), (
            f"Misión {m.id}: cantidad {m.cantidad} inválida (pool de {len(pool)}, "
            f"{len(m.contenedores)} contenedores)"
        )
        for c in m.contenedores:
            assert any(RESIDUOS[r].categoria == c for r in pool), (
                f"Misión {m.id}: ningún residuo para el contenedor {c}"
            )


_validar_datos()
