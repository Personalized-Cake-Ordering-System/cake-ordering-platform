import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CakeConfig } from '@/types/cake';

interface CakeConfigStore {
    config: CakeConfig;
    setConfig: (configOrUpdater: Partial<CakeConfig> | ((prev: CakeConfig) => Partial<CakeConfig>)) => void;
    resetConfig: () => void;
}

const defaultConfig: CakeConfig = {
    size: '',
    price: 95.99,
    sponge: 'vanilla',
    outerIcing: [],
    filling: 'white-vanilla',
    icing: '',
    topping: null,
    message: '',
    candles: null,
    board: 'white',
    goo: null,
    extras: [],
    messageType: 'none',
    plaqueColor: 'white',
    uploadedImage: null,
    imageUrl: null,
    pipingColor: 'white'
};

export const useCakeConfigStore = create<CakeConfigStore>()(
    persist(
        (set) => ({
            config: defaultConfig,
            setConfig: (configOrUpdater) => set((state) => ({
                config: {
                    ...state.config,
                    ...(typeof configOrUpdater === 'function'
                        ? configOrUpdater(state.config)
                        : configOrUpdater)
                }
            })),
            resetConfig: () => set({ config: defaultConfig }),
        }),
        {
            name: 'cake-config-storage',
        }
    )
); 