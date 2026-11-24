# EcoCircular – Backend

API sencilla con FastAPI. Los datos del juego están en memoria (`app/data.py`) y el
progreso de cada jugador también (`app/store.py`): se reinicia al apagar el servidor.
No hay base de datos ni autenticación; el frontend genera un `jugador_id` anónimo.

## Ejecutar
```powershell
cd backend
python -m venv venv            # solo la primera vez
.\venv\Scripts\pip install -r requirements.txt
.\venv\Scripts\uvicorn app.main:app --reload
```
Documentación interactiva: http://localhost:8000/docs

## Docker

La imagen de producción se construye desde `Dockerfile` y utiliza
`requirements-prod.txt`. En el despliegue Compose de la raíz, FastAPI solo es
accesible desde la red privada de Docker; Nginx es el punto de entrada público
y reenvía `/admin/` al backend. Consulta [../README.md](../README.md) para
configurar el dominio, HTTPS y la renovación de certificados.

## Pruebas
```powershell
.\venv\Scripts\python -m pytest
```

## Endpoints
| Método | Ruta | Para qué |
|---|---|---|
| GET | `/admin/niveles?jugador_id=` | Niveles y misiones con su estado (bloqueada, estrellas…) |
| GET | `/admin/misiones/{id}?jugador_id=` | **Inicia una partida**: sortea los residuos (orden aleatorio, sin respuestas) |
| POST | `/admin/clasificar` | Feedback inmediato de un residuo |
| POST | `/admin/misiones/{id}/completar` | Califica la partida en curso, guarda progreso, desbloquea la siguiente |
| GET | `/admin/progreso/{jugador_id}` | Puntaje, estrellas y % (barra de la pantalla de inicio) |
| DELETE | `/admin/progreso/{jugador_id}` | Reinicia el progreso |

## Reglas
- Las misiones se juegan en orden; se desbloquea la siguiente al aprobar (≥ 60 % de aciertos).
- Estrellas: ≥ 60 % → 1, ≥ 80 % → 2, 100 % → 3. Cada acierto da 10 puntos.
- Por misión se conserva el mejor resultado.
- **Misiones aleatorias:** cada misión tiene una cantidad fija de residuos (`cantidad` en `data.py`) que se sortea
  entre un pool cada vez que se inicia. Se evita repetir los de la partida anterior y siempre aparece al menos
  un residuo por contenedor. Una partida solo se califica una vez; para volver a jugar hay que iniciarla de nuevo.
