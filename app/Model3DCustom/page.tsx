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


            {/* Global Toast Container */}
            <ToastContainer />
        </div>
    );
}