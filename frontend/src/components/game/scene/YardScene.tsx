import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { CanvasTexture } from 'three'
import type { Group } from 'three'

// Patio low-poly (estilo de la referencia): cielo, nubes, cerca de madera,
// árboles, farola y una fila de contenedores en los que se hace clic.

export type BinEstado = 'idle' | 'correct' | 'wrong'

export interface BinInfo {
  id: string
  nombre: string
  color: string // nombre de color que envía el backend
  estado: BinEstado
}

interface Props {
  bins: BinInfo[]
  disabled: boolean
  onChoose: (id: string) => void
}

const COLORES_BIN: Record<string, string> = {
  amarillo: '#e0b72a',
  azul: '#2f5fb0',
  cafe: '#8b5a2b',
}
const ESPACIO = 2.5

// ---------- Contenedor ----------
function crearTextura(nombre: string): CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  g.fillStyle = '#ffffff'
  g.textAlign = 'center'
  g.font = '130px sans-serif'
  g.fillText('♻', 128, 130)
  g.font = 'bold 44px sans-serif'
  g.fillText(nombre.toUpperCase(), 128, 220)
  return new CanvasTexture(c)
}

function Bin({
  bin,
  x,
  disabled,
  onChoose,
}: {
  bin: BinInfo
  x: number
  disabled: boolean
  onChoose: (id: string) => void
}) {
  const ref = useRef<Group>(null)
  const [hover, setHover] = useState(false)
  const textura = useMemo(() => crearTextura(bin.nombre), [bin.nombre])
  useEffect(() => () => textura.dispose(), [textura])

  const color = COLORES_BIN[bin.color] ?? '#64748b'
  const activo = hover && !disabled

  useFrame(({ clock }) => {
    const g = ref.current
    if (!g) return
    const t = clock.getElapsedTime()
    const escala = activo ? 1.08 : 1
    g.scale.x += (escala - g.scale.x) * 0.2
    g.scale.y = g.scale.z = g.scale.x
    // Correcto: salta. Incorrecto: tiembla. Reposo: quieto.
    g.position.y = bin.estado === 'correct' ? Math.abs(Math.sin(t * 6)) * 0.25 : 0
    g.position.x = x + (bin.estado === 'wrong' ? Math.sin(t * 45) * 0.06 : 0)
  })

  const emissive = bin.estado === 'correct' ? '#22c55e' : bin.estado === 'wrong' ? '#ef4444' : '#ffffff'
  const intensidad = bin.estado !== 'idle' ? 0.55 : activo ? 0.25 : 0

  return (
    <group
      ref={ref}
      position={[x, 0, 0]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        if (!disabled) onChoose(bin.id)
      }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        setHover(true)
        if (!disabled) document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHover(false)
        document.body.style.cursor = ''
      }}
    >
      {/* cuerpo: cilindro de 4 lados girado 45° = caja que se angosta hacia abajo */}
      <mesh position={[0, 0.95, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[1, 0.8, 1.5, 4]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={intensidad} flatShading />
      </mesh>
      {/* tapa y manija */}
      <mesh position={[0, 1.78, 0]}>
        <boxGeometry args={[1.6, 0.16, 1.6]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={intensidad} flatShading />
      </mesh>
      <mesh position={[0, 1.9, 0.6]}>
        <boxGeometry args={[0.9, 0.1, 0.18]} />
        <meshStandardMaterial color="#1f2937" flatShading />
      </mesh>
      {/* ruedas */}
      {[-0.55, 0.55].map((wx) => (
        <mesh key={wx} position={[wx, 0.18, -0.5]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.14, 8]} />
          <meshStandardMaterial color="#111827" flatShading />
        </mesh>
      ))}
      {/* etiqueta con símbolo de reciclaje y nombre */}
      <mesh position={[0, 0.95, 0.68]}>
        <planeGeometry args={[0.95, 0.95]} />
        <meshBasicMaterial map={textura} transparent />
      </mesh>
    </group>
  )
}

// ---------- Decorado ----------
function Fence() {
  const tablas = Array.from({ length: 29 }, (_, i) => i)
  return (
    <group position={[0, 0, -3.2]}>
      {tablas.map((i) => (
        <mesh key={i} position={[(i - 14) * 0.62, 1.3 + (i % 3) * 0.08, 0]}>
          <boxGeometry args={[0.55, 2.6 + (i % 3) * 0.16, 0.12]} />
          <meshStandardMaterial color={['#6b5a4a', '#7a6652', '#5e4e40'][i % 3]} flatShading />
        </mesh>
      ))}
      {[0.7, 1.9].map((y) => (
        <mesh key={y} position={[0, y, 0.1]}>
          <boxGeometry args={[18, 0.2, 0.12]} />
          <meshStandardMaterial color="#54463a" flatShading />
        </mesh>
      ))}
    </group>
  )
}

function Tree({ x, z, s = 1 }: { x: number; z: number; s?: number }) {
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.18, 0.28, 1.8, 5]} />
        <meshStandardMaterial color="#5b4636" flatShading />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <icosahedronGeometry args={[1.3, 0]} />
        <meshStandardMaterial color="#3f6b3a" flatShading />
      </mesh>
      <mesh position={[0.5, 3.3, 0.2]}>
        <icosahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial color="#4f8a47" flatShading />
      </mesh>
    </group>
  )
}

function Lamp({ x }: { x: number }) {
  return (
    <group position={[x, 0, -2.6]}>
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 4.4, 5]} />
        <meshStandardMaterial color="#374151" flatShading />
      </mesh>
      <mesh position={[0.45, 4.4, 0]}>
        <boxGeometry args={[1, 0.1, 0.1]} />
        <meshStandardMaterial color="#374151" flatShading />
      </mesh>
      <mesh position={[0.9, 4.28, 0]}>
        <boxGeometry args={[0.4, 0.2, 0.3]} />
        <meshStandardMaterial color="#6b7280" flatShading />
      </mesh>
    </group>
  )
}

function Cloud({ x, y, z, s, v }: { x: number; y: number; z: number; s: number; v: number }) {
  const ref = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.x = x + Math.sin(clock.getElapsedTime() * v) * 1.2
  })
  return (
    <group ref={ref} position={[x, y, z]} scale={s}>
      {[
        [0, 0, 0, 1.2],
        [1.1, -0.1, 0, 0.9],
        [-1.1, -0.15, 0, 0.8],
      ].map(([px, py, pz, r], i) => (
        <mesh key={i} position={[px, py, pz]} scale={[1.4, 0.7, 1]}>
          <icosahedronGeometry args={[r, 0]} />
          <meshStandardMaterial color="#f8fafc" flatShading />
        </mesh>
      ))}
    </group>
  )
}

// Aleja la cámara cuando la pantalla es angosta (celular) para que quepan todos los contenedores.
function CameraRig({ cantidad }: { cantidad: number }) {
  const size = useThree((s) => s.size)
  const camera = useThree((s) => s.camera)
  useEffect(() => {
    const aspecto = size.width / size.height
    const anchoNecesario = cantidad * ESPACIO + 1.5
    const z = Math.max(7.5, anchoNecesario / (2 * Math.tan((55 * Math.PI) / 360) * aspecto))
    camera.position.set(0, 2.4, z)
    // Mirar más arriba hace que los contenedores aparezcan más abajo en la pantalla,
    // dejando libre la parte de arriba para el marcador y el residuo actual.
    camera.lookAt(0, 2.6, 0)
  }, [size, camera, cantidad])
  return null
}

export default function YardScene({ bins, disabled, onChoose }: Props) {
  const inicio = -((bins.length - 1) * ESPACIO) / 2
  return (
    <Canvas camera={{ fov: 55, position: [0, 2.4, 8] }} dpr={[1, 2]}>
      <color attach="background" args={['#7ec8f0']} />
      <fog attach="fog" args={['#bfe3f7', 18, 40]} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 8, 6]} intensity={2.2} />
      <CameraRig cantidad={Math.max(bins.length, 3)} />

      {/* suelo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[80, 40]} />
        <meshStandardMaterial color="#6aa84f" flatShading />
      </mesh>
      <mesh position={[0, 0.02, -0.2]}>
        <boxGeometry args={[Math.max(bins.length, 3) * ESPACIO + 2, 0.04, 3.4]} />
        <meshStandardMaterial color="#b9b2a4" flatShading />
      </mesh>

      <Fence />
      <Tree x={-7.5} z={-2.4} s={1.3} />
      <Tree x={8} z={-2.6} s={1.1} />
      <Lamp x={-4.5} />
      <Lamp x={5.5} />
      <Cloud x={-5} y={7} z={-8} s={1.2} v={0.15} />
      <Cloud x={4} y={8.5} z={-10} s={1.5} v={0.1} />
      <Cloud x={9} y={6.5} z={-9} s={1} v={0.2} />

      {bins.map((bin, i) => (
        <Bin key={bin.id} bin={bin} x={inicio + i * ESPACIO} disabled={disabled} onChoose={onChoose} />
      ))}
    </Canvas>
  )
}
