import { Play } from 'lucide-react'
import { sfx } from '../audio/sound'

interface Props {
  onClick: () => void
}

export default function MissionButton({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={() => {
        sfx.start()
        onClick()
      }}
      data-sfx="none"
      className="animate-pulse-glow flex cursor-pointer items-center gap-3 rounded-2xl bg-eco-green px-8 py-4 text-xl font-black tracking-wide text-white transition-all duration-150 hover:-translate-y-1 hover:scale-105 hover:bg-green-400 active:translate-y-1 active:scale-95 sm:px-12 sm:text-2xl"
    >
      <Play className="h-6 w-6 fill-white" />
      COMENZAR MISIÓN
    </button>
  )
}
