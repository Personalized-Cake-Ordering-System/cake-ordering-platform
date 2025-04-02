'use client'
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ModelGLB } from '@/components/3d-custom/modelGLB';
import { Controls } from '@/components/3d-custom/controls';
import { TextureControls } from '@/components/3d-custom/texture-controls';
import TextControls from '@/components/3d-custom/text-controls';
import { ToastContainer } from '@/components/3d-custom/toast-save-show';
import CakeCustomizer from '@/components/3d-custom/cake-customize';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Square } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useCakeConfigStore } from '@/components/shared/client/stores/cake-config';

export default function Model3DCustom() {
    const [view, setView] = useState<'2D' | '3D'>('2D');
    const { addToCart, items, editCartItem } = useCart();
    const { config, setConfig } = useCakeConfigStore();

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
            {/* View Toggle Button */}
            <div className="fixed top-4 right-4 z-50">
                <motion.div
                    className="bg-white rounded-full shadow-lg p-2"
                    whileHover={{ scale: 1.05 }}
                >
                    <button
                        onClick={() => setView(view === '2D' ? '3D' : '2D')}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium"
                    >
                        {view === '2D' ? (
                            <>
                                <Box className="w-5 h-5" />
                                Switch to 3D
                            </>
                        ) : (
                            <>
                                <Square className="w-5 h-5" />
                                Switch to 2D
                            </>
                        )}
                    </button>
                </motion.div>
            </div>

            <AnimatePresence mode="wait">
                {view === '2D' ? (
                    <motion.div
                        key="2d"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* <CakeCustomizer /> */}
                    </motion.div>
                ) : (
                    <motion.div
                        key="3d"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex h-screen"
                    >
                        <div className="w-1/4 p-4 overflow-y-auto bg-white/90 backdrop-blur shadow-xl">
                            <div className="space-y-6">
                                {/* Cake Customization Section */}
                                <div className="bg-white rounded-lg p-4 shadow-md">
                                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Cake Customization</h2>
                                    <Controls />
                                </div>

                                {/* 3D Controls Section */}
                                <div className="bg-white rounded-lg p-4 shadow-md">
                                    <h2 className="text-xl font-semibold mb-4 text-gray-800">3D View Settings</h2>
                                    <TextureControls />
                                    <TextControls />
                                </div>
                            </div>
                        </div>
                        <div className="w-3/4">
                            <Canvas
                                camera={{ position: [0, 2, 5], fov: 75 }}
                                shadows
                            >
                                <ambientLight intensity={0.5} />
                                <pointLight position={[10, 10, 10]} intensity={1} />
                                <spotLight
                                    position={[-10, 10, -10]}
                                    angle={0.3}
                                    penumbra={1}
                                    intensity={1}
                                    castShadow
                                />
                                <ModelGLB
                                    config={config}
                                    addToCart={addToCart}
                                    editCartItem={editCartItem}
                                    items={items}
                                />
                                <OrbitControls
                                    enableZoom={true}
                                    enablePan={true}
                                    enableRotate={true}
                                    minDistance={2}
                                    maxDistance={10}
                                />
                            </Canvas>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Toast Container */}
            <ToastContainer />
        </div>
    );
}