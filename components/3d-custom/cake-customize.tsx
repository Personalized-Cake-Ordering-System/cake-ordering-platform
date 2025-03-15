"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Check, Save, Download } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';

// Define types for the cake configuration
type CakeConfig = {
    size: string;
    price: number;
    sponge: string;
    outerIcing: string;
    filling: string;
    topping: null;
    message: string;
    candles: string | null;
    board: string;
    goo: string | null;
    extras: string[];
    messageType: 'none' | 'piped' | 'edible';
    plaqueColor: string;
    uploadedImage: string | null;
}

// Define type for the selected part
type SelectedPart = 'cake' | 'outer-icing' | 'filling' | 'message' | 'candles' | 'board' | 'extras' | null;

// Add these types at the top with other types
type SizeOption = {
    id: string;
    name: string;
    size: string;
    price: number;
    priceChange: number;
    feeds: string;
}

type SpongeOption = {
    id: string;
    name: string;
    color: string;
    price?: number;
}

// Add these new types
type FillingOption = {
    id: string;
    name: string;
    color: string;
    price?: number;
    icon: string;
}

type GooOption = {
    id: string;
    name: string;
    color: string;
    price: number;
}

type ExtraOption = {
    id: string;
    name: string;
    price: number;
    available: boolean;
    icon: string;
    color: string;
}

// Add these new option arrays
const fillingIcingOptions: FillingOption[] = [
    {
        id: 'white-vanilla',
        name: 'WHITE VANILLA BUTTERCREAM',
        color: 'bg-white',
        icon: '≡' // Horizontal lines icon
    },
    {
        id: 'pink-vanilla',
        name: 'PINK VANILLA BUTTERCREAM',
        color: 'bg-pink-200',
        icon: '≡'
    },
    {
        id: 'blue-vanilla',
        name: 'BLUE VANILLA BUTTERCREAM',
        color: 'bg-blue-200',
        icon: '≡'
    },
    {
        id: 'yellow-vanilla',
        name: 'YELLOW VANILLA BUTTERCREAM',
        color: 'bg-yellow-100',
        icon: '≡'
    },
    {
        id: 'cream-cheese',
        name: 'CREAM CHEESE ICING',
        color: 'bg-cream-100',
        icon: '≡'
    },
    {
        id: 'chocolate',
        name: 'CHOCOLATE BUTTERCREAM',
        color: 'bg-brown-800',
        icon: '≡'
    },
    {
        id: 'salted-caramel',
        name: 'SALTED CARAMEL BUTTERCREAM',
        color: 'bg-amber-200',
        icon: '≡'
    },
    {
        id: 'raspberry',
        name: 'RASPBERRY BUTTERCREAM',
        color: 'bg-pink-300',
        icon: '≡'
    }
];

const gooOptions: GooOption[] = [
    { id: 'raspberry-jam', name: 'RASPBERRY JAM', color: 'bg-rose-300', price: 2.00 },
    { id: 'strawberry-jam', name: 'STRAWBERRY JAM', color: 'bg-rose-400', price: 2.00 },
    { id: 'salted-caramel', name: 'SALTED CARAMEL', color: 'bg-amber-300', price: 2.00 },
    { id: 'lemon-curd', name: 'LEMON CURD', color: 'bg-yellow-200', price: 2.00 }
];

const extraOptions: ExtraOption[] = [
    {
        id: 'cookie-dough',
        name: 'COOKIE DOUGH CHUNKS',
        price: 4.00,
        available: true,
        icon: '🍪',
        color: 'bg-amber-200'
    },
    {
        id: 'caramelised-white',
        name: 'CARAMELISED WHITE CHOCOLATE',
        price: 3.00,
        available: true,
        icon: '🍫',
        color: 'bg-amber-100'
    },
    {
        id: 'oreo-crumbs',
        name: 'OREO CRUMBS',
        price: 2.00,
        available: true,
        icon: '🖤',
        color: 'bg-gray-900'
    },
    {
        id: 'biscoff-crumbs',
        name: 'BISCOFF CRUMBS',
        price: 2.00,
        available: true,
        icon: '🍪',
        color: 'bg-amber-400'
    },
    {
        id: 'malted-cornflakes',
        name: 'MALTED CORNFLAKES',
        price: 3.00,
        available: true,
        icon: '🥣',
        color: 'bg-yellow-200'
    },
    {
        id: 'pinata',
        name: 'PINATA IT!',
        price: 12.00,
        available: true,
        icon: '🎨',
        color: 'bg-gradient-to-r from-pink-400 to-purple-400'
    }
];

// Add these new types
type MessageOption = {
    id: 'none' | 'piped' | 'edible';
    name: string;
    price: number;
    icon: string;
}

// Add message options
const messageOptions: MessageOption[] = [
    { id: 'none', name: 'NONE', price: 0, icon: '✖️' },
    { id: 'piped', name: 'PIPED MESSAGE', price: 7.00, icon: '✍️' },
    { id: 'edible', name: 'EDIBLE IMAGE', price: 8.00, icon: '🖼️' }
];

// Add these types
type PlaqueColor = {
    id: string;
    name: string;
    color: string;
}

// Add these options
const plaqueColors: PlaqueColor[] = [
    { id: 'white', name: 'WHITE CHOCOLATE', color: 'bg-amber-50' },
    { id: 'dark', name: 'DARK CHOCOLATE', color: 'bg-brown-900' },
    { id: 'pink', name: 'PINK CHOCOLATE', color: 'bg-pink-200' },
    { id: 'blue', name: 'BLUE CHOCOLATE', color: 'bg-blue-200' }
];

const CakeCustomizer = () => {
    // Update state definitions with proper types
    const [selectedPart, setSelectedPart] = useState<SelectedPart>(null);
    const [cakeConfig, setCakeConfig] = useState<CakeConfig>({
        size: '8"',
        price: 95.99,
        sponge: 'vanilla',
        outerIcing: 'pink-vanilla',
        filling: 'white-vanilla',
        topping: null,
        message: '',
        candles: null,
        board: 'white',
        goo: null,
        extras: [],
        messageType: 'none',
        plaqueColor: 'white',
        uploadedImage: null,
    });
    const [showJson, setShowJson] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);

    // Options for customization
    const icingOptions = [
        { id: 'white-vanilla', name: 'WHITE VANILLA BUTTERCREAM', color: 'bg-amber-50' },
        { id: 'pink-vanilla', name: 'PINK VANILLA BUTTERCREAM', color: 'bg-pink-200' },
        { id: 'blue-vanilla', name: 'BLUE VANILLA BUTTERCREAM', color: 'bg-cyan-100' },
        { id: 'yellow-vanilla', name: 'YELLOW VANILLA BUTTERCREAM', color: 'bg-yellow-200' }
    ];

    const fillingOptions = [
        { id: 'cream-cheese', name: 'CREAM CHEESE ICING', color: 'bg-amber-50' },
        { id: 'chocolate', name: 'CHOCOLATE BUTTERCREAM', color: 'bg-amber-950' },
        { id: 'salted-caramel', name: 'SALTED CARAMEL BUTTERCREAM', color: 'bg-amber-300' },
        { id: 'raspberry', name: 'RASPBERRY BUTTERCREAM', color: 'bg-rose-200' }
    ];

    const candleOptions = [
        { id: 'pink-candles', name: '6x PINK CANDLES', color: 'bg-pink-100', price: 4.99 },
        { id: 'blue-candles', name: '6x BLUE CANDLES', color: 'bg-cyan-100', price: 4.99 },
        { id: 'white-candles', name: '6x WHITE CANDLES', color: 'bg-gray-100', price: 4.99 }
    ];

    const boardOptions = [
        { id: 'white', name: 'WHITE BOARD', color: 'bg-white', border: 'border' },
        { id: 'pink', name: 'PINK BOARD', color: 'bg-pink-200' },
        { id: 'blue', name: 'BLUE BOARD', color: 'bg-cyan-200' }
    ];

    // Add these options with the other option arrays
    const sizeOptions: SizeOption[] = [
        { id: '6-inch', name: '6-INCH', size: '6"', price: 83.99, priceChange: -12.00, feeds: '8-10' },
        { id: '8-inch', name: '8-INCH', size: '8"', price: 95.99, priceChange: 0, feeds: '16-24' },
        { id: '10-inch', name: '10-INCH', size: '10"', price: 131.99, priceChange: 36.00, feeds: '30-40' }
    ];

    const spongeOptions: SpongeOption[] = [
        { id: 'vanilla', name: 'VANILLA', color: 'bg-amber-50' },
        { id: 'red-velvet', name: 'RED VELVET', color: 'bg-red-900' },
        { id: 'chocolate', name: 'CHOCOLATE', color: 'bg-brown-900' },
        { id: 'salted-caramel', name: 'SALTED CARAMEL', color: 'bg-amber-300' },
        { id: 'raspberry-ripple', name: 'RASPBERRY RIPPLE', color: 'bg-pink-200' },
        { id: 'lemon', name: 'LEMON', color: 'bg-yellow-200' },
        { id: 'rainbow', name: 'RAINBOW', color: 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500', price: 10.00 },
        { id: 'funfetti', name: 'FUNFETTI', color: 'bg-white', price: 10.00 }
    ];

    // Update price handling to maintain number type
    const handleOptionSelect = (optionType: 'outerIcing' | 'filling' | 'candles' | 'board', optionId: string) => {
        setCakeConfig({
            ...cakeConfig,
            [optionType]: optionId
        });

        if (optionType === 'candles' && !cakeConfig.candles) {
            const selectedOption = candleOptions.find(option => option.id === optionId);
            setCakeConfig(prev => ({ ...prev, price: prev.price + (selectedOption?.price || 0) }));
        }

        if (optionType === 'filling' || optionType === 'outerIcing' || optionType === 'board') {
            setTimeout(() => setSelectedPart(null), 500);
        }
    };

    // Update the candles removal handler
    const handleRemoveCandles = () => {
        setCakeConfig(prev => ({
            ...prev,
            candles: null,
            price: prev.price - 4.99
        }));
        setSelectedPart(null);
    };

    const handleSaveDesign = () => {
        setShowJson(true);
    };

    const getCakeJson = () => {
        return JSON.stringify({
            size: cakeConfig.size,
            price: cakeConfig.price,
            design: {
                outerIcing: {
                    type: cakeConfig.outerIcing,
                    name: icingOptions.find(o => o.id === cakeConfig.outerIcing)?.name
                },
                filling: {
                    type: cakeConfig.filling,
                    name: fillingIcingOptions.find(o => o.id === cakeConfig.filling)?.name
                },
                candles: cakeConfig.candles ? {
                    type: cakeConfig.candles,
                    name: candleOptions.find(o => o.id === cakeConfig.candles)?.name
                } : null,
                message: cakeConfig.message || null,
                board: {
                    type: cakeConfig.board,
                    name: boardOptions.find(o => o.id === cakeConfig.board)?.name
                }
            }
        }, null, 2);
    };

    // Add this function to handle JSON download
    const handleDownloadJson = () => {
        const jsonData = {
            size: cakeConfig.size,
            price: cakeConfig.price.toFixed(2),
            sponge: {
                type: cakeConfig.sponge,
                name: spongeOptions.find(o => o.id === cakeConfig.sponge)?.name
            },
            filling: {
                type: cakeConfig.filling,
                name: fillingIcingOptions.find(o => o.id === cakeConfig.filling)?.name
            },
            goo: cakeConfig.goo ? {
                type: cakeConfig.goo,
                name: gooOptions.find(o => o.id === cakeConfig.goo)?.name
            } : null,
            extras: cakeConfig.extras.map(id => ({
                type: id,
                name: extraOptions.find(o => o.id === id)?.name
            })),
            decoration: {
                type: cakeConfig.outerIcing,
                name: icingOptions.find(o => o.id === cakeConfig.outerIcing)?.name
            },
            message: {
                type: cakeConfig.messageType,
                text: cakeConfig.message || null,
                plaqueColor: cakeConfig.messageType === 'piped' ? {
                    type: cakeConfig.plaqueColor,
                    name: plaqueColors.find(c => c.id === cakeConfig.plaqueColor)?.name
                } : null,
                uploadedImage: cakeConfig.messageType === 'edible' ? cakeConfig.uploadedImage : null
            },
            candles: cakeConfig.candles ? {
                type: cakeConfig.candles,
                name: candleOptions.find(o => o.id === cakeConfig.candles)?.name
            } : null,
            board: {
                type: cakeConfig.board,
                name: boardOptions.find(o => o.id === cakeConfig.board)?.name
            }
        };

        // Create and download JSON file
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cake-design-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Render cake visualization
    const renderCake = () => {
        const outerIcingColor = icingOptions.find(option => option.id === cakeConfig.outerIcing)?.color || 'bg-pink-200';
        const spongeColor = spongeOptions.find(option => option.id === cakeConfig.sponge)?.color || 'bg-amber-50';
        const gooColor = gooOptions.find(option => option.id === cakeConfig.goo)?.color;
        const showCandles = cakeConfig.candles !== null;
        const showMessage = cakeConfig.message !== '';

        // Special preview for message customization
        if (selectedPart === 'message' as SelectedPart) {
            const selectedFilling = fillingIcingOptions.find(option => option.id === cakeConfig.filling);
            const fillingColor = selectedFilling?.color || 'bg-pink-200';

            return (
                <div className="relative w-full aspect-square flex items-center justify-center">
                    {/* Large circular preview */}
                    <div className="relative w-[80%] aspect-square rounded-full">
                        {/* Outer ring - using filling color */}
                        <div className={`absolute inset-0 rounded-full ${fillingColor} shadow-lg`}>
                            {/* Center content - plaque color */}
                            <div className={`absolute inset-[15%] rounded-full flex items-center justify-center
                                ${cakeConfig.messageType === 'piped'
                                    ? plaqueColors.find(c => c.id === cakeConfig.plaqueColor)?.color || 'bg-amber-50'
                                    : 'bg-white'
                                }`}
                            >
                                {cakeConfig.messageType === 'edible' && cakeConfig.uploadedImage ? (
                                    <img
                                        src={cakeConfig.uploadedImage}
                                        alt="Uploaded design"
                                        className="w-full h-full object-contain rounded-full"
                                    />
                                ) : (
                                    <div className="text-center text-pink-400 italic p-8">
                                        {cakeConfig.message || "Your message will be piped here..."}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Size indicator */}
                    <div className="absolute bottom-4 right-4 text-2xl font-bold">
                        {cakeConfig.size}
                    </div>

                    {renderCakeControls()}
                </div>
            );
        }

        // Regular cake preview for other sections
        return (
            <div className={`transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'}`}>
                <div className="relative flex justify-center items-center">
                    <div className="relative w-full max-w-md aspect-square">
                        {/* Cake base */}
                        <div className="absolute bottom-0 w-full h-3/4 flex">
                            {/* Left side (sponge layers) */}
                            <div className={`w-1/2 h-full ${spongeColor} flex flex-col`}>
                                {/* Sponge layers */}
                                {Array(5).fill(0).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <div className={`flex-1 ${spongeColor}`} />
                                        {gooColor && <div className={`h-1 ${gooColor}`} />}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Right side (icing) */}
                            <div className={`w-1/2 h-full ${outerIcingColor}`} />
                        </div>

                        {/* Candles with improved styling and animations */}
                        {showCandles && (
                            <div className="absolute w-full flex justify-center -top-16">
                                {Array(6).fill(0).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="mx-3 flex flex-col items-center"
                                    >
                                        {/* Flame animation */}
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                rotate: [-5, 5, -5],
                                                opacity: [0.8, 1, 0.8],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                repeatType: "reverse"
                                            }}
                                            className="relative w-4 h-6"
                                        >
                                            <div className="absolute inset-0 bg-amber-400 rounded-full blur-sm opacity-50" />
                                            <div className="absolute inset-0 bg-amber-300 rounded-full" />
                                        </motion.div>

                                        {/* Candle body */}
                                        <motion.div
                                            className={`w-3 h-24 rounded-full shadow-lg transform -translate-y-1
                                                ${cakeConfig.candles === 'pink-candles' ? 'bg-gradient-to-b from-pink-300 to-pink-200' :
                                                    cakeConfig.candles === 'blue-candles' ? 'bg-gradient-to-b from-blue-300 to-blue-200' :
                                                        'bg-gradient-to-b from-gray-100 to-white'}
                                            `}
                                            whileHover={{ scale: 1.1 }}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Extras */}
                        {cakeConfig.extras.length > 0 && (
                            <div className="absolute inset-x-0 top-1/2 flex justify-center">
                                <div className="relative w-3/4 flex flex-wrap justify-center gap-2">
                                    {cakeConfig.extras.map((extraId, index) => {
                                        const extra = extraOptions.find(opt => opt.id === extraId);
                                        if (!extra) return null;

                                        return (
                                            <motion.div
                                                key={extraId}
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="absolute"
                                                style={{
                                                    top: `${Math.sin(index * (Math.PI / 3)) * 30}%`,
                                                    left: `${50 + Math.cos(index * (Math.PI / 3)) * 30}%`
                                                }}
                                            >
                                                {extraId === 'cookie-dough' && (
                                                    <div className="w-8 h-8 rounded-full bg-amber-200 shadow-md" />
                                                )}
                                                {extraId === 'oreo-crumbs' && (
                                                    <div className="w-2 h-2 rounded-full bg-gray-900 shadow-sm" />
                                                )}
                                                {/* Add similar visualizations for other extras */}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Message */}
                        {(showMessage || selectedPart === 'message') && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className="w-32 h-32 bg-white/90 rounded-full flex justify-center items-center text-sm text-pink-400 p-4 text-center shadow-sm">
                                    {cakeConfig.message || "Your message here..."}
                                </div>
                            </div>
                        )}

                        {/* Size indicator */}
                        <div className="absolute bottom-4 right-4 text-2xl font-bold">
                            {cakeConfig.size}
                        </div>

                        {renderCakeControls()}
                    </div>
                </div>
            </div>
        );
    };

    // Render customization options panel based on selected part
    const renderCustomizationPanel = () => {
        if (!selectedPart) return null;

        switch (selectedPart) {
            case 'cake':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold mb-4">SIZE</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {sizeOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleSizeSelect(option)}
                                        className={`flex flex-col items-center ${cakeConfig.size === option.size ? 'ring-2 ring-pink-500' : ''
                                            }`}
                                    >
                                        <div className={`w-20 h-20 rounded-full border-2 ${cakeConfig.size === option.size ? 'border-pink-500' : 'border-gray-200'
                                            } flex items-center justify-center text-lg font-bold`}>
                                            {option.size}
                                        </div>
                                        <div className="mt-2 text-sm font-medium">{option.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {option.priceChange > 0 ? '+' : ''}£{Math.abs(option.priceChange).toFixed(2)}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                                • Feeds approx. {sizeOptions.find(o => o.size === cakeConfig.size)?.feeds}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold mb-4">SPONGE</h3>
                            <div className="grid grid-cols-4 gap-4">
                                {spongeOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleSpongeSelect(option)}
                                        className="flex flex-col items-center"
                                    >
                                        <div className={`w-16 h-16 ${option.color} rounded border ${cakeConfig.sponge === option.id ? 'ring-2 ring-pink-500' : 'ring-1 ring-gray-200'
                                            }`}>
                                            <div className="h-full flex flex-col">
                                                <div className="flex-1 border-b border-white/20"></div>
                                                <div className="flex-1 border-b border-white/20"></div>
                                                <div className="flex-1 border-b border-white/20"></div>
                                                <div className="flex-1"></div>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs font-medium text-center">{option.name}</div>
                                        {option.price && (
                                            <div className="text-xs text-gray-500">£{option.price.toFixed(2)}</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold mb-4">FILLING ICING</h3>
                            <div className="grid grid-cols-4 gap-4">
                                {fillingIcingOptions.map((option) => (
                                    <motion.div
                                        key={option.id}
                                        whileHover={{ scale: 1.05 }}
                                        className="flex flex-col items-center"
                                    >
                                        <button
                                            onClick={() => handleFillingSelect(option)}
                                            className={`w-20 h-20 relative ${option.color} ${cakeConfig.filling === option.id
                                                ? 'ring-2 ring-pink-500'
                                                : 'ring-1 ring-gray-200'
                                                }`}
                                        />
                                        <p className="text-[10px] font-medium mt-2 text-center max-w-[80px]">
                                            {option.name}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold mb-4">GOO</h3>
                            <div className="grid grid-cols-4 gap-4">
                                {gooOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleGooSelect(option)}
                                        className="flex flex-col items-center"
                                    >
                                        <div className={`w-16 h-4 ${option.color} rounded ${cakeConfig.goo === option.id ? 'ring-2 ring-pink-500' : 'ring-1 ring-gray-200'
                                            }`} />
                                        <div className="mt-2 text-xs font-medium text-center">{option.name}</div>
                                        <div className="text-xs text-gray-500">£{option.price.toFixed(2)}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'outer-icing':
                return (
                    <div>
                        <h3 className="font-bold mb-2">OUTER ICING</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {icingOptions.map(option => (
                                <div key={option.id} className="flex flex-col items-center">
                                    <button
                                        className={`w-12 h-12 ${option.color} ${cakeConfig.outerIcing === option.id ? 'ring-2 ring-pink-500' : 'ring-1 ring-gray-200'} rounded`}
                                        onClick={() => handleOptionSelect('outerIcing', option.id)}
                                    />
                                    <p className="text-xs text-center mt-1">{option.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'filling':
                return (
                    <div className="space-y-8">
                        {/* Filling Icing Section */}
                        <div>
                            <h3 className="font-bold mb-4">FILLING ICING</h3>
                            <div className="grid grid-cols-4 gap-4">
                                {fillingIcingOptions.map((option) => (
                                    <motion.div
                                        key={option.id}
                                        whileHover={{ scale: 1.05 }}
                                        className="flex flex-col items-center"
                                    >
                                        <button
                                            onClick={() => handleFillingSelect(option)}
                                            className={`w-20 h-20 relative ${option.color} ${cakeConfig.filling === option.id
                                                ? 'ring-2 ring-pink-500'
                                                : 'ring-1 ring-gray-200'
                                                }`}
                                        />
                                        <p className="text-[10px] font-medium mt-2 text-center max-w-[80px]">
                                            {option.name}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Goo Section with larger buttons */}
                        <div className="mt-12">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-pink-600">ADD SOME GOO?</h3>
                                <span className="text-sm font-medium text-pink-500">+£2.00 each</span>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {gooOptions.map((option) => (
                                    <motion.button
                                        key={option.id}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => handleGooSelect(option)}
                                        className={`group relative p-8 rounded-xl transition-all ${cakeConfig.goo === option.id
                                            ? 'ring-2 ring-pink-500 shadow-lg bg-pink-50'
                                            : 'ring-1 ring-gray-200 hover:shadow-md hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`w-16 h-16 rounded-full ${option.color} shadow-lg
                                                group-hover:animate-pulse transition-all duration-500`} />
                                            <div className="flex-1 text-left">
                                                <p className="text-lg font-bold">{option.name}</p>
                                                <p className="text-sm text-pink-500 font-medium">+£2.00</p>
                                            </div>
                                            {cakeConfig.goo === option.id ? (
                                                <Check className="w-6 h-6 text-pink-500" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                                                    <span className="text-xl text-pink-500">+</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'message':
                return (
                    <div className="space-y-6">
                        <h3 className="font-bold mb-4">PRINTING & PIPING</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {messageOptions.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleMessageTypeSelect(option)}
                                    className="flex flex-col items-center"
                                >
                                    <div className={`w-16 h-16 bg-white rounded-lg border-2 flex items-center justify-center
                                        ${cakeConfig.messageType === option.id ? 'border-pink-500' : 'border-gray-200'}`}
                                    >
                                        <span className="text-2xl">{option.icon}</span>
                                    </div>
                                    <div className="mt-2 text-xs font-medium text-center">{option.name}</div>
                                    {option.price > 0 && (
                                        <div className="text-xs text-gray-500">£{option.price.toFixed(2)}</div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {cakeConfig.messageType === 'piped' && (
                            <>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-600 mb-2 block">
                                            Enter your message (max 30 characters)
                                        </label>
                                        <input
                                            type="text"
                                            value={cakeConfig.message}
                                            onChange={(e) => setCakeConfig(prev => ({
                                                ...prev,
                                                message: e.target.value.slice(0, 30)
                                            }))}
                                            placeholder="Happy Birthday!"
                                            className="w-full p-3 border rounded-md"
                                            maxLength={30}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold mb-2 block">
                                            PLAQUE COLOUR
                                        </label>
                                        <div className="grid grid-cols-4 gap-3">
                                            {plaqueColors.map((color) => (
                                                <button
                                                    key={color.id}
                                                    onClick={() => setCakeConfig(prev => ({
                                                        ...prev,
                                                        plaqueColor: color.id
                                                    }))}
                                                    className={`w-full aspect-square rounded-full ${color.color} border-2
                                                        ${cakeConfig.plaqueColor === color.id ? 'border-pink-500' : 'border-gray-200'}`}
                                                    title={color.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500 italic">
                                    • (EDIBLE IMAGE not available with PIPED MESSAGE)
                                </div>
                            </>
                        )}

                        {cakeConfig.messageType === 'edible' && (
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                    <input
                                        type="file"
                                        id="image-upload"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (e) => {
                                                    setCakeConfig(prev => ({
                                                        ...prev,
                                                        uploadedImage: e.target?.result as string
                                                    }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="flex flex-col items-center cursor-pointer"
                                    >
                                        {cakeConfig.uploadedImage ? (
                                            <div className="relative w-full aspect-square">
                                                <img
                                                    src={cakeConfig.uploadedImage}
                                                    alt="Uploaded"
                                                    className="w-full h-full object-contain"
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setCakeConfig(prev => ({
                                                            ...prev,
                                                            uploadedImage: null
                                                        }));
                                                    }}
                                                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-600">Drag and drop, or browse</p>
                                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG, AI, EPS, PDF, HEIC</p>
                                                </div>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between pt-4">
                            <button
                                onClick={() => setSelectedPart(null)}
                                className="p-2 hover:bg-gray-100 rounded"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => setSelectedPart(null)}
                                className="p-2 hover:bg-gray-100 rounded"
                            >
                                <Check className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                );

            case 'candles':
                return (
                    <div>
                        <h3 className="font-bold mb-2">CANDLES</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {candleOptions.map(option => (
                                <div key={option.id} className="flex flex-col items-center">
                                    <button
                                        className={`w-12 h-12 ${option.color} ${cakeConfig.candles === option.id ? 'ring-2 ring-pink-500' : 'ring-1 ring-gray-200'} rounded flex flex-col items-center justify-center`}
                                        onClick={() => handleOptionSelect('candles', option.id)}
                                    >
                                        <div className="w-1 h-8 bg-gradient-to-b from-amber-100 to-transparent"></div>
                                    </button>
                                    <p className="text-xs text-center mt-1">{option.name}</p>
                                    <p className="text-xs font-bold">£{option.price}</p>
                                </div>
                            ))}
                            <div className="col-span-3 mt-4">
                                <Button variant="outline" onClick={handleRemoveCandles}>
                                    Remove Candles
                                </Button>
                            </div>
                        </div>
                    </div>
                );

            case 'board':
                return (
                    <div>
                        <h3 className="font-bold mb-2">CAKE BOARD (Colours Depending on Stock Levels)</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {boardOptions.map(option => (
                                <div key={option.id} className="flex flex-col items-center">
                                    <button
                                        className={`w-12 h-12 ${option.color} ${option.border || ''} ${cakeConfig.board === option.id ? 'ring-2 ring-pink-500' : 'ring-1 ring-gray-200'} rounded`}
                                        onClick={() => handleOptionSelect('board', option.id)}
                                    />
                                    <p className="text-xs text-center mt-1">{option.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'extras':
                return (
                    <div>
                        <h3 className="font-bold mb-4">MAKE IT EXTRA</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {extraOptions.map((option) => (
                                <motion.div
                                    key={option.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center"
                                >
                                    <button
                                        onClick={() => handleExtraSelect(option)}
                                        disabled={!option.available}
                                        className={`relative w-full aspect-square rounded-lg transition-all 
                                            ${cakeConfig.extras.includes(option.id)
                                                ? 'ring-2 ring-pink-500'
                                                : 'ring-1 ring-gray-200'
                                            } ${!option.available ? 'opacity-50' : 'hover:shadow-lg'}`}
                                    >
                                        <div className={`absolute inset-0 rounded-lg ${option.color} opacity-20`} />

                                        {/* Add button */}
                                        {!cakeConfig.extras.includes(option.id) && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
                                                <span className="text-lg">+</span>
                                            </div>
                                        )}

                                        {/* Selected checkmark */}
                                        {cakeConfig.extras.includes(option.id) && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 rounded-full shadow-md flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </button>
                                    <p className="text-xs font-medium mt-2 text-center">{option.name}</p>
                                    <p className="text-xs text-gray-600">£{option.price.toFixed(2)}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // Add these handler functions
    const handleSizeSelect = (option: SizeOption) => {
        setCakeConfig(prev => ({
            ...prev,
            size: option.size,
            price: option.price
        }));
    };

    const handleSpongeSelect = (option: SpongeOption) => {
        setCakeConfig(prev => ({
            ...prev,
            sponge: option.id,
            price: prev.price + (option.price || 0)
        }));
    };

    const handleFillingSelect = (option: FillingOption) => {
        setCakeConfig(prev => ({
            ...prev,
            filling: option.id
        }));
    };

    const handleGooSelect = (option: GooOption) => {
        setCakeConfig(prev => ({
            ...prev,
            goo: option.id,
            price: prev.price + option.price
        }));
    };

    const handleExtraSelect = (option: ExtraOption) => {
        setCakeConfig(prev => {
            const extras = prev.extras.includes(option.id)
                ? prev.extras.filter(id => id !== option.id)
                : [...prev.extras, option.id];

            const price = prev.price + (prev.extras.includes(option.id) ? -option.price : option.price);

            return {
                ...prev,
                extras,
                price
            };
        });
    };

    const handleMessageTypeSelect = (option: MessageOption) => {
        setCakeConfig(prev => ({
            ...prev,
            messageType: option.id,
            message: option.id === 'none' ? '' : prev.message,
            price: prev.price + option.price - (
                prev.messageType === 'piped' ? 7.00 :
                    prev.messageType === 'edible' ? 8.00 : 0
            )
        }));
    };

    // Update the bottom controls in the renderCake function
    const renderCakeControls = () => {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6"
            >
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="p-3 rounded-full bg-white/90 backdrop-blur shadow-lg hover:bg-white/95 transition-all"
                >
                    <svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        {isZoomed ? (
                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10h-6" />
                        ) : (
                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        )}
                    </svg>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDownloadJson}
                    className="p-3 rounded-full bg-white/90 backdrop-blur shadow-lg hover:bg-white/95 transition-all"
                >
                    <Download className="w-6 h-6" />
                </motion.button>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
            <div className="flex flex-col md:flex-row w-full max-w-7xl mx-auto gap-8 p-6">
                {/* Left side - Cake Preview */}
                <div className="flex-1 sticky top-6 h-fit">
                    <div className="relative aspect-square w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                        {renderCake()}
                        <div className="absolute bottom-4 left-4 text-sm font-bold text-gray-500">
                            #Personalized-Cake-Ordering-System
                        </div>
                    </div>
                </div>

                {/* Right side - Configuration Panel */}
                <div className="w-full md:w-[400px]">
                    <div className="bg-white rounded-2xl shadow-xl">
                        <div className="p-6 border-b border-gray-100">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                BESPOKE CAKE
                            </h1>
                            <div className="text-2xl font-bold text-gray-900">
                                £{cakeConfig.price.toFixed(2)}
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="p-6">
                                {!selectedPart ? (
                                    // Main menu with updated styling
                                    <div className="space-y-4">
                                        <MenuItem
                                            icon="🍰"
                                            title="CAKE"
                                            subtitle={`${cakeConfig.size}`}
                                            onClick={() => setSelectedPart('cake')}
                                            gradient="from-pink-500 to-rose-500"
                                        />
                                        <MenuItem
                                            icon="🧁"
                                            title="DECORATION"
                                            subtitle="CHOCOLATE BUTTERCREAM"
                                            onClick={() => setSelectedPart('outer-icing')}
                                            gradient="from-purple-500 to-indigo-500"
                                        />
                                        <MenuItem
                                            icon="✍️"
                                            title="PIPING & PRINTING"
                                            subtitle={cakeConfig.message || "PIPED MESSAGE + WHITE CHOCOLATE PLAQUE"}
                                            onClick={() => setSelectedPart('message')}
                                            gradient="from-blue-500 to-cyan-500"
                                        />
                                        <MenuItem
                                            icon="🕯️"
                                            title="FINISHING TOUCHES"
                                            subtitle="6x PINK CANDLES + WHITE CHOCOLATE PLAQUE"
                                            onClick={() => setSelectedPart('candles')}
                                            gradient="from-teal-500 to-emerald-500"
                                        />
                                        <MenuItem
                                            icon="🍪"
                                            title="MAKE IT EXTRA"
                                            subtitle={cakeConfig.extras.length > 0
                                                ? `${cakeConfig.extras.length} extras added`
                                                : "Add special toppings"}
                                            onClick={() => setSelectedPart('extras')}
                                            gradient="from-yellow-500 to-orange-500"
                                        />
                                    </div>
                                ) : (
                                    // Customization panel
                                    <div>
                                        <div className="flex items-center gap-2 mb-6">
                                            <button
                                                onClick={() => setSelectedPart(null)}
                                                className="p-2 hover:bg-pink-50 rounded-full transition-colors"
                                            >
                                                <ArrowLeft className="w-6 h-6 text-pink-600" />
                                            </button>
                                            <h2 className="text-xl font-bold text-gray-900">
                                                {selectedPart.toUpperCase()}
                                            </h2>
                                        </div>
                                        {renderCustomizationPanel()}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100">
                            <button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 text-lg font-bold rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all transform hover:scale-[1.02]">
                                ADD TO CART
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add this CSS to your global styles
const globalStyles = `
    .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: rgba(236, 72, 153, 0.3) transparent;
    }
    
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(236, 72, 153, 0.3);
        border-radius: 3px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: rgba(236, 72, 153, 0.5);
    }
`;

// Update MenuItem component
const MenuItem = ({
    icon,
    title,
    subtitle,
    onClick,
    gradient
}: {
    icon: string;
    title: string;
    subtitle: string;
    onClick: () => void;
    gradient: string;
}) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all transform hover:scale-[1.02] hover:shadow-md`}
        >
            <span className="text-2xl">{icon}</span>
            <div className="flex-1 text-left">
                <div className={`font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                    {title}
                </div>
                <div className="text-sm text-gray-600">{subtitle}</div>
            </div>
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
            </svg>
        </button>
    );
};

export default CakeCustomizer;