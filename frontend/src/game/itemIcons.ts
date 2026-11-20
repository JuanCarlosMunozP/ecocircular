// Emoji de cada residuo, solo para la presentación visual.
// (El backend decide en qué contenedor va cada uno; esto no revela nada.)
const ICONOS: Record<string, string> = {
  botella_gaseosa: '🥤',
  bolsa_plastica: '🛍️',
  envase_yogur: '🥛',
  tapa_botella: '🔴',
  vaso_desechable: '🥤',
  bidon_agua: '🚰',
  hoja_cuaderno: '📄',
  periodico: '📰',
  revista: '📖',
  sobre_carta: '✉️',
  folleto: '📑',
  papel_impresora: '🖨️',
  caja_cereal: '🥣',
  caja_huevos: '🥚',
  tubo_papel: '🧻',
  caja_zapatos: '👟',
  caja_corrugada: '📦',
  empaque_galletas: '🍪',
}

export const iconoResiduo = (id: string) => ICONOS[id] ?? '📦'
