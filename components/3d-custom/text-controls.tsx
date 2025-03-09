"use client"
import React, { useState, ChangeEvent } from 'react';
import { useCustomizationStore } from '../shared/client/stores/customization';
import { Type, Palette, Trash2, Scale, Plus, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';

// Types
interface TextConfig {
    content: string;
    size: number;
    color: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
}

interface Texts {
    [key: string]: TextConfig;
}

interface ColorInputProps {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    label: string;
}

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

// Custom Card Components
const Card: React.FC<CardProps> = ({ children, className = '' }) => (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
        {children}
    </div>
);

const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => (
    <div className={`px-6 py-4 ${className}`}>
        {children}
    </div>
);

const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => (
    <h3 className={`text-xl font-semibold text-gray-900 ${className}`}>
        {children}
    </h3>
);

const CardContent: React.FC<CardProps> = ({ children, className = '' }) => (
    <div className={`px-6 pb-6 ${className}`}>
        {children}
    </div>
);

// Color Input Component
const ColorInput: React.FC<ColorInputProps> = ({ value, onChange, label }) => (
    <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Palette className="w-4 h-4" />
            {label}
        </label>
        <div className="flex items-center gap-3">
            <input
                type="color"
                value={value}
                onChange={onChange}
                className="w-10 h-10 rounded-lg cursor-pointer"
            />
            <input
                type="text"
                value={value.toUpperCase()}
                onChange={onChange}
                className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                pattern="^#[0-9A-Fa-f]{6}$"
            />
        </div>
    </div>
);

export function TextControls() {
    const {
        selectedPart,
        texts,
        addTextToPart,
        removeTextFromPart,
        updateTextConfig,
        clickPosition
    } = useCustomizationStore();

    const [newText, setNewText] = useState<string>('');
    const [textColor, setTextColor] = useState<string>('#000000');
    const [textSize, setTextSize] = useState<number>(0.2); // Smaller initial size
    const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

    if (!selectedPart) return null;

    const handleAddText = () => {
        if (!newText.trim()) return;

        // We provide a default position, but the store will use clickPosition if available
        addTextToPart(selectedPart, {
            content: newText,
            size: textSize,
            color: textColor,
            position: { x: 0, y: 0, z: 0 }, // Will be overridden by clickPosition in the store
            rotation: { x: 0, y: 0, z: 0 }
        });

        setNewText('');
    };

    const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewText(e.target.value);
    };

    const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTextColor(e.target.value);
    };

    const handleSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTextSize(parseFloat(e.target.value));
    };

    // Get all text items for the selected part
    const partTexts = Object.entries(texts as Texts)
        .filter(([id]) => id.startsWith(selectedPart));

    // Function to update text position
    const updateTextPosition = (direction: 'up' | 'down' | 'left' | 'right' | 'forward' | 'backward') => {
        if (!selectedTextId || !texts[selectedTextId]) return;

        const selectedText = texts[selectedTextId];
        const newPosition = { ...selectedText.position };
        const step = 0.1; // Small step for precise positioning

        switch (direction) {
            case 'up':
                newPosition.y += step;
                break;
            case 'down':
                newPosition.y -= step;
                break;
            case 'left':
                newPosition.x -= step;
                break;
            case 'right':
                newPosition.x += step;
                break;
            case 'forward':
                newPosition.z += step;
                break;
            case 'backward':
                newPosition.z -= step;
                break;
        }

        // Use the store's updateTextConfig method to update the position
        updateTextConfig(selectedTextId, { position: newPosition });
    };

    // Function to update text rotation
    const updateTextRotation = (axis: 'x' | 'y' | 'z', direction: 1 | -1) => {
        if (!selectedTextId || !texts[selectedTextId]) return;

        const selectedText = texts[selectedTextId];
        const newRotation = { ...selectedText.rotation };
        const step = 0.1; // Small step for rotation (in radians)

        newRotation[axis] += step * direction;

        // Use the store's updateTextConfig method to update the rotation
        updateTextConfig(selectedTextId, { rotation: newRotation });
    };

    // Add debug information showing the click position
    const positionInfo = clickPosition ?
        `Click Position: X:${clickPosition.x.toFixed(2)} Y:${clickPosition.y.toFixed(2)} Z:${clickPosition.z.toFixed(2)}` :
        'No click position yet';

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Text Controls
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    {/* Click position debug info */}
                    <div className="p-2 bg-gray-100 rounded text-xs font-mono">
                        {positionInfo}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Text Content
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newText}
                                onChange={handleTextChange}
                                placeholder="Enter your text here..."
                                className="flex-1 px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleAddText}
                                disabled={!newText.trim()}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>
                    </div>

                    <ColorInput
                        value={textColor}
                        onChange={handleColorChange}
                        label="Text Color"
                    />

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Scale className="w-4 h-4" />
                            Text Size
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="0.05"
                                max="0.5"
                                step="0.05"
                                value={textSize}
                                onChange={handleSizeChange}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <span className="w-12 text-sm text-gray-600 tabular-nums">
                                {textSize.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Applied Texts</h4>
                    <div className="space-y-2">
                        {partTexts.map(([id, config]) => (
                            <div
                                key={id}
                                className={`flex items-center justify-between p-3 ${selectedTextId === id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'} rounded-lg hover:bg-gray-100 transition-colors cursor-pointer`}
                                onClick={() => setSelectedTextId(id === selectedTextId ? null : id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: config.color }}
                                    />
                                    <span className="text-sm text-gray-700">
                                        {config.content}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeTextFromPart(selectedPart, id);
                                        if (selectedTextId === id) setSelectedTextId(null);
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                                    aria-label="Remove text"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedTextId && (
                    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <h4 className="text-sm font-medium text-gray-700">Position Controls</h4>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-start-2">
                                <button
                                    onClick={() => updateTextPosition('up')}
                                    className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 flex justify-center"
                                >
                                    <ArrowUp className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="col-start-1 row-start-2">
                                <button
                                    onClick={() => updateTextPosition('left')}
                                    className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 flex justify-center"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="col-start-3 row-start-2">
                                <button
                                    onClick={() => updateTextPosition('right')}
                                    className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 flex justify-center"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="col-start-2 row-start-3">
                                <button
                                    onClick={() => updateTextPosition('down')}
                                    className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 flex justify-center"
                                >
                                    <ArrowDown className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button
                                onClick={() => updateTextPosition('backward')}
                                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Backward (Z-)
                            </button>

                            <button
                                onClick={() => updateTextPosition('forward')}
                                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Forward (Z+)
                            </button>
                        </div>

                        <h4 className="text-sm font-medium text-gray-700 mt-4">Rotation Controls</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <button
                                    onClick={() => updateTextRotation('x', 1)}
                                    className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 flex justify-center"
                                >
                                    <RotateCw className="w-4 h-4" /> X+
                                </button>
                            </div>

                            <div>
                                <button
                                    onClick={() => updateTextRotation('y', 1)}
                                    className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 flex justify-center"
                                >
                                    <RotateCw className="w-4 h-4" /> Y+
                                </button>
                            </div>

                            <div>
                                <button
                                    onClick={() => updateTextRotation('z', 1)}
                                    className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 flex justify-center"
                                >
                                    <RotateCw className="w-4 h-4" /> Z+
                                </button>
                            </div>

                            <div>
                                <button
                                    onClick={() => updateTextRotation('x', -1)}
                                    className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 flex justify-center"
                                >
                                    <RotateCw className="w-4 h-4 transform rotate-180" /> X-
                                </button>
                            </div>

                            <div>
                                <button
                                    onClick={() => updateTextRotation('y', -1)}
                                    className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 flex justify-center"
                                >
                                    <RotateCw className="w-4 h-4 transform rotate-180" /> Y-
                                </button>
                            </div>

                            <div>
                                <button
                                    onClick={() => updateTextRotation('z', -1)}
                                    className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 flex justify-center"
                                >
                                    <RotateCw className="w-4 h-4 transform rotate-180" /> Z-
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default TextControls;