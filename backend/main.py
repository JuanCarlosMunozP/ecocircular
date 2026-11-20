"""Lanzador: permite arrancar el servidor con `python main.py`.

La aplicación FastAPI en sí está en app/main.py.
Equivale a: uvicorn app.main:app --reload
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
