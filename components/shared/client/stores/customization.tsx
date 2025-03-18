import { create } from 'zustand';

interface TextConfig {
    content: string;
    size: number;
    color: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
}

interface TextureConfig {
    texture: string;
    repeat: number;
    rotation: number;
}

interface ToppingConfig {
    model: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: number;
}

interface ImageConfig {
    url: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: number;
}

interface CustomizationStore {
    selectedPart: string | null;
    clickPosition: { x: number; y: number; z: number } | null;
    colors: Record<string, string>;
    customizedParts: string[]; // Track which parts have been customized
    textures: Record<string, TextureConfig>;
    texts: Record<string, TextConfig>;
    toppings: Record<string, ToppingConfig[]>;
    images: Record<string, ImageConfig[]>;
    scale: number;
    roughness: number;
    metalness: number;
    animationSpeed: number;
    isPlaying: boolean;

    setSelectedPart: (part: string | null) => void;
    setClickPosition: (position: { x: number; y: number; z: number } | null) => void;
    setColorForPart: (part: string, color: string, isCustom?: boolean) => void;
    setTextureForPart: (part: string, config: TextureConfig) => void;
    removeTextureFromPart: (part: string) => void;
    addTextToPart: (part: string, config: TextConfig) => void;
    removeTextFromPart: (part: string, textId: string) => void;
    updateTextConfig: (textId: string, config: Partial<TextConfig>) => void;
    addToppingToPart: (part: string, config: ToppingConfig) => void;
    removeToppingFromPart: (part: string, index: number) => void;
    addImageToPart: (part: string, config: ImageConfig) => void;
    removeImageFromPart: (part: string, index: number) => void;
    updateImageConfig: (part: string, index: number, config: Partial<ImageConfig>) => void;
    setScale: (scale: number) => void;
    setRoughness: (roughness: number) => void;
    setMetalness: (metalness: number) => void;
    setAnimationSpeed: (speed: number) => void;
    setIsPlaying: (isPlaying: boolean) => void;
}

export const useCustomizationStore = create<CustomizationStore>((set) => ({
    selectedPart: null,
    clickPosition: null,
    colors: {},  // We'll populate this with original colors from the model
    customizedParts: [], // Track which parts have been customized by the user
    textures: {},
    texts: {},
    toppings: {},
    images: {},
    scale: 1,
    roughness: 0.3,
    metalness: 0.1,
    animationSpeed: 0.5,
    isPlaying: true,

    setSelectedPart: (part) => set({ selectedPart: part }),

    setClickPosition: (position) => set({ clickPosition: position }),

    setColorForPart: (part, color, isCustom = true) => set((state) => {
        // Only add to customizedParts if this is a custom color change and not already in the list
        const customizedParts = isCustom && !state.customizedParts.includes(part)
            ? [...state.customizedParts, part]
            : state.customizedParts;

        return {
            colors: { ...state.colors, [part]: color },
            customizedParts
        };
    }),

    setTextureForPart: (part, config) => set((state) => ({
        textures: { ...state.textures, [part]: config },
        // When a texture is set, also mark the part as customized
        customizedParts: !state.customizedParts.includes(part)
            ? [...state.customizedParts, part]
            : state.customizedParts
    })),

    removeTextureFromPart: (part) => set((state) => {
        const newTextures = { ...state.textures };
        delete newTextures[part];
        return { textures: newTextures };
    }),

    addTextToPart: (part, config) => set((state) => {
        // Use clicked position when available, otherwise use provided position or default
        const position = state.clickPosition || config.position || { x: 0, y: 1.5, z: 0 };

        // Create a new unique ID for the text using part name and timestamp
        const textId = `${part}`;

        return {
            texts: {
                ...state.texts,
                [textId]: {
                    ...config,
                    position // Use the actual clicked position
                }
            }
        };
    }),

    removeTextFromPart: (part, textId) => set((state) => {
        const newTexts = { ...state.texts };
        delete newTexts[textId];
        return { texts: newTexts };
    }),

    updateTextConfig: (textId, config) => set((state) => ({
        texts: {
            ...state.texts,
            [textId]: { ...state.texts[textId], ...config }
        }
    })),

    addToppingToPart: (part, config) => set((state) => ({
        toppings: {
            ...state.toppings,
            [part]: [...(state.toppings[part] || []), config]
        },
        // Mark part as customized when adding toppings
        customizedParts: !state.customizedParts.includes(part)
            ? [...state.customizedParts, part]
            : state.customizedParts
    })),

    removeToppingFromPart: (part, index) => set((state) => ({
        toppings: {
            ...state.toppings,
            [part]: state.toppings[part]?.filter((_, i) => i !== index) || []
        }
    })),

    addImageToPart: (part, config) => set((state) => ({
        images: {
            ...state.images,
            [part]: [...(state.images[part] || []), config]
        },
        // Mark part as customized when adding images
        customizedParts: !state.customizedParts.includes(part)
            ? [...state.customizedParts, part]
            : state.customizedParts
    })),

    removeImageFromPart: (part, index) => set((state) => ({
        images: {
            ...state.images,
            [part]: state.images[part]?.filter((_, i) => i !== index) || []
        }
    })),

    updateImageConfig: (part, index, config) => set((state) => ({
        images: {
            ...state.images,
            [part]: state.images[part]?.map((img, i) =>
                i === index ? { ...img, ...config } : img
            ) || []
        }
    })),

    setScale: (scale) => set({ scale }),
    setRoughness: (roughness) => set({ roughness }),
    setMetalness: (metalness) => set({ metalness }),
    setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),
    setIsPlaying: (isPlaying) => set({ isPlaying })
}));