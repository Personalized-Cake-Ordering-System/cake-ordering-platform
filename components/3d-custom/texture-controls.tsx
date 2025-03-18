"use client"
import * as React from 'react';
import { Sliders, Move, Repeat, Maximize, X } from 'lucide-react';
import { useCustomizationStore } from '../shared/client/stores/customization';
import Image from 'next/image';

interface TextureOption {
    id: string;
    path: string;
    name: string;
}

export function TextureControls() {
    const {
        selectedPart,
        textures,
        setTextureForPart,
        removeTextureFromPart
    } = useCustomizationStore();

    const textureOptions: TextureOption[] = [
        { id: 'sprinkles', path: '/imagecake.jpg', name: 'Sprinkles' },
        { id: 'chocolate', path: '/imagecake1.jpeg', name: 'Chocolate' },
        { id: 'marble', path: '/imagecake2.jpeg', name: 'Marble' },
        { id: 'dots', path: '/imagecake3.jpg', name: 'Dots' }
    ];

    if (!selectedPart) return null;

    const currentTexture = textures[selectedPart];

    const handleTextureSelect = (texturePath: string) => {
        setTextureForPart(selectedPart, {
            texture: texturePath,
            rotation: 0,
            repeat: 1
        });
    };

    return (
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Sliders className="w-5 h-5" />
                        Texture Controls
                    </h2>
                    {currentTexture && (
                        <button
                            onClick={() => removeTextureFromPart(selectedPart)}
                            className="text-gray-500 hover:text-red-500"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4 space-y-6">
                <div className="grid grid-cols-2 gap-3">
                    {textureOptions.map((texture) => (
                        <button
                            key={texture.id}
                            onClick={() => handleTextureSelect(texture.path)}
                            className={`relative overflow-hidden rounded-lg transition-all duration-200 
                                ${currentTexture?.texture === texture.path
                                    ? 'ring-2 ring-blue-500'
                                    : 'hover:ring-2 hover:ring-blue-400'}`}
                        >
                            <div className="aspect-square w-full">
                                <Image
                                    src={texture.path}
                                    alt={texture.name}
                                    className="w-full h-full object-cover"
                                    width={200}
                                    height={200}
                                />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                                <span className="block text-sm font-medium text-white text-center">
                                    {texture.name}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                {currentTexture && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Maximize className="w-4 h-4" />
                                Scale
                            </label>
                           
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Move className="w-4 h-4" />
                                Rotation
                            </label>
                            <input
                                type="range"
                                min={0}
                                max={360}
                                value={currentTexture.rotation}
                                onChange={(e) => setTextureForPart(selectedPart, {
                                    ...currentTexture,
                                    rotation: parseInt(e.target.value)
                                })}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Repeat className="w-4 h-4" />
                                Repeat
                            </label>
                            <input
                                type="range"
                                min={1}
                                max={10}
                                value={currentTexture.repeat}
                                onChange={(e) => setTextureForPart(selectedPart, {
                                    ...currentTexture,
                                    repeat: parseInt(e.target.value)
                                })}
                                className="w-full"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}