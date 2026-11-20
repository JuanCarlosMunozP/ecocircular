import { Recycle } from 'lucide-react'

export default function Logo() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="animate-float mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-eco-green shadow-[0_5px_0_#15803d] sm:h-20 sm:w-20">
        <Recycle className="h-10 w-10 text-white sm:h-12 sm:w-12" strokeWidth={2.5} />
      </div>
      <h1 className="text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_0_rgba(6,78,59,0.8)] sm:text-7xl">
        Eco<span className="text-eco-lime">Circular</span>
      </h1>
      <p className="mt-1 rounded-full bg-white/90 px-4 py-1 text-sm font-extrabold uppercase tracking-[0.25em] text-eco-dark sm:text-base">
        Misión Reciclaje
      </p>
    </div>
  )
}
