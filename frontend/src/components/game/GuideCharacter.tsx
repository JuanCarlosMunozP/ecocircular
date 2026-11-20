// Personaje guía 2D animado (SVG + animaciones CSS, ver index.css).
//
// Está aislado en este componente a propósito: si más adelante se dibuja o
// renderiza en Blender, basta con reemplazar el contenido por <img> con los
// frames exportados, manteniendo las mismas props (mood y talking).

export type Mood = 'idle' | 'happy' | 'sad'

interface Props {
  mood: Mood
  talking: boolean
  className?: string
}

const PIEL = '#fcd9b6'
const CAMISETA = '#22c55e'

export default function GuideCharacter({ mood, talking, className }: Props) {
  return (
    <svg viewBox="0 0 120 160" className={className} role="img" aria-label="Guía ambiental">
      <ellipse cx="60" cy="152" rx="34" ry="6" fill="rgba(0,0,0,0.18)" />

      {/* Todo el cuerpo "respira"; si está feliz, salta */}
      <g className={mood === 'happy' ? 'guide-jump' : mood === 'sad' ? '' : 'guide-bob'}>
        {/* piernas y zapatos */}
        <rect x="44" y="118" width="14" height="28" rx="6" fill="#3b82f6" />
        <rect x="62" y="118" width="14" height="28" rx="6" fill="#3b82f6" />
        <ellipse cx="51" cy="147" rx="11" ry="5" fill="#1f2937" />
        <ellipse cx="69" cy="147" rx="11" ry="5" fill="#1f2937" />

        {/* brazo izquierdo */}
        <rect x="24" y="80" width="14" height="36" rx="7" fill={CAMISETA} />
        <circle cx="31" cy="118" r="7" fill={PIEL} />

        {/* torso con símbolo de reciclaje */}
        <rect x="36" y="74" width="48" height="52" rx="16" fill={CAMISETA} />
        <text x="60" y="110" fontSize="26" textAnchor="middle" fill="#ffffff">
          ♻
        </text>

        {/* brazo derecho: saluda al hablar o al celebrar */}
        <g className={talking || mood === 'happy' ? 'guide-wave' : ''}>
          <rect x="82" y="80" width="14" height="36" rx="7" fill={CAMISETA} />
          <circle cx="89" cy="118" r="7" fill={PIEL} />
        </g>

        {/* cabeza */}
        <g className={mood === 'sad' ? 'guide-droop' : ''}>
          <circle cx="60" cy="48" r="28" fill={PIEL} />
          <path d="M32 46 Q32 20 60 20 Q88 20 88 46 Q74 33 60 36 Q46 33 32 46Z" fill="#7c4a1e" />
          {/* brote de hoja en la cabeza */}
          <path d="M60 22 L60 12" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
          <path d="M60 14 C60 2 76 -1 80 5 C74 13 66 16 60 14Z" fill="#16a34a" />
          <path d="M60 14 C60 4 46 2 42 8 C48 14 54 16 60 14Z" fill="#4ade80" />

          {/* ojos */}
          <ellipse cx="49" cy="50" rx="3.5" ry="4.5" fill="#1f2937" className="guide-blink" />
          <ellipse cx="71" cy="50" rx="3.5" ry="4.5" fill="#1f2937" className="guide-blink" />
          <circle cx="42" cy="58" r="4" fill="#fda4af" opacity="0.7" />
          <circle cx="78" cy="58" r="4" fill="#fda4af" opacity="0.7" />

          {/* boca según el estado de ánimo */}
          {talking ? (
            <ellipse cx="60" cy="64" rx="6" ry="5" fill="#7f1d1d" className="guide-talk" />
          ) : mood === 'happy' ? (
            <path d="M49 60 Q60 76 71 60Z" fill="#7f1d1d" />
          ) : mood === 'sad' ? (
            <path d="M52 68 Q60 60 68 68" fill="none" stroke="#7f1d1d" strokeWidth="3" strokeLinecap="round" />
          ) : (
            <path d="M52 62 Q60 69 68 62" fill="none" stroke="#7f1d1d" strokeWidth="3" strokeLinecap="round" />
          )}
        </g>
      </g>
    </svg>
  )
}
