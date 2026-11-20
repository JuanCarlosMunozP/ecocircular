import { useEffect, useState } from 'react'
import ClimateQuiz from './ClimateQuiz'
import EducationalMission from './EducationalMission'
import { useMissionGame } from '../../game/useMissionGame'
import { EDUCATIONAL_MISSIONS } from '../../game/education'
import type { EducationalMissionId } from '../../game/education'
import { useClimateQuestions } from '../../game/useClimateQuestions'
import type { Mood } from './GuideCharacter'
import GuidePanel from './GuidePanel'
import Hud from './Hud'
import MissionPicker from './MissionPicker'
import ResultPanel from './ResultPanel'
import YardScene from './scene/YardScene'
import type { BinInfo } from './scene/YardScene'

// Pantalla única del juego: escena 3D + marcador + guía + paneles encima.
// Aquí solo se "arma" la pantalla; la lógica está en useMissionGame.
export default function GameScreen({ onExit }: { onExit: () => void }) {
  const game = useMissionGame()
  const [pickerAbierto, setPickerAbierto] = useState(false)
  const [localMissionId, setLocalMissionId] = useState<EducationalMissionId | null>(null)
  const { pregunta, siguientePregunta, cerrarPregunta } = useClimateQuestions()

  const { mision, feedback, residuoActual } = game
  const educationalMission = EDUCATIONAL_MISSIONS.find((mission) => mission.id === localMissionId) ?? null

  useEffect(() => {
    if (game.resultado) siguientePregunta()
  }, [game.resultado, siguientePregunta])

  // Los contenedores de la misión; si aún no hay misión, se muestran los tres de práctica.
  const bins: BinInfo[] = (
    mision?.contenedores ?? [
      { id: 'plastico', nombre: 'Plástico', color: 'amarillo' },
      { id: 'papel', nombre: 'Papel', color: 'azul' },
      { id: 'carton', nombre: 'Cartón', color: 'cafe' },
    ]
  ).map((c) => ({
    ...c,
    estado: !feedback
      ? 'idle'
      : c.id === feedback.contenedor_correcto
        ? 'correct'
        : c.id === feedback.contenedor_id
          ? 'wrong'
          : 'idle',
  }))

  const mostrarPicker = (!mision && !game.cargando && !localMissionId) || pickerAbierto

  // Qué dice el guía y cómo se siente, según lo que esté pasando.
  let mensaje: string
  let mood: Mood = 'idle'
  let accion: { label: string; onClick: () => void; disabled?: boolean } | undefined

  if (educationalMission) {
    mensaje = `Estás en "${educationalMission.title}". Observa, elige y aprende con cada actividad.`
  } else if (game.error && mision) {
    mensaje = `${game.error} Revisa que el backend esté encendido.`
    mood = 'sad'
    if (feedback) accion = { label: 'Reintentar', onClick: () => void game.siguiente() }
  } else if (game.cargando) {
    mensaje = 'Preparando tu misión...'
  } else if (!mision) {
    mensaje = '¡Hola, Guardián Ambiental! Elige una misión para comenzar.'
  } else if (game.resultado) {
    // La partida terminó: el guía celebra (o anima a reintentar).
    mensaje = game.resultado.juego_completado
      ? '¡GANASTE! Completaste todas las misiones. ¡Eres un Guardián Ambiental!'
      : game.resultado.aprobada
        ? '¡Misión cumplida! Buen trabajo.'
        : 'Casi lo logras. ¡Inténtalo otra vez!'
    mood = game.resultado.aprobada ? 'happy' : 'sad'
  } else if (feedback) {
    mensaje = `${feedback.correcto ? '¡Muy bien!' : 'Ups, ese no era.'} ${feedback.explicacion} Dato: ${feedback.reutilizacion}`
    mood = feedback.correcto ? 'happy' : 'sad'
    accion = {
      label: game.esUltimo ? 'Ver resultado' : 'Siguiente',
      onClick: () => void game.siguiente(),
      disabled: game.ocupado,
    }
  } else if (residuoActual) {
    mensaje = `¿En qué contenedor va "${residuoActual.nombre}"? Haz clic en el contenedor correcto.`
  } else {
    mensaje = '¡Terminamos!'
  }

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-green-600">
      {/* Zona de juego: escena 3D con el marcador encima */}
      <div className="relative min-h-0 flex-1">
        <YardScene
          bins={bins}
          disabled={!residuoActual || !!feedback || game.ocupado || mostrarPicker}
          onChoose={(id) => void game.elegir(id)}
        />
        <Hud
          titulo={educationalMission?.title ?? mision?.titulo ?? null}
          aciertos={game.aciertos}
          faltan={game.faltan}
          residuo={residuoActual && !feedback ? residuoActual : null}
          onOpenMissions={() => setPickerAbierto(true)}
        />

        {/* Alternativa para teclado y lectores de pantalla: botones equivalentes a los contenedores */}
        {residuoActual && !feedback && (
          <div className="sr-only">
            {bins.map((b) => (
              <button key={b.id} type="button" data-sfx="none" onClick={() => void game.elegir(b.id)}>
                Contenedor {b.nombre}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Barra inferior: el guía da las instrucciones */}
      <GuidePanel mensaje={mensaje} mood={mood} accion={accion} />

      {mostrarPicker && (
        <MissionPicker
          error={game.error && !mision ? game.error : null}
          onClose={mision ? () => setPickerAbierto(false) : undefined}
          onExit={onExit}
          onPlayLocal={(id) => {
            setPickerAbierto(false)
            game.reset()
            setLocalMissionId(id)
          }}
          onPlay={(id) => {
            setPickerAbierto(false)
            setLocalMissionId(null)
            void game.start(id)
          }}
        />
      )}

      {educationalMission && (
        <EducationalMission
          mission={educationalMission}
          onClose={() => setLocalMissionId(null)}
          onComplete={() => {
            setLocalMissionId(null)
            siguientePregunta()
          }}
        />
      )}

      {game.resultado && (
        <ResultPanel
          resultado={game.resultado}
          onRetry={() => void game.start(game.resultado!.mision_id)}
          onNext={(id) => void game.start(id)}
          onMissions={game.reset}
        />
      )}

      {pregunta && <ClimateQuiz key={pregunta.id} question={pregunta} onContinue={cerrarPregunta} />}
    </main>
  )
}
