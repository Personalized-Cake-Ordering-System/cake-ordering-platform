'use client'
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ModelGLB } from '@/components/3d-custom/modelGLB';
import { Controls } from '@/components/3d-custom/controls';
import { TextureControls } from '@/components/3d-custom/texture-controls';
import TextControls from '@/components/3d-custom/text-controls';
import ToppingControls from '@/components/3d-custom/topping-controls';
import { ToastContainer } from '@/components/3d-custom/toast-save-show';


export default function Model3DCustom() {
    return (
        <div className="flex h-screen">
            <div className="w-1/4 p-4 overflow-y-auto bg-gray-50">
                <Controls />
                <TextureControls />
                <TextControls />
                <ToppingControls />
            </div>
            <div className="w-3/4">
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 75 }}
                    shadows
                >
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <ModelGLB />
                    <OrbitControls />
                </Canvas>
            </div>

            {/* Global Toast Container - mounted once at app level */}
            <ToastContainer />
        </div>
    );
}