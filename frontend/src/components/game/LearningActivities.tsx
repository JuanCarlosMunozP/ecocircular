import { EDUCATIONAL_MISSIONS } from '../../game/education'

interface Props {
  onChoose: (id: (typeof EDUCATIONAL_MISSIONS)[number]['id']) => void
}

export default function LearningActivities({ onChoose }: Props) {
  return (
    <section>
      <h3 className="font-black text-eco-dark">Actividades educativas · propuesta inicial</h3>
      <p className="mt-1 text-xs text-slate-600">
        Se pueden ajustar cuando esté disponible el diagnóstico ambiental de la institución.
      </p>
      <ul className="mt-2 flex flex-col gap-2">
        {EDUCATIONAL_MISSIONS.map((mission) => (
          <li key={mission.id}>
            <button
              type="button"
              onClick={() => onChoose(mission.id)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-eco-lime/40 p-3 text-left shadow transition hover:-translate-y-0.5 hover:bg-eco-lime/60 hover:shadow-md"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xl">
                {mission.icon}
              </span>
              <span>
                <span className="block font-extrabold text-eco-dark">{mission.title}</span>
                <span className="block text-xs text-slate-600">{mission.description}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
