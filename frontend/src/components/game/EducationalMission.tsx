import { useState } from 'react'
import { X } from 'lucide-react'
import { sfx } from '../../audio/sound'
import {
  REUSE_PROJECTS,
  WASTE_ITEMS,
} from '../../game/education'
import type { EducationalMission, ReuseProject, WasteDestination } from '../../game/education'

interface Props {
  mission: EducationalMission
  onClose: () => void
  onComplete: () => void
}

const DESTINATIONS: WasteDestination[] = [
  'Plástico limpio',
  'Papel limpio',
  'Cartón limpio',
  'Metales',
  'Orgánicos',
  'Revisar ruta local',
]

const FUENTES_REUTILIZABLES = {
  papel: [
    { name: 'Hoja usada limpia y seca', emoji: '📄', safe: true },
    { name: 'Papel mojado o con grasa', emoji: '🧻', safe: false, note: 'El papel mojado o grasoso no sirve para esta manualidad ni debe mezclarse con papel limpio.' },
  ],
  carton: [
    { name: 'Caja de cartón limpia y seca', emoji: '📦', safe: true },
    { name: 'Cartón húmedo o con grasa', emoji: '🗃️', safe: false, note: 'El cartón húmedo o grasoso pierde calidad para reutilizarse en esta actividad.' },
  ],
  plastico: [
    { name: 'Botella que solo tuvo agua', emoji: '🧴', safe: true },
    { name: 'Envase que tuvo limpiador', emoji: '🧪', safe: false, note: 'No uses envases que hayan tenido sustancias peligrosas para manualidades o alimentos.' },
  ],
}

type ReuseStage = 'source' | 'project' | 'materials' | 'make' | 'result'

export default function EducationalMission({ mission, onClose, onComplete }: Props) {
  const [itemIndex, setItemIndex] = useState(0)
  const [answer, setAnswer] = useState<string | null>(null)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [missionComplete, setMissionComplete] = useState(false)
  const [reuseStage, setReuseStage] = useState<ReuseStage>('source')
  const [sourceWarning, setSourceWarning] = useState<string | null>(null)
  const [project, setProject] = useState<ReuseProject | null>(null)
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [materialsWarning, setMaterialsWarning] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)

  const item = WASTE_ITEMS[itemIndex]
  const reuseProjects = mission.material ? REUSE_PROJECTS[mission.material] : []

  function chooseAnswer(value: string) {
    if (answer !== null || !item) return
    setAnswer(value)
    const esCorrecta = (mission.kind === 'identify' && value === item.material)
      || (mission.kind === 'sort' && value === item.destination)
    if (esCorrecta) {
      setCorrectAnswers((score) => score + 1)
      sfx.educationalCorrect()
    } else {
      sfx.educationalWrong()
    }
  }

  function nextItem() {
    if (itemIndex === WASTE_ITEMS.length - 1) {
      setMissionComplete(true)
      return
    }
    setItemIndex((index) => index + 1)
    setAnswer(null)
  }

  function chooseSource(index: number) {
    const source = mission.material && FUENTES_REUTILIZABLES[mission.material][index]
    if (!source) return
    if (!source.safe) {
      setSourceWarning(source.note ?? 'Elige un material limpio y seguro para continuar.')
      sfx.educationalWrong()
      return
    }
    setSourceWarning(null)
    setReuseStage('project')
  }

  function checkMaterials() {
    if (!project) return
    const required = project.materials.filter((material) => material.required).map((material) => material.id)
    const valid = required.every((id) => selectedMaterials.includes(id))
      && selectedMaterials.every((id) => project.materials.some((material) => material.id === id && material.required))
    if (!valid) {
      setMaterialsWarning('Revisa la lista: selecciona los materiales necesarios y deja los que no hacen falta.')
      sfx.educationalWrong()
      return
    }
    setMaterialsWarning(null)
    setReuseStage('make')
  }

  function completeStep() {
    if (!project) return
    if (stepIndex === project.steps.length - 1) {
      setReuseStage('result')
      sfx.craftComplete()
      return
    }
    setStepIndex((step) => step + 1)
  }

  const progress = mission.kind === 'reuse'
    ? ['source', 'project', 'materials', 'make', 'result'].indexOf(reuseStage) + 1
    : itemIndex + 1
  const totalSteps = mission.kind === 'reuse' ? 5 : 2

  return (
    <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="education-title"
        className="animate-pop max-h-full w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold text-green-700">
              {mission.kind === 'reuse' ? `Paso ${progress} de ${totalSteps}` : `Objeto ${progress} de ${WASTE_ITEMS.length}`}
            </p>
            <h2 id="education-title" className="text-xl font-black text-eco-dark sm:text-2xl">{mission.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{mission.description}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar actividad" className="cursor-pointer rounded-xl bg-slate-100 p-2 text-eco-dark hover:bg-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {(mission.kind === 'identify' || mission.kind === 'sort') && item && !missionComplete && (
          <div className="mt-5">
            <div className="mt-2 rounded-2xl bg-emerald-50 p-4 text-center">
              <span className="text-5xl" role="img" aria-label={item.name}>{item.emoji}</span>
              <h3 className="mt-2 text-lg font-black text-eco-dark">{item.name}</h3>
              <p className="mt-1 text-sm text-slate-600">Condición: {item.condition}</p>
            </div>

            {answer === null ? (
              <>
                <p className="mt-4 font-bold text-slate-800">
                  {mission.kind === 'identify' ? '¿De qué material está hecho?' : '¿Qué ruta es adecuada para este objeto?'}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {(mission.kind === 'identify'
                    ? [...new Set(WASTE_ITEMS.map((entry) => entry.material))]
                    : DESTINATIONS
                  ).map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => chooseAnswer(choice)}
                      className="cursor-pointer rounded-xl border-2 border-slate-200 p-3 text-sm font-bold text-eco-dark transition hover:border-green-500 hover:bg-green-50"
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4" aria-live="polite">
                <p className={`font-black ${answer === (mission.kind === 'identify' ? item.material : item.destination) ? 'text-green-700' : 'text-amber-800'}`}>
                  {answer === (mission.kind === 'identify' ? item.material : item.destination)
                    ? '¡Así es!'
                    : `La respuesta es: ${mission.kind === 'identify' ? item.material : item.destination}.`}
                </p>
                <p className="mt-1 text-sm text-slate-700">{item.explanation}</p>
                <p className="mt-2 text-sm font-bold text-green-800">
                  {answer === (mission.kind === 'identify' ? item.material : item.destination)
                    ? '+10 puntos'
                    : 'No pierdes puntos: revisa la explicación y continúa aprendiendo.'}
                </p>
                {mission.kind === 'sort' && item.destination === 'Revisar ruta local' && (
                  <p className="mt-2 text-sm font-semibold text-amber-900">La clasificación puede depender de la ruta local; no supongas que todo material se aprovecha.</p>
                )}
                <button type="button" onClick={nextItem} className="mt-3 w-full cursor-pointer rounded-xl bg-eco-green px-4 py-3 font-black text-white hover:bg-green-500">
                  {itemIndex === WASTE_ITEMS.length - 1 ? 'Terminar y responder pregunta' : 'Siguiente objeto'}
                </button>
              </div>
            )}
            <p className="mt-3 text-center text-xs font-semibold text-slate-500">Aciertos: {correctAnswers} · Puntos: {correctAnswers * 10}</p>
          </div>
        )}

        {missionComplete && (
          <div className="mt-5 rounded-2xl bg-emerald-50 p-5 text-center">
            <p className="text-4xl" aria-hidden="true">🌿</p>
            <h3 className="mt-2 text-xl font-black text-eco-dark">¡Actividad terminada!</h3>
            <p className="mt-2 font-bold text-green-800">{correctAnswers} aciertos · {correctAnswers * 10} puntos</p>
            <p className="mt-1 text-sm text-slate-700">Cada explicación ayuda a tomar mejores decisiones. No hay penalización por aprender.</p>
            <button type="button" onClick={onComplete} className="mt-4 w-full cursor-pointer rounded-xl bg-eco-green px-4 py-3 font-black text-white hover:bg-green-500">
              Responder pregunta ambiental
            </button>
          </div>
        )}

        {mission.kind === 'reuse' && mission.material && reuseStage === 'source' && (
          <div className="mt-5">
            <h3 className="font-black text-slate-800">1. Elige un material recuperado, limpio y seguro</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {FUENTES_REUTILIZABLES[mission.material].map((source, index) => (
                <button key={source.name} type="button" onClick={() => chooseSource(index)} className="cursor-pointer rounded-2xl border-2 border-slate-200 p-4 text-left font-bold text-eco-dark hover:border-green-500 hover:bg-green-50">
                  <span className="mr-2 text-2xl">{source.emoji}</span>{source.name}
                </button>
              ))}
            </div>
            {sourceWarning && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900" role="alert">{sourceWarning}</p>}
          </div>
        )}

        {mission.kind === 'reuse' && reuseStage === 'project' && (
          <div className="mt-5">
            <h3 className="font-black text-slate-800">2. ¿Qué quieres elaborar?</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {reuseProjects.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setProject(option)
                    setSelectedMaterials([])
                    setMaterialsWarning(null)
                    setReuseStage('materials')
                  }}
                  className="cursor-pointer rounded-2xl border-2 border-slate-200 p-4 text-left hover:border-green-500 hover:bg-green-50"
                >
                  <span className="font-black text-eco-dark">{option.title}</span>
                  <span className="mt-1 block text-sm text-slate-600">{option.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {mission.kind === 'reuse' && reuseStage === 'materials' && project && (
          <div className="mt-5">
            <h3 className="font-black text-slate-800">3. Selecciona los materiales necesarios</h3>
            <p className="mt-1 text-sm text-slate-600">Marca solo lo que vas a necesitar para {project.title.toLowerCase()}.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {project.materials.map((material) => {
                const checked = selectedMaterials.includes(material.id)
                return (
                  <button
                    key={material.id}
                    type="button"
                    aria-pressed={checked}
                    onClick={() => setSelectedMaterials((selected) => checked ? selected.filter((id) => id !== material.id) : [...selected, material.id])}
                    className={`cursor-pointer rounded-xl border-2 p-3 text-left font-semibold ${checked ? 'border-green-600 bg-green-50 text-green-900' : 'border-slate-200 text-slate-700'}`}
                  >
                    {checked ? '✓ ' : '□ '}{material.label}
                  </button>
                )
              })}
            </div>
            {materialsWarning && <p className="mt-3 text-sm font-semibold text-amber-900" role="alert">{materialsWarning}</p>}
            <button type="button" onClick={checkMaterials} className="mt-4 w-full cursor-pointer rounded-xl bg-eco-green px-4 py-3 font-black text-white hover:bg-green-500">Revisar materiales</button>
          </div>
        )}

        {mission.kind === 'reuse' && reuseStage === 'make' && project && (
          <div className="mt-5">
            <h3 className="font-black text-slate-800">4. Completa la actividad</h3>
            {project.safetyNote && <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">{project.safetyNote}</p>}
            <div className="mt-4 rounded-2xl bg-emerald-50 p-5 text-center">
              <p className="text-sm font-bold text-green-800">Paso {stepIndex + 1} de {project.steps.length}</p>
              <p className="mt-2 text-lg font-black text-eco-dark">{project.steps[stepIndex]}</p>
              <button type="button" onClick={completeStep} className="mt-4 cursor-pointer rounded-xl bg-eco-green px-5 py-3 font-black text-white hover:bg-green-500">
                {stepIndex === project.steps.length - 1 ? 'Ver resultado' : 'Listo, siguiente paso'}
              </button>
            </div>
          </div>
        )}

        {mission.kind === 'reuse' && reuseStage === 'result' && project && (
          <div className="mt-5 rounded-2xl bg-emerald-50 p-5">
            <p className="text-4xl" aria-hidden="true">🎉</p>
            <h3 className="mt-2 text-xl font-black text-eco-dark">{project.result}</h3>
            <p className="mt-2 text-slate-700">{project.circularBenefit}</p>
            <p className="mt-3 rounded-xl bg-white/80 p-3 text-sm font-bold text-green-900">
              Economía circular: primero reducimos lo innecesario, luego reutilizamos y, cuando ya no es posible, buscamos una ruta de aprovechamiento adecuada.
            </p>
            <button type="button" onClick={onComplete} className="mt-4 w-full cursor-pointer rounded-xl bg-eco-green px-4 py-3 font-black text-white hover:bg-green-500">
              Terminar y responder pregunta
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
