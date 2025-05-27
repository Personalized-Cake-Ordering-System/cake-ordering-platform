"use client"
import React from 'react';
import { useCustomizationStore } from '../shared/client/stores/customization';
import { Play, Pause, Download, Upload, Palette, LucideIcon } from 'lucide-react';
import { ToastContainer } from './toast-save-show'; // Import the toast component
import { useCakeConfigStore } from '../shared/client/stores/cake-config';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface SliderProps {
    label: string;
    value: number;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    min: number;
    max: number;
    step: number;
    icon?: LucideIcon;
}

export function Controls() {
    const {
        selectedPart,
        colors,
        scale,
        roughness,
        metalness,
        animationSpeed,
        isPlaying,
        textures,
        texts,
        toppings,
        images,
        setColorForPart,
        setScale,
        setRoughness,
        setMetalness,
        setAnimationSpeed,
        setIsPlaying,
        setTextureForPart,
        removeTextFromPart,
        addTextToPart,
        addImageToPart,
        removeImageFromPart,
        addToppingToPart,
        removeToppingFromPart
    } = useCustomizationStore();
    const { config, setConfig } = useCakeConfigStore();

    const exportConfig = () => {
        try {
            const config = {
                colors,
                scale,
                roughness,
                metalness,
                animationSpeed,
                isPlaying,
                textures,
                texts,
                toppings,
                images
            };

            const blob = new Blob([JSON.stringify(config)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cake-config.json';
            a.click();
            URL.revokeObjectURL(url);

            // Show success toast
            window.showToast('Design saved successfully!', 'success');
        } catch (error) {
            console.error('Failed to save design:', error);
            // Show error toast
            window.showToast('Failed to save design. Please try again.', 'error');
        }
    };

    const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const config = JSON.parse(e.target?.result as string);

                    // Clear existing texts, images, and toppings before loading new ones
                    // First, remove all existing texts
                    Object.keys(texts).forEach(textId => {
                        removeTextFromPart('', textId);
                    });

                    // Remove all existing images from each part
                    Object.entries(images).forEach(([part, partImages]) => {
                        partImages.forEach(() => {
                            removeImageFromPart(part, 0);
                        });
                    });

                    // Remove all existing toppings from each part
                    Object.entries(toppings).forEach(([part, partToppings]) => {
                        partToppings.forEach(() => {
                            removeToppingFromPart(part, 0);
                        });
                    });

                    // Apply colors
                    Object.entries(config.colors).forEach(([part, color]) => {
                        setColorForPart(part, color as string);
                    });

                    // Apply textures
                    Object.entries(config.textures).forEach(([part, textureConfig]) => {
                        setTextureForPart(part, textureConfig as any);
                    });

                    // Apply texts
                    Object.entries(config.texts).forEach(([textId, textConfig]) => {
                        // We don't use addTextToPart here as it would generate a new ID
                        // Instead, we directly update the store to keep the original textId
                        const store = useCustomizationStore.getState();
                        useCustomizationStore.setState({
                            texts: {
                                ...store.texts,
                                [textId]: textConfig as any
                            }
                        });
                    });

                    // Apply images
                    Object.entries(config.images || {}).forEach(([part, imageConfigs]) => {
                        (imageConfigs as any[]).forEach(imageConfig => {
                            addImageToPart(part, imageConfig);
                        });
                    });

                    // Apply toppings
                    Object.entries(config.toppings || {}).forEach(([part, toppingConfigs]) => {
                        (toppingConfigs as any[]).forEach(toppingConfig => {
                            addToppingToPart(part, toppingConfig);
                        });
                    });

                    // Apply basic properties
                    setScale(config.scale);
                    setRoughness(config.roughness);
                    setMetalness(config.metalness);
                    setAnimationSpeed(config.animationSpeed);
                    setIsPlaying(config.isPlaying);

                    // Show success toast
                    window.showToast('Design loaded successfully!', 'success');
                } catch (error) {
                    console.error('Failed to load design:', error);
                    // Show error toast
                    window.showToast('Failed to load design. The file might be corrupted.', 'error');
                }
            };

            reader.onerror = () => {
                window.showToast('Error reading the file. Please try again.', 'error');
            };

            reader.readAsText(file);
        }
    };

    const Slider: React.FC<SliderProps> = ({
        label,
        value,
        onChange,
        min,
        max,
        step,
        icon: Icon
    }) => (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    {Icon && <Icon size={16} className="text-teal-600" />}
                    {label}
                </label>
                <span className="text-sm text-gray-500">{value.toFixed(1)}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={onChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                         accent-teal-600 hover:accent-teal-700 transition-all"
            />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Cake Size */}
            <div className="space-y-2">
                <Label>Cake Size</Label>
                <Select value={config.size} onValueChange={(value) => setConfig({ ...config, size: value })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="6">6&quot; (serves 8-10)</SelectItem>
                        <SelectItem value="8">8&quot; (serves 12-15)</SelectItem>
                        <SelectItem value="10">10&quot; (serves 20-25)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Sponge Type */}
            <div className="space-y-2">
                <Label>Sponge Type</Label>
                <Select value={config.sponge} onValueChange={(value) => setConfig({ ...config, sponge: value })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select sponge" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="vanilla">Vanilla</SelectItem>
                        <SelectItem value="chocolate">Chocolate</SelectItem>
                        <SelectItem value="red-velvet">Red Velvet</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Outer Icing */}
            <div className="space-y-2">
                <Label>Outer Icing</Label>
                {/* <Select value={config.outerIcing} onValueChange={(value) => setConfig({ ...config, outerIcing: value })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select icing" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="white-vanilla">White Vanilla</SelectItem>
                        <SelectItem value="pink-vanilla">Pink Vanilla</SelectItem>
                        <SelectItem value="blue-vanilla">Blue Vanilla</SelectItem>
                        <SelectItem value="yellow-vanilla">Yellow Vanilla</SelectItem>
                    </SelectContent>
                </Select> */}
            </div>

            {/* 3D View Controls */}
            <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">3D View Settings</h3>

                <div className="space-y-2">
                    <Label>Model Scale</Label>
                    <Slider
                        label="Model Scale"
                        value={scale}
                        onChange={(e) => setScale(Number(e.target.value))}
                        min={0.5}
                        max={2}
                        step={0.1}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Rotation Speed</Label>
                    <Slider
                        label="Rotation Speed"
                        value={animationSpeed}
                        onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                        min={0}
                        max={2}
                        step={0.1}
                    />
                </div>

                <Button
                    onClick={() => setIsPlaying(!isPlaying)}
                    variant={isPlaying ? "secondary" : "default"}
                >
                    {isPlaying ? "Stop Rotation" : "Start Rotation"}
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                    onClick={exportConfig}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 
                             text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
                >
                    <Download size={16} />
                    Save Design
                </button>
                <label className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 
                                text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 
                                cursor-pointer">
                    <Upload size={16} />
                    Load Design
                    <input
                        type="file"
                        accept=".json"
                        onChange={importConfig}
                        className="hidden"
                    />
                </label>
            </div>

            {/* Toast container for notifications */}
            <ToastContainer />
        </div>
    );
}