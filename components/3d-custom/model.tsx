// import { useRef } from 'react'
// import { useFrame } from '@react-three/fiber'
// import { useCustomizationStore } from '../store/customization'
// import * as THREE from 'three'

// export function Model() {
//     const mesh = useRef<THREE.Mesh>(null!)
//     const { color, scale } = useCustomizationStore()

//     useFrame((state, delta) => {
//         mesh.current.rotation.y += delta * 0.5
//     })

//     return (
//         <mesh ref={mesh} scale={[scale, scale, scale]}>
//             <boxGeometry args={[1, 1, 1]} />
//             {/* <sphereGeometry args={[0.5, 32, 32]} /> */}
//             <meshStandardMaterial color={color} />
//         </mesh>
//     )
// }