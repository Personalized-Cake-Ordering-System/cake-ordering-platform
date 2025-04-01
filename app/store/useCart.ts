import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CakeConfig {
    price: number;
    size: string;
    sponge: string;
    filling: string;
    outerIcing: string;
    imageUrl?: string | null;
    candles: string | null;
    message?: string;
    messageType?: 'none' | 'piped' | 'edible';
    plaqueColor?: string;
    goo: string | null;
    extras: string[];
    board: string;
    name: string;
    description: string;
    type: string;
}

interface CartItem {
    id: string;
    quantity: number;
    config: CakeConfig;
    price: number;
}

interface CartStore {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
}

export const useCart = create<CartStore>()(
    persist(
        (set) => ({
            items: [],
            addToCart: (item) =>
                set((state) => ({
                    items: [...state.items, { ...item, price: item.config.price }]
                })),
            removeFromCart: (id) =>
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id)
                })),
            updateQuantity: (id, quantity) =>
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id ? { ...item, quantity } : item
                    )
                })),
            clearCart: () => set({ items: [] })
        }),
        {
            name: 'cart-storage'
        }
    )
); 