import { useRef } from 'react'
import type { ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { Group } from 'three'

// Escena 3D low-poly: una pequeña isla con árboles, contenedores,
// objetos flotando y un personaje guía. Todo se arma con formas básicas
// de Three.js (conos, cilindros, cajas, esferas), sin modelos externos.
// `flatShading` + pocos segmentos dan el aspecto "low-poly".

type Vec3 = [number, number, number]

function Tree({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.6, 5]} />
        <meshStandardMaterial color="#92400e" flatShading />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <coneGeometry args={[0.4, 0.8, 6]} />
        <meshStandardMaterial color="#16a34a" flatShading />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <coneGeometry args={[0.3, 0.6, 6]} />
        <meshStandardMaterial color="#22c55e" flatShading />
      </mesh>
    </group>
  )
}

// Contenedor de reciclaje (el color indica el tipo de residuo).
function Bin({ position, color }: { position: Vec3; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.28, 0.22, 0.6, 6]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh position={[0, 0.64, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.08, 6]} />
        <meshStandardMaterial color="#334155" flatShading />
      </mesh>
    </group>
  )
}

// Objeto que flota y gira suavemente. useFrame se ejecuta en cada
// fotograma: ahí se actualiza la posición según el tiempo transcurrido.
function Floating({ position, speed = 1, children }: { position: Vec3; speed?: number; children: ReactNode }) {
  const ref = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime() * speed
    ref.current.position.y = position[1] + Math.sin(t) * 0.12
    ref.current.rotation.y = t * 0.8
  })
  return (
    <group ref={ref} position={position}>
      {children}
    </group>
  )
}

function Bottle() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.1, 0.1, 0.32, 6]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.85} flatShading />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.04, 0.08, 0.12, 6]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.85} flatShading />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.05, 6]} />
        <meshStandardMaterial color="#f97316" flatShading />
      </mesh>
    </group>
  )
}

// Caja (cartón o papel según el color).
function Box({ color }: { color: string }) {
  return (
    <mesh>
      <boxGeometry args={[0.28, 0.22, 0.28]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  )
}

// Personaje guía: una pequeña criatura-hoja que salta y mira alrededor.
function Guide({ position }: { position: Vec3 }) {
  const ref = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.position.y = position[1] + Math.abs(Math.sin(t * 2)) * 0.08
    ref.current.rotation.y = Math.sin(t * 0.8) * 0.4
  })
  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.32, 7, 6]} />
        <meshStandardMaterial color="#bef264" flatShading />
      </mesh>
      <mesh position={[-0.11, 0.42, 0.27]}>
        <sphereGeometry args={[0.05, 6, 5]} />
        <meshStandardMaterial color="#064e3b" flatShading />
      </mesh>
      <mesh position={[0.11, 0.42, 0.27]}>
        <sphereGeometry args={[0.05, 6, 5]} />
        <meshStandardMaterial color="#064e3b" flatShading />
      </mesh>
      <mesh position={[0, 0.78, 0]} rotation={[0, 0, 0.3]} scale={[0.6, 1, 0.3]}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#16a34a" flatShading />
      </mesh>
    </group>
  )
}

function Island() {
  const ref = useRef<Group>(null)
  // La isla gira muy despacio para dar sensación de vida.
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.12
  })
  return (
    <group ref={ref}>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[2.6, 1.9, 1, 9]} />
        <meshStandardMaterial color="#a16207" flatShading />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[2.6, 2.6, 0.1, 9]} />
        <meshStandardMaterial color="#4ade80" flatShading />
      </mesh>

      <Tree position={[-1.8, 0.05, -0.6]} scale={1.2} />
      <Tree position={[-1.2, 0.05, -1.6]} />
      <Tree position={[1.9, 0.05, -0.8]} scale={1.3} />
      <Tree position={[1.1, 0.05, -1.8]} scale={0.9} />

      <Bin position={[-0.7, 0.05, 1.3]} color="#facc15" />
      <Bin position={[0, 0.05, 1.5]} color="#3b82f6" />
      <Bin position={[0.7, 0.05, 1.3]} color="#a16207" />

      <Guide position={[1.5, 0.05, 0.7]} />

      <Floating position={[-1.2, 1.4, 0.4]} speed={1.2}>
        <Bottle />
      </Floating>
      <Floating position={[0.3, 1.8, 0]} speed={0.9}>
        <Box color="#d6a867" />
      </Floating>
      <Floating position={[1.2, 1.3, -0.4]} speed={1.4}>
        <Box color="#f8fafc" />
      </Floating>
    </group>
  )
}

export default function EcoScene() {
  return (
    <Canvas camera={{ position: [0, 3.2, 7.5], fov: 45 }} dpr={[1, 2]}>
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 6, 3]} intensity={2.2} />
      <group position={[0, -0.6, 0]}>
        <Island />
      </group>
    </Canvas>
  )
}
