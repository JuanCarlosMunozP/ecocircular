// Sonidos del juego generados con la Web Audio API (osciladores):
// no se necesitan archivos de audio ni librerías.
//
// Los navegadores bloquean el audio hasta que el usuario interactúa con la
// página, por eso la música arranca en el primer clic/toque (ver `unlock`).

const KEY = 'ecocircular:sonido'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let musicTimer: number | undefined
let nextNoteTime = 0
let step = 0
let unlocked = false

// ---------- Estado silenciado (con suscripción para React) ----------
function leerMuted(): boolean {
  try {
    return localStorage.getItem(KEY) === 'off'
  } catch {
    return false
  }
}

let muted = leerMuted()
const listeners = new Set<() => void>()

export const soundState = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  getSnapshot: () => muted,
}

export function setMuted(value: boolean) {
  muted = value
  try {
    localStorage.setItem(KEY, value ? 'off' : 'on')
  } catch {
    /* sin localStorage: la preferencia no se recuerda */
  }
  if (muted) stopMusic()
  else if (unlocked) startMusic()
  listeners.forEach((l) => l())
}

// ---------- Utilidades de audio ----------
function getCtx(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null
  if (!ctx) {
    ctx = new AudioContext({ latencyHint: 'interactive' })
    master = ctx.createGain()
    master.gain.value = 0.6
    master.connect(ctx.destination)
  }
  return ctx
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, vol: number) {
  if (!ctx || !master) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  // Envolvente: sube rápido y se apaga suave, para evitar "clics" molestos.
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(vol, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(gain).connect(master)
  osc.start(start)
  osc.stop(start + dur + 0.05)
}

// Reproduce una lista de notas [frecuencia, retraso, duración].
function play(notes: [number, number, number][], type: OscillatorType = 'triangle', vol = 0.25) {
  if (muted) return
  const c = getCtx()
  if (!c) return
  const reproducir = () => {
    if (muted) return
    const now = c.currentTime
    notes.forEach(([f, delay, dur]) => tone(f, now + delay, dur, type, vol))
  }
  if (c.state === 'running') {
    reproducir()
  } else {
    void c.resume().then(reproducir).catch((error: unknown) => {
      console.error('No se pudo iniciar el audio del juego.', error)
    })
  }
}

// ---------- Efectos ----------
export const sfx = {
  click: () => play([[660, 0, 0.08]], 'square', 0.08),
  start: () =>
    play(
      [
        [392, 0, 0.12],
        [523, 0.1, 0.12],
        [659, 0.2, 0.12],
        [784, 0.3, 0.3],
      ],
      'square',
      0.12,
    ),
  correct: () =>
    play(
      [
        [659, 0, 0.12],
        [880, 0.1, 0.25],
      ],
      'triangle',
      0.3,
    ),
  wrong: () =>
    play(
      [
        [220, 0, 0.18],
        [165, 0.15, 0.3],
      ],
      'sawtooth',
      0.12,
    ),
  educationalCorrect: () =>
    play(
      [
        [587, 0, 0.1],
        [784, 0.09, 0.18],
      ],
      'triangle',
      0.2,
    ),
  educationalWrong: () => play([[247, 0, 0.14]], 'triangle', 0.1),
  craftComplete: () =>
    play(
      [
        [523, 0, 0.12],
        [659, 0.1, 0.12],
        [784, 0.2, 0.28],
      ],
      'triangle',
      0.22,
    ),
  win: () =>
    play(
      [
        [523, 0, 0.15],
        [659, 0.15, 0.15],
        [784, 0.3, 0.15],
        [1047, 0.45, 0.5],
      ],
      'triangle',
      0.3,
    ),
  fail: () =>
    play(
      [
        [392, 0, 0.2],
        [330, 0.2, 0.2],
        [262, 0.4, 0.45],
      ],
      'triangle',
      0.25,
    ),
}

// ---------- Música ambiental ----------
// Arpegio suave sobre la progresión Do - La menor - Fa - Sol, en bucle.
const CHORDS = [
  [262, 330, 392, 523],
  [220, 262, 330, 440],
  [175, 220, 262, 349],
  [196, 247, 294, 392],
]
const STEP_SECONDS = 0.45

function scheduleMusic() {
  if (!ctx) return
  // Se programan las notas con un poco de anticipación para que no haya cortes.
  while (nextNoteTime < ctx.currentTime + 1) {
    const chord = CHORDS[Math.floor(step / 8) % CHORDS.length]
    const pattern = [0, 1, 2, 3, 2, 1, 2, 1]
    tone(chord[pattern[step % 8]], nextNoteTime, STEP_SECONDS * 1.6, 'sine', 0.06)
    if (step % 8 === 0) tone(chord[0] / 2, nextNoteTime, STEP_SECONDS * 6, 'sine', 0.07)
    nextNoteTime += STEP_SECONDS
    step++
  }
}

function startMusic() {
  if (muted || musicTimer !== undefined) return
  const c = getCtx()
  if (!c || c.state !== 'running') return
  nextNoteTime = c.currentTime + 0.1
  musicTimer = window.setInterval(scheduleMusic, 250)
  scheduleMusic()
}

function stopMusic() {
  if (musicTimer !== undefined) {
    clearInterval(musicTimer)
    musicTimer = undefined
  }
  // Las notas ya programadas (máx. ~1 s) terminan solas.
}

// Se llama en la primera interacción del usuario para habilitar el audio.
export function unlock() {
  unlocked = true
  const c = getCtx()
  if (!c) return
  if (c.state === 'running') {
    startMusic()
    return
  }
  void c.resume().then(startMusic).catch((error: unknown) => {
    console.error('El navegador no permitió activar el audio del juego.', error)
  })
}
