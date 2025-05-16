import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CakeConfig as TypedCakeConfig } from '@/types/cake';
import { CartItem as TypedCartItem } from '@/types/cart';

// Extended CakeConfig that includes the fields from the API
interface CakeConfig extends TypedCakeConfig {
    name: string;
    description: string;
    type: string;
}

// Ensure CartItem matches the type definition
interface CartItem extends TypedCartItem {
    config: CakeConfig;
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