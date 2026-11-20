import { useEffect, useState } from 'react'
import StartScreen from './components/StartScreen'
import GameScreen from './components/game/GameScreen'
import SoundToggle from './audio/SoundToggle'
import { sfx, unlock } from './audio/sound'

// Dos pantallas: la portada y el juego (todo el juego ocurre en una sola pantalla).
type Screen = 'inicio' | 'juego'

function useAudioSetup() {
  useEffect(() => {
    // Desbloquear en pointerdown/keydown, dentro del gesto del usuario y antes
    // de que los manejadores React reproduzcan sus efectos.
    const onGesture = () => unlock()
    const onClick = (e: MouseEvent) => {
      unlock()
      const boton = (e.target as HTMLElement).closest('button')
      if (boton && boton.dataset.sfx !== 'none') sfx.click()
    }
    document.addEventListener('pointerdown', onGesture, true)
    document.addEventListener('keydown', onGesture, true)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('pointerdown', onGesture, true)
      document.removeEventListener('keydown', onGesture, true)
      document.removeEventListener('click', onClick)
    }
  }, [])
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('inicio')
  useAudioSetup()

  return (
    <>
      <SoundToggle />
      {screen === 'inicio' ? (
        <StartScreen onStart={() => setScreen('juego')} />
      ) : (
        <GameScreen onExit={() => setScreen('inicio')} />
      )}
    </>
  )
}
