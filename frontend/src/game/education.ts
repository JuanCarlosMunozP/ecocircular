export type EducationalMissionId =
  | 'identify-waste'
  | 'sort-waste'
  | 'reuse-paper'
  | 'reuse-cardboard'
  | 'reuse-plastic'

export type MaterialKind = 'Plástico' | 'Papel' | 'Cartón' | 'Metal' | 'Orgánico' | 'Empaque mixto'
export type WasteDestination = 'Plástico limpio' | 'Papel limpio' | 'Cartón limpio' | 'Metales' | 'Orgánicos' | 'Revisar ruta local'

export interface WasteItem {
  id: string
  name: string
  emoji: string
  material: MaterialKind
  condition: string
  destination: WasteDestination
  explanation: string
}

export interface EducationalMission {
  id: EducationalMissionId
  title: string
  description: string
  icon: string
  kind: 'identify' | 'sort' | 'reuse'
  material?: 'papel' | 'carton' | 'plastico'
}

export interface ReuseProject {
  id: string
  title: string
  description: string
  materials: { id: string; label: string; required: boolean }[]
  steps: string[]
  result: string
  circularBenefit: string
  safetyNote?: string
}

export const WASTE_ITEMS: WasteItem[] = [
  {
    id: 'bottle-clean',
    name: 'Botella de agua limpia',
    emoji: '🧴',
    material: 'Plástico',
    condition: 'Limpia y seca',
    destination: 'Plástico limpio',
    explanation: 'Es plástico. Si está vacía, limpia y seca, puede entregarse a una ruta de aprovechamiento disponible en la comunidad.',
  },
  {
    id: 'paper-sheet',
    name: 'Hoja de cuaderno usada',
    emoji: '📄',
    material: 'Papel',
    condition: 'Limpia y seca; puede usarse por ambas caras',
    destination: 'Papel limpio',
    explanation: 'Es papel. Primero puedes aprovechar la cara libre para escribir o crear; cuando ya no sirva, sepárala limpia y seca.',
  },
  {
    id: 'cardboard-box',
    name: 'Caja de cartón',
    emoji: '📦',
    material: 'Cartón',
    condition: 'Limpia y seca',
    destination: 'Cartón limpio',
    explanation: 'Es cartón. Puedes reutilizarla como organizador; si ya no la necesitas, aplánala y sepárala limpia y seca.',
  },
  {
    id: 'metal-can',
    name: 'Lata vacía',
    emoji: '🥫',
    material: 'Metal',
    condition: 'Vacía, limpia y sin bordes peligrosos al manipularla',
    destination: 'Metales',
    explanation: 'Es metal. Su aprovechamiento depende de que esté vacía y de las rutas que existan en la comunidad.',
  },
  {
    id: 'snack-wrapper',
    name: 'Empaque de mecato',
    emoji: '🍬',
    material: 'Empaque mixto',
    condition: 'Puede combinar varias capas de materiales',
    destination: 'Revisar ruta local',
    explanation: 'Algunos empaques tienen capas mezcladas y no se recuperan como plástico común. Revisa la ruta local; no lo mezcles con reciclables limpios.',
  },
  {
    id: 'banana-peel',
    name: 'Cáscara de fruta',
    emoji: '🍌',
    material: 'Orgánico',
    condition: 'Residuo orgánico separado de empaques',
    destination: 'Orgánicos',
    explanation: 'Es un residuo orgánico. Puede ir a compostaje si la comunidad cuenta con esa opción; evita mezclarla con papel y cartón.',
  },
  {
    id: 'greasy-cardboard',
    name: 'Cartón manchado de grasa',
    emoji: '🧻',
    material: 'Cartón',
    condition: 'Contaminado con grasa',
    destination: 'Revisar ruta local',
    explanation: 'Aunque es cartón, la grasa puede afectar su recuperación. No lo juntes con cartón limpio; consulta la orientación local.',
  },
  {
    id: 'cleaner-container',
    name: 'Envase que tuvo limpiador',
    emoji: '🧪',
    material: 'Plástico',
    condition: 'Pudo contener una sustancia peligrosa',
    destination: 'Revisar ruta local',
    explanation: 'El material es plástico, pero su contenido anterior cambia cómo se maneja. No lo reutilices ni lo uses para alimentos; pide orientación a una persona adulta.',
  },
]

export const EDUCATIONAL_MISSIONS: EducationalMission[] = [
  {
    id: 'identify-waste',
    title: 'Detectives de materiales',
    description: 'Observa objetos cotidianos y descubre de qué están hechos.',
    icon: '🔎',
    kind: 'identify',
  },
  {
    id: 'sort-waste',
    title: 'Cada residuo en su ruta',
    description: 'Clasifica objetos limpios y aprende qué hacer con los contaminados.',
    icon: '♻️',
    kind: 'sort',
  },
  {
    id: 'reuse-paper',
    title: 'Taller de papel',
    description: 'Crea una tarjeta o un separador con papel usado.',
    icon: '✂️',
    kind: 'reuse',
    material: 'papel',
  },
  {
    id: 'reuse-cardboard',
    title: 'Taller de cartón',
    description: 'Convierte cartón limpio en un organizador o portalápices.',
    icon: '📦',
    kind: 'reuse',
    material: 'carton',
  },
  {
    id: 'reuse-plastic',
    title: 'Taller de botellas',
    description: 'Explora una matera o un semillero con una botella segura.',
    icon: '🌱',
    kind: 'reuse',
    material: 'plastico',
  },
]

export const REUSE_PROJECTS: Record<NonNullable<EducationalMission['material']>, ReuseProject[]> = {
  papel: [
    {
      id: 'paper-card',
      title: 'Tarjeta para alguien especial',
      description: 'Pliega una hoja usada y decórala para darle una nueva función.',
      materials: [
        { id: 'colors', label: 'Lápices de colores', required: true },
        { id: 'glue', label: 'Pegante en barra', required: false },
        { id: 'plastic-wrap', label: 'Envoltura plástica', required: false },
      ],
      steps: ['Dobla la hoja limpia por la mitad.', 'Escribe o dibuja un mensaje por la cara libre.', 'Decora sin cubrir toda la hoja.'],
      result: '¡Tu tarjeta está lista para compartir!',
      circularBenefit: 'Al usar una hoja que ya existía, prolongas su vida útil y reduces la necesidad de tomar papel nuevo para esta actividad.',
    },
    {
      id: 'paper-bookmark',
      title: 'Separador de libros',
      description: 'Aprovecha una franja de papel usado para marcar tus lecturas.',
      materials: [
        { id: 'colors', label: 'Lápices de colores', required: true },
        { id: 'string', label: 'Un trozo de lana reutilizada', required: false },
        { id: 'glitter', label: 'Brillantina nueva', required: false },
      ],
      steps: ['Pliega una franja de papel para darle firmeza.', 'Dibuja una figura sencilla.', 'Si tienes lana recuperada, úsala como detalle.'],
      result: '¡Ya tienes un separador para tu próxima lectura!',
      circularBenefit: 'Reutilizar papel antes de reciclarlo ayuda a aprovechar mejor los materiales y evita generar un residuo antes de tiempo.',
    },
  ],
  carton: [
    {
      id: 'cardboard-organizer',
      title: 'Caja organizadora',
      description: 'Transforma una caja limpia en un lugar para guardar útiles.',
      materials: [
        { id: 'colors', label: 'Lápices de colores', required: true },
        { id: 'tape', label: 'Cinta reutilizable', required: true },
        { id: 'glue', label: 'Pegante en barra', required: false },
      ],
      steps: ['Revisa que la caja esté limpia y seca.', 'Refuerza las uniones con cinta.', 'Decora y guarda allí tus útiles.'],
      result: '¡Tu organizador está listo!',
      circularBenefit: 'Dar otro uso al cartón aplaza su descarte. Cuando ya no pueda usarse, sepáralo limpio y seco según la ruta local.',
    },
    {
      id: 'cardboard-pencil-holder',
      title: 'Portalápices',
      description: 'Usa un tubo de cartón y una base ya preparada.',
      materials: [
        { id: 'tube', label: 'Tubo de cartón limpio', required: true },
        { id: 'base', label: 'Base de cartón ya cortada', required: true },
        { id: 'tape', label: 'Cinta reutilizable', required: true },
        { id: 'glitter', label: 'Brillantina nueva', required: false },
      ],
      steps: ['Une el tubo a la base preparada con cinta.', 'Comprueba que se sostenga sobre la mesa.', 'Decóralo con materiales que ya tengas.'],
      result: '¡Tu portalápices quedó listo para usar!',
      circularBenefit: 'El cartón limpio puede tener una segunda vida en la escuela antes de buscar su reciclaje.',
      safetyNote: 'Usa piezas previamente preparadas; pide ayuda adulta si necesitas cortar cartón.',
    },
  ],
  plastico: [
    {
      id: 'plastic-seedling-pot',
      title: 'Semillero para la huerta',
      description: 'Prepara una botella de agua limpia como recipiente temporal para una planta.',
      materials: [
        { id: 'soil', label: 'Tierra para sembrar', required: true },
        { id: 'seed', label: 'Una semilla', required: true },
        { id: 'water', label: 'Un poco de agua', required: true },
        { id: 'cleaner-container', label: 'Envase que tuvo limpiador', required: false },
      ],
      steps: ['Pide a una persona adulta preparar una botella de agua limpia.', 'Coloca tierra y una semilla en el recipiente.', 'Riega con poca agua y cuida el brote.'],
      result: '¡Tu semillero puede comenzar a crecer!',
      circularBenefit: 'La reutilización da un uso temporal a un objeto; después, la botella puede requerir otra ruta de aprovechamiento.',
      safetyNote: 'Usa solo una botella que haya contenido agua. Una persona adulta debe cortarla y hacer los orificios. Nunca reutilices envases de sustancias peligrosas ni guardes alimentos en botellas no aptas para ello.',
    },
  ],
}
