# EcoCircular: Misión Reciclaje

Frontend educativo construido con React, TypeScript, Vite, Three.js y React
Three Fiber. Conserva el patio 3D y las misiones de clasificación existentes;
las actividades educativas locales se pueden jugar sin agregar endpoints ni
persistencia al backend. Los efectos y la música ambiental se generan con Web
Audio API; la primera interacción habilita el audio según las políticas del
navegador y el control de sonido permite silenciarlo.

## Ejecutar

Desde esta carpeta:

```powershell
npm run dev
npm run build
npm run lint
```

Para jugar las misiones tradicionales con progreso y desbloqueos, inicia también
la API FastAPI siguiendo las instrucciones de `../backend/README.md`. Las
actividades educativas locales están disponibles desde el selector aunque la
API no esté en ejecución.

## Actividades educativas

- **Detectives de materiales:** identifica plástico, papel, cartón, metal,
  empaques mixtos y residuos orgánicos.
- **Cada residuo en su ruta:** clasifica objetos limpios y aprende por qué los
  residuos contaminados o de ruta incierta requieren un manejo diferente.
- **Talleres:** crea una tarjeta o separador, un organizador o portalápices, y
  un semillero con una botella que solo haya contenido agua. Las tareas de
  corte incluyen indicaciones de acompañamiento adulto.
- **Preguntas ambientales:** al terminar una misión se presenta una pregunta
  aleatoria con explicación. Las preguntas están en
  `src/game/climateQuestions.json` y se recorren sin repetición hasta completar
  cada ciclo.

El catálogo tipado de actividades, objetos y proyectos se encuentra en
`src/game/education.ts`. Estas actividades son una propuesta inicial y deben
adaptarse cuando esté disponible el diagnóstico ambiental de la institución;
las indicaciones sobre rutas locales no sustituyen las reglas de separación
vigentes en cada comunidad.

Para desplegar el frontend estático en Nginx con TLS y la API FastAPI
contenedorizada, sigue los pasos de [../README.md](../README.md).
